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
import { syncRecordToGoogleSheet, syncAllRecordsToGoogleSheet } from './utils/googleSheets';

import { Header } from './components/Header';
import { EntryTypeSelector } from './components/EntryTypeSelector';
import { ProgressBar } from './components/ProgressBar';
import { PersonalDataSection } from './components/PersonalDataSection';
import { BodyCompositionSection } from './components/BodyCompositionSection';
import { ScoringSection, ScoreItemConfig } from './components/ScoringSection';
import { DataSummarySection } from './components/DataSummarySection';
import { DisclaimerSection } from './components/DisclaimerSection';
import { FooterActions } from './components/FooterActions';

import { ArchiveModal } from './components/ArchiveModal';
import { MemberPickerModal } from './components/MemberPickerModal';
import { GoogleSheetModal } from './components/GoogleSheetModal';
import { BMICalculatorModal } from './components/BMICalculatorModal';
import { PrintView } from './components/PrintView';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Tab & Modal states
  const [currentTab, setCurrentTab] = useState<'form' | 'archive'>('form');
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isMemberPickerOpen, setIsMemberPickerOpen] = useState(false);
  const [isGoogleSheetModalOpen, setIsGoogleSheetModalOpen] = useState(false);
  const [isBMIRefOpen, setIsBMIRefOpen] = useState(false);

  // Stored Records
  const [records, setRecords] = useState<ScoreCardRecord[]>([]);

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
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Initialize records on mount
  useEffect(() => {
    const loaded = getStoredRecords();
    setRecords(loaded);
  }, []);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const [hasSheetUrl, setHasSheetUrl] = useState<boolean>(() => hasGoogleSheetUrlConfigured());
  const [isSheetConnected, setIsSheetConnected] = useState<boolean>(() => isDatabaseConnected());

  const handleUrlUpdated = () => {
    const configured = hasGoogleSheetUrlConfigured();
    setHasSheetUrl(configured);
    setIsSheetConnected(isDatabaseConnected());
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

  // Mode 2: New User (Trial)
  const handleSelectNewUser = () => {
    setIsEditing(false);
    setEditingRowOriginalId(null);
    setFormData({
      ...INITIAL_RECORD,
      id: `rec-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      entry_type: 'trial',
      Customer_type: 'trial',
      MemberID: generateMemberId(),
      Test_Date: new Date().toISOString().split('T')[0],
    });
    setToastMessage({
      text: 'Formulir Trial (New User) baru siap diisi.',
      type: 'info',
    });
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

  // Print PDF score card
  const handlePrint = () => {
    window.print();
  };

  // Print specific record from archive
  const handlePrintSpecificRecord = (record: ScoreCardRecord) => {
    setFormData(record);
    setTimeout(() => {
      window.print();
    }, 150);
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in slide-in-from-bottom-5 duration-200">
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

      {/* Main Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        archiveCount={records.length}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenGoogleSheetModal={() => setIsGoogleSheetModalOpen(true)}
        isSheetConnected={isSheetConnected}
        hasSheetUrl={hasSheetUrl}
        onToggleConnection={handleToggleSheetConnection}
        onPrint={handlePrint}
      />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
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
              isSyncing={isSyncing}
              isSheetConnected={isSheetConnected}
              hasSheetUrl={hasSheetUrl}
              onOpenGoogleSheetModal={() => setIsGoogleSheetModalOpen(true)}
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
              notes={formData.notes}
              onNotesChange={(text) => handleFieldChange('notes', text)}
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
      <PrintView record={formData} />

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
    </div>
  );
}
