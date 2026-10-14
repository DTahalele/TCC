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
} from './utils/calculations';
import {
  getStoredRecords,
  saveOrUpdateRecord,
  deleteStoredRecord,
  getGoogleSheetUrl,
  hasGoogleSheetUrlConfigured,
  isDatabaseConnected,
  setDatabaseConnected,
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

export default function App() {
  // Authentication session state
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => getCurrentSession());

  // Theme state with localStorage persistence and system preference detection
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('tcc_scorecard_darkmode');
      if (saved !== null) {
        return saved === 'true';
      }
      return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

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

  // Compute live upcoming trial metrics (window 7 hari & hari ini)
  const upcomingMetrics = useMemo(() => getUpcomingTrialsWindow(trials), [trials]);

  // Form State
  const [formData, setFormData] = useState<ScoreCardRecord>(() => ({
    ...INITIAL_RECORD,
    id: `rec-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    MemberID: generateMemberId(),
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

  // Initialize records on mount & auto-sync from Google Sheet database if available
  useEffect(() => {
    const loaded = getStoredRecords();
    setRecords(loaded);

    if (hasGoogleSheetUrlConfigured()) {
      fetchRecordsFromGoogleSheet().then((res) => {
        if (res.success && res.records.length > 0) {
          setRecords(res.records);
        }
      });
    }
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

  // Otomatis sinkronkan riwayat arsip & trial dari database Google Sheet saat user login atau berpindah tab
  useEffect(() => {
    if (authSession && hasGoogleSheetUrlConfigured()) {
      fetchRecordsFromGoogleSheet().then((res) => {
        if (res.success && res.records.length > 0) {
          setRecords(res.records);
        }
      });
      fetchTrialsFromGoogleSheet().then((res) => {
        if (res.success && res.trials.length > 0) {
          setTrials(res.trials);
        }
      });
    }
  }, [authSession, currentTab]);

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

  // Handle scoring button selections with auto average update
  const handleScoreSelect = (scoreKey: string, catKey: string, score: ScoreLevel) => {
    const category = getScoreCategory(score);

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

  // Member TCC Picker Selected an existing member
  const handleSelectMemberForNewSession = (member: ScoreCardRecord) => {
    setIsEditing(false);
    setEditingRowOriginalId(null);
    setFormData({
      ...INITIAL_RECORD,
      id: `rec-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      entry_type: 'member',
      Customer_type: 'member',
      Full_Name: member.Full_Name,
      Gender: member.Gender,
      DoB: member.DoB,
      Umur: member.Umur ?? calculateAge(member.DoB),
      MemberID: member.MemberID,
      Test_Date: new Date().toISOString().split('T')[0],
      Coaches: member.Coaches || 'Mariskha Primasari',
    });
    setToastMessage({
      text: `Sesi Baru dimulai untuk Member: ${member.Full_Name} (${member.MemberID}). Data personal telah dimuat.`,
      type: 'info',
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
      Test_Date: new Date().toISOString().split('T')[0],
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
    setIsTrialRegistrationModalOpen(true);
  };

  const handleSaveTrial = (record: TrialRegistrationRecord) => {
    if (editingTrialRecord) {
      const updated = updateExistingTrial(record);
      setTrials(updated);
      setToastMessage({
        text: `✓ Data trial ${record.Full_Name} berhasil diperbarui!`,
        type: 'success',
      });
    } else {
      const updated = saveNewTrial(record);
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
    setIsTrialReviewModalOpen(false);
    setIsTrialRegistrationModalOpen(true);
  };

  const handleDeleteTrial = (id: string) => {
    const updated = deleteStoredTrial(id);
    setTrials(updated);
    setToastMessage({
      text: 'Data trial berhasil dihapus dari daftar Upcoming Trial.',
      type: 'info',
    });
  };

  const handleStartTrialSession = (trial: TrialRegistrationRecord) => {
    setIsEditing(false);
    setEditingRowOriginalId(null);
    setIsTrialReviewModalOpen(false);

    // Auto populate Scorecard Form from Trial Registration
    setFormData({
      ...INITIAL_RECORD,
      id: `rec-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      entry_type: 'trial',
      Customer_type: 'trial',
      Full_Name: trial.Full_Name,
      Gender: trial.Gender === 'Female' ? 'female' : 'male',
      DoB: trial.DoB,
      Umur: trial.Umur,
      MemberID: trial.MemberID,
      Test_Date: new Date().toISOString().split('T')[0],
      Coaches: trial.Coaches && trial.Coaches.length > 0 ? trial.Coaches[0] : '',
      notes: trial.formadults_catatan
        ? `Catatan Calon Member: ${trial.formadults_catatan}`
        : trial.formadults_riwayat === 'Ada'
        ? `Riwayat Cedera: ${trial.formadults_riwayat_detail || 'Ada'}`
        : '',
    });

    setCurrentTab('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.4 },
    });

    setToastMessage({
      text: `✓ Sesi Trial untuk ${trial.Full_Name} dimulai! Kategori 'Trial', Nama, DoB, dan Gender terisi otomatis. Pilih Coach yang bertugas.`,
      type: 'success',
    });
  };

  const handleConvertToMember = (trial: TrialRegistrationRecord) => {
    const updatedTrial: TrialRegistrationRecord = {
      ...trial,
      trial_status: 'Member TCC',
      updatedAt: new Date().toISOString(),
    };
    const updatedTrials = updateExistingTrial(updatedTrial);
    setTrials(updatedTrials);

    // Also upgrade any existing scorecard with this MemberID to 'member'
    const updatedRecords = records.map((r) => {
      if (r.MemberID === trial.MemberID || r.Full_Name.toLowerCase() === trial.Full_Name.toLowerCase()) {
        return {
          ...r,
          Customer_type: 'member' as CustomerType,
          entry_type: 'member' as const,
          updatedAt: new Date().toISOString(),
        };
      }
      return r;
    });
    setRecords(updatedRecords);

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
    });

    setToastMessage({
      text: `🎉 Sukses! ${trial.Full_Name} resmi di-upgrade menjadi MEMBER TCC!`,
      type: 'success',
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
        archiveCount={records.length}
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
      />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 print:hidden">
        {currentTab === 'archive' ? (
          /* Spacious Full-Page Archive View */
          <div className="space-y-4">
            <ArchiveModal
              records={records}
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
              onSelectNewUser={handleSelectNewUser}
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
        records={records}
        isOpen={isMemberPickerOpen}
        onClose={() => setIsMemberPickerOpen(false)}
        onSelectMemberForNewSession={handleSelectMemberForNewSession}
        onStartBrandNewMember={handleStartBrandNewMember}
      />

      {/* Modal: Archive / Edit Exist Data (Popup mode) */}
      <ArchiveModal
        records={records}
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
