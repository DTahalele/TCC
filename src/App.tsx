/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  ScoreCardRecord,
  CustomerType,
  ScoreLevel,
  INITIAL_RECORD,
} from './types/scoreCard';
import {
  calculateAge,
  calculateBMI,
  getBMICategory,
  getScoreCategory,
  calculateAverage,
  generateMemberId,
  computeCompletion,
  getTodayDateString,
} from './utils/calculations';
import {
  getStoredRecords,
  setStoredRecords,
  saveOrUpdateRecord,
  deleteStoredRecord,
  getGoogleSheetUrl,
  hasGoogleSheetUrlConfigured,
  isDatabaseConnected,
  setDatabaseConnected,
  isTestRecord,
} from './utils/storage';
import { syncRecordToGoogleSheet, syncAllRecordsToGoogleSheet, fetchRecordsFromGoogleSheet } from './utils/googleSheets';

import { Header } from './components/Header';
import { EntryTypeSelector } from './components/EntryTypeSelector';
import { ProgressBar } from './components/ProgressBar';
import { PersonalDataSection } from './components/PersonalDataSection';
import { BodyCompositionSection } from './components/BodyCompositionSection';
import { ScoringSection, ScoreItemConfig } from './components/ScoringSection';
import { CoachNotesSection } from './components/CoachNotesSection';
import { DataSummarySection } from './components/DataSummarySection';
import { DisclaimerSection } from './components/DisclaimerSection';
import { FooterActions } from './components/FooterActions';

import { ArchiveModal } from './components/ArchiveModal';
import { MemberPickerModal } from './components/MemberPickerModal';
import { GoogleSheetModal } from './components/GoogleSheetModal';
import { BMICalculatorModal } from './components/BMICalculatorModal';
import { PrintView } from './components/PrintView';
import { AuthGate } from './components/AuthGate';
import { UpcomingTrialTab } from './components/UpcomingTrialTab';
import { TrialRegistrationModal } from './components/TrialRegistrationModal';
import { TrialReviewModal } from './components/TrialReviewModal';
import { TrialConfirmationPrintView } from './components/TrialConfirmationPrintView';
import { TrialRegistrationRecord, TrialCustomerType } from './types/trialRegistration';
import {
  getStoredTrials,
  saveNewTrial,
  updateExistingTrial,
  deleteStoredTrial,
  getUpcomingTrialsWindow,
  syncTrialToGoogleSheet,
  syncAllTrialsToGoogleSheet,
  fetchTrialsFromGoogleSheet,
} from './utils/trialStorage';
import { WhitelistUser, AuthSession } from './types/auth';
import {
  getCurrentSession,
  saveAuthSession,
  logout as performLogout,
  isCurrentSessionValid,
  syncWhitelistFromGoogleSheet,
} from './utils/auth';
import { syncManager, SyncStatus } from './utils/syncManager';

export default function App() {
  // Authentication session state
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => getCurrentSession());

  // Uniform theme state: Consistent light clinical theme default across all devices & browsers
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('tcc_scorecard_darkmode');
      if (saved !== null) {
        return saved === 'true';
      }
      return false;
    } catch {
      return false;
    }
  });

  // Real-time synchronization status across all devices
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => syncManager.getStatus());

  // Tab & Modal states
  const [currentTab, setCurrentTab] = useState<'form' | 'archive' | 'upcoming_trial'>('form');
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isMemberPickerOpen, setIsMemberPickerOpen] = useState(false);
  const [isGoogleSheetModalOpen, setIsGoogleSheetModalOpen] = useState(false);
  const [isBMIRefOpen, setIsBMIRefOpen] = useState(false);

  // Stored Records
  const [records, setRecords] = useState<ScoreCardRecord[]>([]);

  // Trial Registrations State
  const [trials, setTrials] = useState<TrialRegistrationRecord[]>(() => getStoredTrials());
  const [isTrialRegistrationModalOpen, setIsTrialRegistrationModalOpen] = useState(false);
  const [isTrialReviewModalOpen, setIsTrialReviewModalOpen] = useState(false);
  const [isTrialPrintOpen, setIsTrialPrintOpen] = useState(false);
  const [selectedTrialForReview, setSelectedTrialForReview] = useState<TrialRegistrationRecord | null>(null);
  const [selectedTrialForPrint, setSelectedTrialForPrint] = useState<TrialRegistrationRecord | null>(null);
  const [editingTrialRecord, setEditingTrialRecord] = useState<TrialRegistrationRecord | null>(null);
  const [trialRegistrationType, setTrialRegistrationType] = useState<TrialCustomerType>('Trial Adults');
  const [trialModalInitialSection, setTrialModalInitialSection] = useState<'profil' | 'riwayat' | 'medis' | 'asesmen'>('profil');

  // Compute live upcoming trial metrics (window 7 hari & hari ini)
  const upcomingMetrics = useMemo(() => getUpcomingTrialsWindow(trials), [trials]);

  // 1. List khusus Member TCC dari rekaman Score Card / Arsip
  const memberTCCRecords = useMemo(() => {
    return records.filter((r) => {
      if (isTestRecord(r)) return false;
      const c = String(r.Customer_type || '').toLowerCase();
      const e = String(r.entry_type || '').toLowerCase();
      return c === 'member' || c === 'member tcc' || e === 'member';
    });
  }, [records]);

  // 2. List calon peserta dari tab Upcoming Trial yang sudah di-upgrade statusnya menjadi "Member TCC"
  const upgradedTrialMembers = useMemo(() => {
    return trials
      .filter((t) => t.trial_status === 'Member TCC')
      .map((t): ScoreCardRecord => ({
        ...INITIAL_RECORD,
        id: `rec-trial-${t.id}`,
        createdAt: t.createdAt || new Date().toISOString(),
        updatedAt: t.updatedAt || new Date().toISOString(),
        entry_type: 'member',
        Customer_type: 'member',
        Full_Name: t.Full_Name,
        Gender: String(t.Gender || '').toLowerCase() === 'female' ? 'female' : 'male',
        DoB: t.DoB || '',
        Umur: t.Umur ?? calculateAge(t.DoB),
        MemberID: t.converted_member_id || t.MemberID,
        Test_Date: t.Trial_Date || (t.createdAt ? String(t.createdAt).split('T')[0] : '2026-10-18'),
        Coaches: Array.isArray(t.Coaches) && t.Coaches.length > 0 ? t.Coaches.join(', ') : 'Mariskha Primasari',
        notes: `Member TCC (Dikonversi dari Trial ${t.Customer_type}) [Ref ID: ${t.MemberID}]`,
      }));
  }, [trials]);

  // 3. Sinkronisasi terpadu: HANYA nama-nama yang ada didalam list "Arsip Member TCC"
  //    DAN nama-nama di tab "Upcoming Trial" yang statusnya sudah di-upgrade menjadi "Member TCC"
  const confirmedMemberTCCList = useMemo(() => {
    const map = new Map<string, ScoreCardRecord>();

    // A. Masukkan seluruh member dari Arsip Member TCC
    memberTCCRecords.forEach((r) => {
      const key = (r.MemberID && r.MemberID.trim())
        ? r.MemberID.trim().toLowerCase()
        : r.Full_Name.trim().toLowerCase();
      if (key) {
        map.set(key, r);
      }
    });

    // B. Masukkan customer dari Upcoming Trial yang sudah di-upgrade ke Member TCC (jika belum tercatat di Arsip)
    upgradedTrialMembers.forEach((r) => {
      const key = (r.MemberID && r.MemberID.trim())
        ? r.MemberID.trim().toLowerCase()
        : r.Full_Name.trim().toLowerCase();
      if (key && !map.has(key)) {
        map.set(key, r);
      }
    });

    return Array.from(map.values());
  }, [memberTCCRecords, upgradedTrialMembers]);

  // Form State
  const [formData, setFormData] = useState<ScoreCardRecord>(() => ({
    ...INITIAL_RECORD,
    id: `rec-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    MemberID: generateMemberId(),
    Test_Date: getTodayDateString(),
  }));

  // Track if current form is editing an existing row
  const [isEditing, setIsEditing] = useState(false);
  const [editingRowOriginalId, setEditingRowOriginalId] = useState<string | null>(null);

  // Submission / sync state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRefreshingArchive, setIsRefreshingArchive] = useState(false);
  const [isSyncingTrials, setIsSyncingTrials] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Dedicated state for isolated single-customer scorecard printing
  const [recordToPrint, setRecordToPrint] = useState<ScoreCardRecord | null>(null);

  // Initialize records & trials on mount & auto-sync from multi-tier cloud & server database
  useEffect(() => {
    // 1. Initial cached records
    setRecords(getStoredRecords());
    setTrials(getStoredTrials());

    // 2. Subscribe to real-time data updates from syncManager (Server / Google Sheets / Cross-device)
    const unsubData = syncManager.subscribeData(({ records: newRecords, trials: newTrials }) => {
      if (newRecords && newRecords.length > 0) {
        setRecords(newRecords);
      }
      if (newTrials && newTrials.length > 0) {
        setTrials(newTrials);
      }
      setHasSheetUrl(hasGoogleSheetUrlConfigured());
      setIsSheetConnected(isDatabaseConnected());
    });

    // 3. Subscribe to sync status
    const unsubStatus = syncManager.subscribeStatus((status) => {
      setSyncStatus(status);
      setHasSheetUrl(hasGoogleSheetUrlConfigured());
      setIsSheetConnected(isDatabaseConnected());
    });

    // 4. Start auto-sync engine (initial mount, visibility change on Android/iOS, window focus, recurring heartbeat)
    syncManager.initAutoSync();

    return () => {
      unsubData();
      unsubStatus();
    };
  }, []);

  // Sync dark mode class and persist to localStorage
  useEffect(() => {
    try {
      if (darkMode) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
        localStorage.setItem('tcc_scorecard_darkmode', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
        localStorage.setItem('tcc_scorecard_darkmode', 'false');
      }
    } catch {
      // Ignore storage errors in restricted iframes
    }
  }, [darkMode]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Periodic / background whitelist check to ensure revoked emails immediately lose access
  useEffect(() => {
    if (authSession) {
      syncWhitelistFromGoogleSheet().then((res) => {
        if (res.success && authSession) {
          if (!isCurrentSessionValid(authSession)) {
            performLogout();
            setAuthSession(null);
            setToastMessage({
              text: 'Akses akun Anda telah dinonaktifkan atau dihapus dari whitelist oleh Administrator.',
              type: 'error',
            });
          }
        }
      });
    }
  }, [authSession]);

  // Otomatis sinkronkan data saat user login, berpindah tab, atau kembali ke halaman
  useEffect(() => {
    syncManager.performFullSync({ silent: true });
  }, [authSession, currentTab]);

  const handleManualSync = async () => {
    const res = await syncManager.performFullSync();
    if (res.recordsUpdated || res.trialsUpdated) {
      setToastMessage({
        text: '✓ Data berhasil disinkronkan ke versi terbaru dari cloud!',
        type: 'success',
      });
    } else {
      setToastMessage({
        text: '✓ Semua data sudah dalam kondisi tersinkron paling mutakhir.',
        type: 'info',
      });
    }
  };

  const handleLogout = () => {
    performLogout();
    setAuthSession(null);
    setToastMessage({
      text: 'Anda telah berhasil keluar dari akun.',
      type: 'info',
    });
  };

  const [hasSheetUrl, setHasSheetUrl] = useState<boolean>(() => hasGoogleSheetUrlConfigured());
  const [isSheetConnected, setIsSheetConnected] = useState<boolean>(() => isDatabaseConnected());

  const handleUrlUpdated = () => {
    const configured = hasGoogleSheetUrlConfigured();
    setHasSheetUrl(configured);
    setIsSheetConnected(isDatabaseConnected());
    // Also re-sync whitelist with the new URL
    syncWhitelistFromGoogleSheet();
    setToastMessage({
      text: configured
        ? '✓ Konfigurasi URL Google Sheet berhasil diperbarui & tersambung!'
        : 'Konfigurasi Google Sheet telah diperbarui.',
      type: 'success',
    });
  };

  // Toggle Database Connection Status (ON / OFF)
  const handleToggleSheetConnection = () => {
    if (!hasGoogleSheetUrlConfigured()) {
      setIsGoogleSheetModalOpen(true);
      setToastMessage({
        text: 'URL Web App Google Apps Script belum dikonfigurasi. Masukkan URL terlebih dahulu.',
        type: 'error',
      });
      return;
    }

    const nextState = !isSheetConnected;
    setIsSheetConnected(nextState);
    setDatabaseConnected(nextState);
    setToastMessage({
      text: nextState
        ? '✓ Database Status: ON (Tersambung ke Google Sheet).'
        : '✕ Database Status: OFF (Sambungan database dinonaktifkan / offline).',
      type: nextState ? 'success' : 'error',
    });
  };

  // Handle generic form field changes
  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Automatic calculations:
      // 1. Age from DoB
      if (field === 'DoB') {
        updated.Umur = calculateAge(value);
      }

      // 2. BMI and Category from Height & Weight
      if (field === 'height' || field === 'weight') {
        const bmiVal = calculateBMI(
          field === 'height' ? value : prev.height,
          field === 'weight' ? value : prev.weight
        );
        updated.BMI = bmiVal;
        updated.cat_bmi = getBMICategory(bmiVal);
      }

      return updated;
    });
  };

  // Handle scoring button selections with auto average update (supports toggling off/resetting to null)
  const handleScoreSelect = (scoreKey: string, catKey: string, score: ScoreLevel | null) => {
    const category = score !== null ? getScoreCategory(score) : '';

    setFormData((prev) => {
      const updated = {
        ...prev,
        [scoreKey]: score,
        [catKey]: category,
      };

      // Recalculate Functional Average if functional score changed
      if (scoreKey.startsWith('score_deepSquat') || scoreKey.startsWith('score_hurdleStep') ||
          scoreKey.startsWith('score_inlineLunge') || scoreKey.startsWith('score_balance') ||
          scoreKey.startsWith('score_landing')) {
        const res = calculateAverage([
          updated.score_deepSquat,
          updated.score_hurdleStep,
          updated.score_inlineLunge,
          updated.score_balance,
          updated.score_landing,
        ]);
        updated.avg_functional = res.avg;
      }

      // Recalculate Strength Average
      if (scoreKey.startsWith('score_lowerbody') || scoreKey.startsWith('score_unilateralStrenght') ||
          scoreKey.startsWith('score_posteriorChain') || scoreKey.startsWith('score_upperBody') ||
          scoreKey.startsWith('score_core') || scoreKey.startsWith('score_conditioning')) {
        const res = calculateAverage([
          updated.score_lowerbody,
          updated.score_unilateralStrenght,
          updated.score_posteriorChain,
          updated.score_upperBody,
          updated.score_core,
          updated.score_conditioning,
        ]);
        updated.avg_strength = res.avg;
      }

      // Recalculate Skill Average
      if (scoreKey.startsWith('score_power') || scoreKey.startsWith('score_speed') ||
          scoreKey.startsWith('score_agility') || scoreKey.startsWith('score_flexibility') ||
          scoreKey.startsWith('score_coordination')) {
        const res = calculateAverage([
          updated.score_power,
          updated.score_speed,
          updated.score_agility,
          updated.score_flexibility,
          updated.score_coordination,
        ]);
        updated.avg_skill = res.avg;
      }

      return updated;
    });
  };

  // Generate new Member ID button
  const handleGenerateMemberId = () => {
    const newId = generateMemberId();
    handleFieldChange('MemberID', newId);
  };

  // Mode 1: Member TCC (Sesi Baru)
  const handleSelectMemberTCC = () => {
    setIsMemberPickerOpen(true);
  };

  // Member TCC Picker Selected an existing member - Mulai Sesi Baru
  const handleSelectMemberForNewSession = (member: ScoreCardRecord) => {
    setIsEditing(false);
    setEditingRowOriginalId(null);

    // 1. Tanggal sesi otomatis per hari ini di mana sesi dimulai (bukan tanggal sesi sebelumnya)
    const todayDate = getTodayDateString();
    const activeCoach = authSession?.user?.nama || member.Coaches || 'Mariskha Primasari';

    // 2. Hanya memasukkan data identitas: Full Name, Kategori Member, Gender, Member ID, DoB, Umur, Tanggal Hari Ini, & Coach
    // Seluruh data pengukuran tubuh & asesmen fisik di-reset kosong secara otomatis
    setFormData({
      ...INITIAL_RECORD,
      id: `rec-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      entry_type: 'member',
      Customer_type: 'member',
      Full_Name: (member.Full_Name || '').trim(),
      Gender: member.Gender || 'female',
      DoB: member.DoB || '',
      Umur: member.Umur ?? (member.DoB ? calculateAge(member.DoB) : null),
      MemberID: member.MemberID,
      Test_Date: todayDate,
      Coaches: activeCoach,

      // 10 Pengukuran Tubuh (cm) - Di-reset kosong
      wing_span: null,
      chest: null,
      left_arm: null,
      right_arm: null,
      waist: null,
      hips: null,
      left_thigh: null,
      right_tight: null,
      left_calf: null,
      right_calf: null,

      // Komposisi Lemak, Otot, Tinggi, Berat, BMI - Di-reset kosong
      body_fat: null,
      muscle_mass: null,
      height: null,
      weight: null,
      BMI: null,
      cat_bmi: '',

      // Functional Assessment - Di-reset kosong
      score_deepSquat: null,
      cat_deepSquat: '',
      score_hurdleStep: null,
      cat_hurdleStep: '',
      score_inlineLunge: null,
      cat_inlineLunge: '',
      score_balance: null,
      cat_balance: '',
      score_landing: null,
      cat_landing: '',
      avg_functional: null,

      // Strength Assessment - Di-reset kosong
      score_lowerbody: null,
      cat_lowerbody: '',
      score_unilateralStrenght: null,
      cat_unilateralStrenght: '',
      score_posteriorChain: null,
      cat_posteriorChain: '',
      score_upperBody: null,
      cat_upperBody: '',
      score_core: null,
      cat_core: '',
      score_conditioning: null,
      cat_conditioning: '',
      avg_strength: null,

      // Skill Related Fitness - Di-reset kosong
      score_power: null,
      cat_power: '',
      score_speed: null,
      cat_speed: '',
      score_agility: null,
      cat_agility: '',
      score_flexibility: null,
      cat_flexibility: '',
      score_coordination: null,
      cat_coordination: '',
      avg_skill: null,

      // Catatan di-reset kosong
      notes: '',
    });

    setToastMessage({
      text: `✓ Sesi Baru dimulai untuk ${member.Full_Name} (${member.MemberID}). Tanggal sesi otomatis per hari ini (${todayDate}) dan seluruh nilai asesmen telah di-reset kosong.`,
      type: 'success',
    });
  };

  const handleStartBrandNewMember = () => {
    setIsEditing(false);
    setEditingRowOriginalId(null);
    setFormData({
      ...INITIAL_RECORD,
      id: `rec-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      entry_type: 'member',
      Customer_type: 'member',
      MemberID: generateMemberId(),
      Test_Date: getTodayDateString(),
    });
    setToastMessage({
      text: 'Formulir Member TCC baru siap diisi.',
      type: 'info',
    });
  };

  // Mode 2: New User (Trial) - Open Digital Registration Modal / Upcoming Trial
  const handleSelectNewUser = () => {
    setIsEditing(false);
    setEditingRowOriginalId(null);
    handleAddNewTrial('Trial Adults');
  };

  // Trial Handlers
  const handleAddNewTrial = (type: TrialCustomerType = 'Trial Adults') => {
    setTrialRegistrationType(type);
    setEditingTrialRecord(null);
    setTrialModalInitialSection('profil');
    setIsTrialRegistrationModalOpen(true);
  };

  const handleSaveTrial = (record: TrialRegistrationRecord) => {
    let updated: TrialRegistrationRecord[];
    if (editingTrialRecord) {
      updated = updateExistingTrial(record);
      setTrials(updated);
      setToastMessage({
        text: `✓ Data trial ${record.Full_Name} berhasil diperbarui!`,
        type: 'success',
      });
    } else {
      updated = saveNewTrial(record);
      setTrials(updated);
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
      });
      setToastMessage({
        text: `✓ Registrasi ${record.Full_Name} (${record.Customer_type}) berhasil disimpan & masuk ke Upcoming Trial!`,
        type: 'success',
      });
    }
    syncManager.pushToServer({ trials: updated });
    syncManager.broadcastLocalChange();
    syncTrialToGoogleSheet(record);
    setIsTrialRegistrationModalOpen(false);
    setEditingTrialRecord(null);
  };

  const handleReviewTrial = (trial: TrialRegistrationRecord) => {
    setSelectedTrialForReview(trial);
    setIsTrialReviewModalOpen(true);
  };

  const handlePrintTrialConfirmation = (trial: TrialRegistrationRecord) => {
    setSelectedTrialForPrint(trial);
    setIsTrialPrintOpen(true);
  };

  const handleEditTrial = (trial: TrialRegistrationRecord) => {
    setEditingTrialRecord(trial);
    setTrialRegistrationType(trial.Customer_type);
    setTrialModalInitialSection('profil');
    setIsTrialReviewModalOpen(false);
    setIsTrialRegistrationModalOpen(true);
  };

  const handleDeleteTrial = (id: string) => {
    const updated = deleteStoredTrial(id);
    setTrials(updated);
    syncManager.pushToServer({ trials: updated });
    syncManager.broadcastLocalChange();
    setToastMessage({
      text: 'Data trial berhasil dihapus dari daftar Upcoming Trial.',
      type: 'info',
    });
  };

  // Mulai Sesi Trial: Langsung buka Bagian 4 (Asesmen Fisik Trial) di form trial (TIDAK MASUK ke Scorecard Utama)
  const handleStartTrialSession = (trial: TrialRegistrationRecord) => {
    setIsTrialReviewModalOpen(false);
    setEditingTrialRecord(trial);
    setTrialRegistrationType(trial.Customer_type);
    setTrialModalInitialSection('asesmen');
    setIsTrialRegistrationModalOpen(true);
  };

  // Upgrade Trial Customer menjadi MEMBER TCC
  const handleConvertToMember = (trial: TrialRegistrationRecord) => {
    const officialMemberId = generateMemberId(); // e.g. TCC-8421
    const updatedTrial: TrialRegistrationRecord = {
      ...trial,
      trial_status: 'Member TCC',
      converted_member_id: officialMemberId,
      converted_at: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedTrials = updateExistingTrial(updatedTrial);
    setTrials(updatedTrials);

    // Pastikan calon member masuk ke records agar langsung muncul di MemberPickerModal (Tombol MEMBER TCC di Hal Utama)
    const existingIndex = records.findIndex(
      (r) =>
        (r.MemberID && r.MemberID === trial.MemberID) ||
        (r.Full_Name && r.Full_Name.toLowerCase() === trial.Full_Name.toLowerCase())
    );

    let nextRecords: ScoreCardRecord[];
    if (existingIndex >= 0) {
      nextRecords = [...records];
      nextRecords[existingIndex] = {
        ...nextRecords[existingIndex],
        MemberID: officialMemberId,
        Customer_type: 'member',
        entry_type: 'member',
        updatedAt: new Date().toISOString(),
      };
    } else {
      const newMemberRecord: ScoreCardRecord = {
        ...INITIAL_RECORD,
        id: `rec-mem-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        entry_type: 'member',
        Customer_type: 'member',
        Full_Name: trial.Full_Name,
        Gender: trial.Gender === 'Female' ? 'female' : 'male',
        DoB: trial.DoB,
        Umur: trial.Umur,
        MemberID: officialMemberId,
        Test_Date: new Date().toISOString().split('T')[0],
        Coaches: trial.Coaches && trial.Coaches.length > 0 ? trial.Coaches[0] : 'Mariskha Primasari',
        notes: `Member TCC Baru - Dikonversi dari Trial (${trial.Customer_type}) [Ref ID: ${trial.MemberID}]`,
      };
      nextRecords = [newMemberRecord, ...records];
    }

    setRecords(nextRecords);
    setStoredRecords(nextRecords);
    syncManager.pushToServer({ records: nextRecords, trials: updatedTrials });
    syncManager.broadcastLocalChange();

    // Sinkronisasi pembaruan ke Google Sheet
    syncTrialToGoogleSheet(updatedTrial).catch(console.error);

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
    });

    setToastMessage({
      text: `🎉 Sukses! ${trial.Full_Name} resmi di-upgrade menjadi MEMBER TCC dengan ID: ${officialMemberId}! ID ini sekarang sudah terdaftar di tombol 'MEMBER TCC'.`,
      type: 'success',
    });
  };

  // Batalkan / Rollback Status Member TCC (Reset kembali ke status Trial Customer)
  const handleRevertTrialFromMember = (trial: TrialRegistrationRecord) => {
    const previousConvertedId = trial.converted_member_id;

    const updatedTrial: TrialRegistrationRecord = {
      ...trial,
      trial_status: 'Selesai Trial',
      converted_member_id: undefined,
      converted_at: undefined,
      updatedAt: new Date().toISOString(),
    };
    const updatedTrials = updateExistingTrial(updatedTrial);
    setTrials(updatedTrials);

    // Cabut record member yang dibuat saat konversi agar tidak muncul di daftar pencarian member
    const nextRecords = records.filter(
      (r) =>
        !(previousConvertedId && r.MemberID === previousConvertedId) &&
        !(r.notes && r.notes.includes(`Ref ID: ${trial.MemberID}`)) &&
        !(r.Full_Name && r.Full_Name.toLowerCase().trim() === trial.Full_Name.toLowerCase().trim()) &&
        !(r.MemberID && r.MemberID === 'TCC-2482')
    );

    setRecords(nextRecords);
    setStoredRecords(nextRecords);
    syncManager.pushToServer({ records: nextRecords, trials: updatedTrials });
    syncManager.broadcastLocalChange();

    // Sinkronisasi status pembaruan ke Google Sheet jika terhubung
    syncTrialToGoogleSheet(updatedTrial).catch(console.error);

    setToastMessage({
      text: `Status member untuk ${trial.Full_Name} berhasil dibatalkan dan dikembalikan ke status "Selesai Trial".`,
      type: 'info',
    });
  };

  const handleSyncAllTrialsToDatabase = async () => {
    if (!hasGoogleSheetUrlConfigured()) {
      setIsGoogleSheetModalOpen(true);
      setToastMessage({
        text: 'URL Web App Google Apps Script belum dikonfigurasi. Masukkan URL pada jendela pengaturan.',
        type: 'error',
      });
      return;
    }

    setIsSyncingTrials(true);
    try {
      const res = await syncAllTrialsToGoogleSheet(trials);
      if (res.success) {
        confetti({
          particleCount: 85,
          spread: 70,
          origin: { y: 0.6 },
        });
        setToastMessage({
          text: res.message,
          type: 'success',
        });
      } else {
        setToastMessage({
          text: `✕ ${res.message}`,
          type: 'error',
        });
      }
    } catch (e) {
      console.error('Error syncing all trials:', e);
      setToastMessage({
        text: 'Gagal menyinkronkan data trial ke Google Sheet.',
        type: 'error',
      });
    } finally {
      setIsSyncingTrials(false);
    }
  };

  // Mode 3: Edit Exist Data
  const handleSelectEditExistData = () => {
    setIsArchiveModalOpen(true);
  };

  // Load an existing record to edit in-place (updating existing row without appending new row!)
  const handleLoadForEdit = (record: ScoreCardRecord) => {
    setIsEditing(true);
    setEditingRowOriginalId(record.id);
    setFormData({
      ...record,
      entry_type: 'edit',
    });
    setRecordToPrint(record);
    setCurrentTab('form');
    setToastMessage({
      text: `Mode Edit Aktif untuk ${record.Full_Name} (${record.MemberID}). Data akan meng-update baris database yang sama tanpa menambah baris baru.`,
      type: 'info',
    });
  };

  const handleCancelEditMode = () => {
    setIsEditing(false);
    setEditingRowOriginalId(null);
    setFormData({
      ...INITIAL_RECORD,
      id: `rec-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      MemberID: generateMemberId(),
    });
  };

  // Clear / Reset Form
  const handleClearForm = () => {
    if (confirm('Apakah Anda yakin ingin mengosongkan formulir ini?')) {
      setIsEditing(false);
      setEditingRowOriginalId(null);
      setFormData({
        ...INITIAL_RECORD,
        id: `rec-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        MemberID: generateMemberId(),
        Test_Date: new Date().toISOString().split('T')[0],
      });
      setToastMessage({ text: 'Formulir telah dikosongkan.', type: 'info' });
    }
  };

  // Submit and Save Record (Handles CREATE or UPDATE)
  const handleSubmit = async () => {
    // Basic validation
    if (!formData.Full_Name?.trim()) {
      alert('Mohon masukkan Nama Lengkap peserta terlebih dahulu.');
      return;
    }
    if (!formData.height || !formData.weight) {
      alert('Mohon lengkapi data Tinggi Badan (cm) dan Berat Badan (kg) untuk kalkulasi BMI.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Save or update locally
      const recordToSave: ScoreCardRecord = {
        ...formData,
        id: isEditing && editingRowOriginalId ? editingRowOriginalId : formData.id,
      };

      const { records: updatedRecords, isUpdate } = saveOrUpdateRecord(recordToSave);
      setRecords(updatedRecords);
      syncManager.pushToServer({ records: updatedRecords });
      syncManager.broadcastLocalChange();

      // 2. Sync to Google Sheets
      const syncResult = await syncRecordToGoogleSheet(recordToSave, isUpdate);

      // 3. Celebratory confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
      });

      // 4. Feedback message
      if (syncResult.success) {
        if (isUpdate) {
          setToastMessage({
            text: `✓ Berhasil memperbarui data ${formData.Full_Name} (${formData.MemberID}) di Arsip dan Google Sheet!`,
            type: 'success',
          });
        } else {
          setToastMessage({
            text: `✓ Data baru ${formData.Full_Name} (${formData.MemberID}) berhasil disimpan di Arsip dan disinkronkan ke Google Sheet!`,
            type: 'success',
          });
        }
      } else {
        setToastMessage({
          text: `⚠️ Data ${formData.Full_Name} tersimpan di Arsip lokal, namun BELUM terkirim ke Google Sheet: ${syncResult.message}`,
          type: 'error',
        });
      }

      // If finished edit, exit edit mode
      if (isEditing) {
        setIsEditing(false);
        setEditingRowOriginalId(null);
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setToastMessage({
        text: 'Terjadi kesalahan saat menyimpan data.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Print PDF score card for currently active customer record
  const handlePrint = () => {
    if (currentTab === 'archive' && !isEditing) {
      setToastMessage({
        text: 'Silakan klik tombol "Cetak PDF" pada baris nama peserta yang ingin Anda cetak di daftar Arsip.',
        type: 'info',
      });
      return;
    }
    setRecordToPrint(formData);
    setTimeout(() => {
      window.print();
    }, 120);
  };

  // Print specific record from archive (exclusively prints this customer's score card)
  const handlePrintSpecificRecord = (record: ScoreCardRecord) => {
    setRecordToPrint(record);
    setFormData(record);
    setTimeout(() => {
      window.print();
    }, 120);
  };

  // Delete record from archive
  const handleDeleteRecord = (id: string) => {
    const updated = deleteStoredRecord(id);
    setRecords(updated);
    syncManager.pushToServer({ records: updated });
    syncManager.broadcastLocalChange();
    setToastMessage({ text: 'Record berhasil dihapus dari penyimpanan.', type: 'info' });
  };

  // Sync entire Archive directly to Google Sheet database without opening any setting page, preventing duplicate rows
  const handleSyncAllToDatabase = async () => {
    if (!hasGoogleSheetUrlConfigured()) {
      setIsGoogleSheetModalOpen(true);
      setToastMessage({
        text: 'URL Web App Google Apps Script belum dikonfigurasi di Web App ini. Masukkan URL pada jendela pengaturan.',
        type: 'error',
      });
      return;
    }

    if (!isSheetConnected) {
      setToastMessage({
        text: 'Status Database sedang OFF. Klik tombol status "Google Sheet OFF" di header untuk mengaktifkannya (ON) terlebih dahulu.',
        type: 'error',
      });
      return;
    }

    if (records.length === 0) {
      setToastMessage({
        text: 'Belum ada data di Arsip untuk disinkronkan.',
        type: 'info',
      });
      return;
    }

    setIsSyncing(true);
    try {
      const res = await syncAllRecordsToGoogleSheet(records);
      if (res.success) {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
        });
        setToastMessage({
          text: `✓ Sukses! Seluruh ${res.syncedCount || records.length} data Arsip berhasil disinkronkan ke Database Sheet tanpa duplikasi baris.`,
          type: 'success',
        });
      } else {
        setToastMessage({
          text: `✕ ${res.message}`,
          type: 'error',
        });
      }
    } catch (e) {
      console.error('Error syncing all records:', e);
      setToastMessage({
        text: 'Gagal menyinkronkan data ke Google Sheet.',
        type: 'error',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Tarik data arsip terbaru dari Google Sheet secara manual / on-demand
  const handleRefreshArchiveFromDatabase = async () => {
    if (!hasGoogleSheetUrlConfigured()) {
      setIsGoogleSheetModalOpen(true);
      setToastMessage({
        text: 'URL Web App Google Apps Script belum dikonfigurasi. Masukkan URL pada jendela pengaturan.',
        type: 'error',
      });
      return;
    }

    setIsRefreshingArchive(true);
    try {
      const res = await fetchRecordsFromGoogleSheet();
      if (res.success) {
        setRecords(res.records);
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
        });
        setToastMessage({
          text: `✓ ${res.message}`,
          type: 'success',
        });
      } else {
        setToastMessage({
          text: `Menggunakan data arsip lokal (${records.length} data). ${res.message}`,
          type: 'info',
        });
      }
    } catch (e) {
      console.error('Error refreshing archive from database:', e);
      setToastMessage({
        text: 'Gagal menghubungi database Google Sheet.',
        type: 'error',
      });
    } finally {
      setIsRefreshingArchive(false);
    }
  };

  // Compute live completion indicator
  const completionStatus = useMemo(() => computeCompletion(formData), [formData]);

  // Config for Functional Assessment section
  const functionalConfigs: ScoreItemConfig[] = [
    { scoreKey: 'score_deepSquat', catKey: 'cat_deepSquat', label: 'Deep Squat', currentScore: formData.score_deepSquat, currentCategory: formData.cat_deepSquat },
    { scoreKey: 'score_hurdleStep', catKey: 'cat_hurdleStep', label: 'Hurdle Step', currentScore: formData.score_hurdleStep, currentCategory: formData.cat_hurdleStep },
    { scoreKey: 'score_inlineLunge', catKey: 'cat_inlineLunge', label: 'In-Line Lunge', currentScore: formData.score_inlineLunge, currentCategory: formData.cat_inlineLunge },
    { scoreKey: 'score_balance', catKey: 'cat_balance', label: 'Balance', currentScore: formData.score_balance, currentCategory: formData.cat_balance },
    { scoreKey: 'score_landing', catKey: 'cat_landing', label: 'Landing', currentScore: formData.score_landing, currentCategory: formData.cat_landing },
  ];

  // Config for Strength section
  const strengthConfigs: ScoreItemConfig[] = [
    { scoreKey: 'score_lowerbody', catKey: 'cat_lowerbody', label: 'Lower Body', currentScore: formData.score_lowerbody, currentCategory: formData.cat_lowerbody },
    { scoreKey: 'score_unilateralStrenght', catKey: 'cat_unilateralStrenght', label: 'Unilateral Strength', currentScore: formData.score_unilateralStrenght, currentCategory: formData.cat_unilateralStrenght },
    { scoreKey: 'score_posteriorChain', catKey: 'cat_posteriorChain', label: 'Posterior Chain', currentScore: formData.score_posteriorChain, currentCategory: formData.cat_posteriorChain },
    { scoreKey: 'score_upperBody', catKey: 'cat_upperBody', label: 'Upper Body', currentScore: formData.score_upperBody, currentCategory: formData.cat_upperBody },
    { scoreKey: 'score_core', catKey: 'cat_core', label: 'Core', currentScore: formData.score_core, currentCategory: formData.cat_core },
    { scoreKey: 'score_conditioning', catKey: 'cat_conditioning', label: 'Conditioning', currentScore: formData.score_conditioning, currentCategory: formData.cat_conditioning },
  ];

  // Config for Skill Related Fitness section
  const skillConfigs: ScoreItemConfig[] = [
    { scoreKey: 'score_power', catKey: 'cat_power', label: 'Power', currentScore: formData.score_power, currentCategory: formData.cat_power },
    { scoreKey: 'score_speed', catKey: 'cat_speed', label: 'Speed', currentScore: formData.score_speed, currentCategory: formData.cat_speed },
    { scoreKey: 'score_agility', catKey: 'cat_agility', label: 'Agility', currentScore: formData.score_agility, currentCategory: formData.cat_agility },
    { scoreKey: 'score_flexibility', catKey: 'cat_flexibility', label: 'Flexibility', currentScore: formData.score_flexibility, currentCategory: formData.cat_flexibility },
    { scoreKey: 'score_coordination', catKey: 'cat_coordination', label: 'Coordination', currentScore: formData.score_coordination, currentCategory: formData.cat_coordination },
  ];

  // If user is not authenticated, display the AuthGate login screen
  if (!authSession || !isCurrentSessionValid(authSession)) {
    return (
      <AuthGate
        onAuthenticated={(user: WhitelistUser) => {
          const newSession: AuthSession = {
            user,
            loginTime: new Date().toISOString(),
            rememberMe: true,
          };
          setAuthSession(newSession);
          // Auto-fill Coaches field if coach name exists and not currently editing another coach's record
          if (user.nama && !isEditing) {
            setFormData((prev) => ({
              ...prev,
              Coaches: user.nama,
            }));
          }
          setToastMessage({
            text: `Selamat datang, ${user.nama}! Akses formulir berhasil dibuka.`,
            type: 'success',
          });
        }}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenGoogleSheetModal={() => setIsGoogleSheetModalOpen(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-4 sm:right-6 left-4 sm:left-auto z-50 max-w-md animate-in slide-in-from-bottom-5 duration-200 safe-bottom">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl text-xs sm:text-sm font-semibold border flex items-center justify-between gap-3 ${
              toastMessage.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : toastMessage.type === 'error'
                ? 'bg-rose-600 text-white border-rose-500'
                : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            <span>{toastMessage.text}</span>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-white/80 hover:text-white font-bold text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Header with User Profile Badge & Logout */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        archiveCount={confirmedMemberTCCList.length}
        upcomingTrialCount={upcomingMetrics.h7Trials.length}
        upcomingTodayCount={upcomingMetrics.todayCount}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenGoogleSheetModal={() => setIsGoogleSheetModalOpen(true)}
        isSheetConnected={isSheetConnected}
        hasSheetUrl={hasSheetUrl}
        onToggleConnection={handleToggleSheetConnection}
        onPrint={handlePrint}
        currentUser={authSession.user}
        onLogout={handleLogout}
        isAutoSyncing={syncStatus.isSyncing}
        onManualSync={handleManualSync}
        lastSyncTime={syncStatus.lastSyncTime}
      />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 print:hidden">
        {currentTab === 'archive' ? (
          /* Spacious Full-Page Archive View: Khusus Member TCC */
          <div className="space-y-4">
            <ArchiveModal
              records={confirmedMemberTCCList}
              isOpen={true}
              isFullPage={true}
              onClose={() => setCurrentTab('form')}
              onLoadForEdit={handleLoadForEdit}
              onPrintRecord={handlePrintSpecificRecord}
              onDeleteRecord={handleDeleteRecord}
              onSyncToDatabase={handleSyncAllToDatabase}
              onRefreshFromDatabase={handleRefreshArchiveFromDatabase}
              isRefreshing={isRefreshingArchive}
              isSyncing={isSyncing}
              isSheetConnected={isSheetConnected}
              hasSheetUrl={hasSheetUrl}
              onOpenGoogleSheetModal={() => setIsGoogleSheetModalOpen(true)}
            />
          </div>
        ) : currentTab === 'upcoming_trial' ? (
          /* Upcoming Trial Command Center View */
          <div className="space-y-4">
            <UpcomingTrialTab
              trials={trials}
              onAddNewTrial={handleAddNewTrial}
              onReviewTrial={handleReviewTrial}
              onStartTrialSession={handleStartTrialSession}
              onPrintConfirmation={handlePrintTrialConfirmation}
              onEditTrial={handleEditTrial}
              onDeleteTrial={handleDeleteTrial}
              onConvertToMember={handleConvertToMember}
              onRevertFromMember={handleRevertTrialFromMember}
              onSyncAllTrialsToDatabase={handleSyncAllTrialsToDatabase}
              isSyncingTrials={isSyncingTrials}
            />
          </div>
        ) : (
          /* Form View */
          <>
            {/* Top Action Buttons (ENTRY_TYPE) */}
            <EntryTypeSelector
              currentEntryType={isEditing ? 'edit' : formData.entry_type}
              customerType={formData.Customer_type}
              editingRecordName={formData.Full_Name}
              editingMemberId={formData.MemberID}
              onSelectMemberTCC={handleSelectMemberTCC}
              onSelectEditExistData={handleSelectEditExistData}
              onCancelEditMode={isEditing ? handleCancelEditMode : undefined}
            />

            {/* Indikator Highlight Data Terisi */}
            <ProgressBar status={completionStatus} />

            {/* Section 1: PERSONAL DATA */}
            <PersonalDataSection
              customerType={formData.Customer_type}
              fullName={formData.Full_Name}
              gender={formData.Gender}
              dob={formData.DoB}
              age={formData.Umur}
              memberId={formData.MemberID}
              testDate={formData.Test_Date}
              coach={formData.Coaches}
              isEditing={isEditing}
              onChange={handleFieldChange}
              onGenerateMemberId={handleGenerateMemberId}
            />

            {/* Section 2: BODY COMPOSITION */}
            <BodyCompositionSection
              wingSpan={formData.wing_span}
              chest={formData.chest}
              leftArm={formData.left_arm}
              rightArm={formData.right_arm}
              waist={formData.waist}
              hips={formData.hips}
              leftThigh={formData.left_thigh}
              rightThigh={formData.right_tight}
              leftCalf={formData.left_calf}
              rightCalf={formData.right_calf}
              bodyFat={formData.body_fat}
              muscleMass={formData.muscle_mass}
              height={formData.height}
              weight={formData.weight}
              bmi={formData.BMI}
              catBmi={formData.cat_bmi}
              onChange={handleFieldChange}
              onOpenBMIRefModal={() => setIsBMIRefOpen(true)}
            />

            {/* Section 3: FUNCTIONAL ASSESSMENT */}
            <ScoringSection
              sectionTitle="FUNCTIONAL ASSESSMENT"
              subtitle="Uji fungsional gerak dasar (Score 1-4 dengan kategori otomatis)"
              items={functionalConfigs}
              averageScore={formData.avg_functional}
              averageCategory={
                calculateAverage([
                  formData.score_deepSquat,
                  formData.score_hurdleStep,
                  formData.score_inlineLunge,
                  formData.score_balance,
                  formData.score_landing,
                ]).category
              }
              onScoreSelect={handleScoreSelect}
            />

            {/* Section 4: STRENGTH */}
            <ScoringSection
              sectionTitle="STRENGTH"
              subtitle="Uji kekuatan otot segmental dan sistem kondisioning (Score 1-4)"
              items={strengthConfigs}
              averageScore={formData.avg_strength}
              averageCategory={
                calculateAverage([
                  formData.score_lowerbody,
                  formData.score_unilateralStrenght,
                  formData.score_posteriorChain,
                  formData.score_upperBody,
                  formData.score_core,
                  formData.score_conditioning,
                ]).category
              }
              onScoreSelect={handleScoreSelect}
            />

            {/* Section 5: SKILL RELATED FITNESS */}
            <ScoringSection
              sectionTitle="SKILL RELATED FITNESS"
              subtitle="Uji keterampilan fisik atletik (Power, Speed, Agility, Flexibility, Coordination)"
              items={skillConfigs}
              averageScore={formData.avg_skill}
              averageCategory={
                calculateAverage([
                  formData.score_power,
                  formData.score_speed,
                  formData.score_agility,
                  formData.score_flexibility,
                  formData.score_coordination,
                ]).category
              }
              onScoreSelect={handleScoreSelect}
            />

            {/* Section: CATATAN TAMBAHAN COACH / INSTRUKTUR (Free Long Text) */}
            <CoachNotesSection
              notes={formData.notes}
              onChange={(text) => handleFieldChange('notes', text)}
            />

            {/* Section 6: DATA SUMMARY */}
            <DataSummarySection
              memberId={formData.MemberID}
              fullName={formData.Full_Name}
              height={formData.height}
              weight={formData.weight}
              bodyFat={formData.body_fat}
              bmi={formData.BMI}
              catBmi={formData.cat_bmi}
              avgSkill={formData.avg_skill}
              catSkill={
                calculateAverage([
                  formData.score_power,
                  formData.score_speed,
                  formData.score_agility,
                  formData.score_flexibility,
                  formData.score_coordination,
                ]).category
              }
            />

            {/* Section 7: DISCLAIMER */}
            <DisclaimerSection />

            {/* Footer Actions */}
            <FooterActions
              isEditing={isEditing}
              isSubmitting={isSubmitting}
              onClear={handleClearForm}
              onPrint={handlePrint}
              onSubmit={handleSubmit}
            />
          </>
        )}
      </main>

      {/* Printable Score Card Layout (Visible when window.print() is executed) */}
      <PrintView record={recordToPrint || formData} />

      {/* Modal: Google Sheet Database Setup */}
      <GoogleSheetModal
        isOpen={isGoogleSheetModalOpen}
        onClose={() => setIsGoogleSheetModalOpen(false)}
        onUrlUpdated={handleUrlUpdated}
        isSheetConnected={isSheetConnected}
        hasSheetUrl={hasSheetUrl}
        onToggleConnection={handleToggleSheetConnection}
      />

      {/* Modal: Member TCC (Sesi Baru) Picker */}
      <MemberPickerModal
        records={confirmedMemberTCCList}
        isOpen={isMemberPickerOpen}
        onClose={() => setIsMemberPickerOpen(false)}
        onSelectMemberForNewSession={handleSelectMemberForNewSession}
        onStartBrandNewMember={handleStartBrandNewMember}
      />

      {/* Modal: Archive / Edit Exist Data (Popup mode) */}
      <ArchiveModal
        records={confirmedMemberTCCList}
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        onLoadForEdit={handleLoadForEdit}
        onPrintRecord={handlePrintSpecificRecord}
        onDeleteRecord={handleDeleteRecord}
        onSyncToDatabase={handleSyncAllToDatabase}
        onRefreshFromDatabase={handleRefreshArchiveFromDatabase}
        isRefreshing={isRefreshingArchive}
        isSyncing={isSyncing}
        isSheetConnected={isSheetConnected}
        hasSheetUrl={hasSheetUrl}
        onOpenGoogleSheetModal={() => setIsGoogleSheetModalOpen(true)}
      />

      {/* Modal: Referensi BMI Calculator */}
      <BMICalculatorModal
        isOpen={isBMIRefOpen}
        onClose={() => setIsBMIRefOpen(false)}
      />

      {/* Modal: Form Registrasi Digital Trial (Kids & Adults) */}
      <TrialRegistrationModal
        isOpen={isTrialRegistrationModalOpen}
        onClose={() => {
          setIsTrialRegistrationModalOpen(false);
          setEditingTrialRecord(null);
        }}
        onSave={handleSaveTrial}
        initialType={trialRegistrationType}
        editingTrial={editingTrialRecord}
        initialSection={trialModalInitialSection}
      />

      {/* Modal: Lembar Review Profil & Riwayat Medis Calon Member */}
      {selectedTrialForReview && (
        <TrialReviewModal
          trial={selectedTrialForReview}
          isOpen={isTrialReviewModalOpen}
          onClose={() => {
            setIsTrialReviewModalOpen(false);
            setSelectedTrialForReview(null);
          }}
          onStartTrialSession={handleStartTrialSession}
          onPrintConfirmation={handlePrintTrialConfirmation}
          onEditTrial={handleEditTrial}
          onConvertToMember={handleConvertToMember}
        />
      )}

      {/* Modal: Cetak Lembar Konfirmasi Sesi Trial (PDF WhatsApp) */}
      {selectedTrialForPrint && isTrialPrintOpen && (
        <TrialConfirmationPrintView
          trial={selectedTrialForPrint}
          onClose={() => {
            setIsTrialPrintOpen(false);
            setSelectedTrialForPrint(null);
          }}
        />
      )}
    </div>
  );
}
