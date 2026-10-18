import React, { useState, useEffect } from 'react';
import {
  TrialRegistrationRecord,
  INITIAL_TRIAL_RECORD,
  TrialCustomerType,
  GRADE_OPTIONS,
  FREKUENSI_OPTIONS,
  PERFORMANCE_CATEGORIES,
  PROGRAM_OPTIONS,
  getIndonesianDayName,
  computeScheduleStatus,
} from '../types/trialRegistration';
import { COACHES_LIST } from '../types/scoreCard';
import { calculateAge } from '../utils/calculations';
import { cleanPhoneNumber } from '../utils/trialStorage';
import {
  X,
  UserPlus,
  Calendar,
  Clock,
  Heart,
  Activity,
  Award,
  GraduationCap,
  Briefcase,
  Users,
  Check,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';

export type TrialTabSection = 'profil' | 'riwayat' | 'sekolah' | 'orangtua' | 'medis' | 'asesmen';

interface TrialRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: TrialRegistrationRecord) => void;
  initialType?: TrialCustomerType;
  editingTrial?: TrialRegistrationRecord | null;
  initialSection?: 'profil' | 'riwayat' | 'sekolah' | 'orangtua' | 'medis' | 'asesmen';
}

export const TrialRegistrationModal: React.FC<TrialRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialType = 'Trial Adults',
  editingTrial,
  initialSection = 'profil',
}) => {
  const [formData, setFormData] = useState<TrialRegistrationRecord>(() => {
    if (editingTrial) return editingTrial;
    const randomId = Math.floor(1000 + Math.random() * 9000);
    return {
      ...INITIAL_TRIAL_RECORD,
      id: `trial-${Date.now()}`,
      MemberID: `TCC-TR-${randomId}`,
      Customer_type: initialType,
      schedule_status: 'Pending',
      trial_status: 'Menunggu Trial',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  const getEffectiveSection = (sec?: string): TrialTabSection => {
    if (sec === 'riwayat') return 'sekolah';
    if (sec === 'orangtua' || sec === 'sekolah' || sec === 'medis' || sec === 'asesmen') return sec;
    return 'profil';
  };

  const [activeTabSection, setActiveTabSection] = useState<TrialTabSection>(() =>
    getEffectiveSection(initialSection)
  );

  // Reset or initialize when modal opens or editingTrial changes
  useEffect(() => {
    if (editingTrial) {
      setFormData(editingTrial);
    } else {
      const randomId = Math.floor(1000 + Math.random() * 9000);
      setFormData({
        ...INITIAL_TRIAL_RECORD,
        id: `trial-${Date.now()}`,
        MemberID: `TCC-TR-${randomId}`,
        Customer_type: initialType,
        schedule_status: 'Pending',
        trial_status: 'Menunggu Trial',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    if (isOpen) {
      setActiveTabSection(getEffectiveSection(initialSection));
    }
  }, [editingTrial, initialType, isOpen, initialSection]);

  if (!isOpen) return null;

  const handleChange = (field: keyof TrialRegistrationRecord, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto compute age if DoB changes
      if (field === 'DoB') {
        updated.Umur = calculateAge(value);
      }

      // Auto compute Day if Trial_Date changes
      if (field === 'Trial_Date') {
        updated.Trial_Day = getIndonesianDayName(value);
      }

      // Safeguard against formula error strings in phone fields
      if (
        (field === 'WhatsApp_Number' ||
         field === 'Emergency_Contact' ||
         field === 'no_whatsapp_ayah' ||
         field === 'no_whatsapp_ibu' ||
         field === 'no_whatsapp_wali') &&
        typeof value === 'string'
      ) {
        if (value.toLowerCase().includes('error') || value.startsWith('#')) {
          (updated as any)[field] = '';
        }
      }

      // Auto recalculate schedule_status: Confirmed HANYA JIKA Tanggal + Hari + Waktu + Coach terpilih!
      updated.schedule_status = computeScheduleStatus(updated);

      // Auto averages for physical assessments
      if (field === 'lower_body' || field === 'core' || field === 'upper_body') {
        const lb = field === 'lower_body' ? value : updated.lower_body;
        const cr = field === 'core' ? value : updated.core;
        const ub = field === 'upper_body' ? value : updated.upper_body;
        const nums = [lb, cr, ub].filter((n) => typeof n === 'number' && n > 0);
        updated.avg_strength = nums.length > 0 ? Number((nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2)) : null;
      }

      if (field === 'body_control' || field === 'flexibility' || field === 'agility' || field === 'speed') {
        const bc = field === 'body_control' ? value : updated.body_control;
        const fl = field === 'flexibility' ? value : updated.flexibility;
        const ag = field === 'agility' ? value : updated.agility;
        const sp = field === 'speed' ? value : updated.speed;
        const nums = [bc, fl, ag, sp].filter((n) => typeof n === 'number' && n > 0);
        updated.avg_skill = nums.length > 0 ? Number((nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2)) : null;
      }

      if (field === 'integrity' || field === 'principled' || field === 'perseverance' || field === 'believe_god') {
        const it = field === 'integrity' ? value : updated.integrity;
        const pr = field === 'principled' ? value : updated.principled;
        const ps = field === 'perseverance' ? value : updated.perseverance;
        const bg = field === 'believe_god' ? value : updated.believe_god;
        const nums = [it, pr, ps, bg].filter((n) => typeof n === 'number' && n > 0);
        updated.avg_character = nums.length > 0 ? Number((nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2)) : null;
      }

      return updated;
    });
  };

  const handleToggleCoach = (coachName: string) => {
    const currentCoaches = formData.Coaches || [];
    let nextCoaches: string[];
    if (currentCoaches.includes(coachName)) {
      nextCoaches = currentCoaches.filter((c) => c !== coachName);
    } else {
      nextCoaches = [...currentCoaches, coachName];
    }
    handleChange('Coaches', nextCoaches);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Full_Name.trim()) {
      alert('Mohon isi Nama Lengkap Calon Member.');
      return;
    }

    // Auto upgrade trial_status to 'Selesai Trial' if assessment section has been filled
    const hasAssessmentData = Boolean(
      formData.lower_body ||
      formData.core ||
      formData.upper_body ||
      formData.body_control ||
      formData.flexibility ||
      formData.agility ||
      formData.speed ||
      formData.integrity ||
      formData.principled ||
      formData.perseverance ||
      formData.believe_god ||
      formData.kekuatan_utama ||
      formData.perlu_develop ||
      formData.cat_performance ||
      formData.rekomendasi_program
    );

    const finalTrialStatus = hasAssessmentData && formData.trial_status === 'Menunggu Trial'
      ? 'Selesai Trial'
      : formData.trial_status;

    const finalRecord: TrialRegistrationRecord = {
      ...formData,
      WhatsApp_Number: cleanPhoneNumber(formData.WhatsApp_Number),
      Emergency_Contact: cleanPhoneNumber(formData.Emergency_Contact),
      no_whatsapp_ayah: cleanPhoneNumber(formData.no_whatsapp_ayah),
      no_whatsapp_ibu: cleanPhoneNumber(formData.no_whatsapp_ibu),
      no_whatsapp_wali: cleanPhoneNumber(formData.no_whatsapp_wali),
      schedule_status: computeScheduleStatus(formData),
      trial_status: finalTrialStatus,
      updatedAt: new Date().toISOString(),
    };

    onSave(finalRecord);
  };

  const handleClear = () => {
    if (confirm('Kosongkan isian formulir registrasi?')) {
      const randomId = Math.floor(1000 + Math.random() * 9000);
      setFormData({
        ...INITIAL_TRIAL_RECORD,
        id: `trial-${Date.now()}`,
        MemberID: `TCC-TR-${randomId}`,
        Customer_type: formData.Customer_type,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const isKids = formData.Customer_type === 'Trial Kids';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center font-extrabold text-xs">
              TCC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
                  {editingTrial ? 'Edit Data & Jadwal Trial' : 'Form Registrasi Digital Calon Peserta Trial'}
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {formData.MemberID}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Perekaman data administrasi calon member sebelum sesi Physical Fitness Score Card
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Toggle: Adults vs Kids */}
        <div className="px-6 pt-4 pb-2 bg-slate-100/50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pilih Tipe Customer:</span>
            <div className="inline-flex rounded-xl p-1 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold">
              <button
                type="button"
                onClick={() => handleChange('Customer_type', 'Trial Adults')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  formData.Customer_type === 'Trial Adults'
                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Trial ADULTS 🧑
              </button>
              <button
                type="button"
                onClick={() => handleChange('Customer_type', 'Trial Kids')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  formData.Customer_type === 'Trial Kids'
                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Trial KIDS 🧒
              </button>
            </div>
          </div>

          {/* Section Navigation Tabs (1 s/d 5 Sesuai Struktur CSV) */}
          <div className="flex items-center gap-1 text-xs overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setActiveTabSection('profil')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 ${
                activeTabSection === 'profil'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              1. Identitas & Jadwal
            </button>
            <button
              type="button"
              onClick={() => setActiveTabSection('sekolah')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 ${
                activeTabSection === 'sekolah'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {isKids ? '2. Sekolah & Klub' : '2. Klub & Olahraga'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTabSection('orangtua')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 ${
                activeTabSection === 'orangtua'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {isKids ? '3. Data Orang Tua / Wali' : '3. Pekerjaan & Olahraga'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTabSection('medis')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 ${
                activeTabSection === 'medis'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              4. Riwayat Medis / Cedera
            </button>
            <button
              type="button"
              onClick={() => setActiveTabSection('asesmen')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 ${
                activeTabSection === 'asesmen'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              5. Asesmen Fisik Trial
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SECTION 1: IDENTITAS & JADWAL */}
          {activeTabSection === 'profil' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-900 dark:text-slate-100 border-b pb-2 mb-4 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-emerald-600" />
                  Identitas Calon Peserta Trial ({formData.Customer_type})
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  {/* Full Name */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Nama Lengkap <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Bima Satria Perkasa"
                      value={formData.Full_Name}
                      onChange={(e) => handleChange('Full_Name', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Gender */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Gender</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleChange('Gender', 'Male')}
                        className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                          formData.Gender === 'Male'
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        Laki-laki
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChange('Gender', 'Female')}
                        className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                          formData.Gender === 'Female'
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        Perempuan
                      </button>
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Tanggal Lahir (DoB)
                    </label>
                    <input
                      type="date"
                      value={formData.DoB}
                      onChange={(e) => handleChange('DoB', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Umur (Auto calculated) */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Umur (Tahun)
                    </label>
                    <input
                      type="number"
                      readOnly
                      placeholder="Otomatis dari DoB"
                      value={formData.Umur ?? ''}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold cursor-not-allowed"
                    />
                  </div>

                  {/* WhatsApp */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      No. WhatsApp (+62)
                    </label>
                    <input
                      type="tel"
                      placeholder="+62 812-xxxx-xxxx"
                      value={formData.WhatsApp_Number}
                      onChange={(e) => handleChange('WhatsApp_Number', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Emergency Contact */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Kontak Darurat (+62)
                    </label>
                    <input
                      type="tel"
                      placeholder="+62 813-xxxx-xxxx"
                      value={formData.Emergency_Contact}
                      onChange={(e) => handleChange('Emergency_Contact', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Email */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Alamat Email</label>
                    <input
                      type="email"
                      placeholder="contoh: nama.customer@gmail.com"
                      value={formData.Email}
                      onChange={(e) => handleChange('Email', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* JADWAL SESI TRIAL */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-rose-500" />
                    Penjadwalan Sesi Trial (Hari, Tanggal, & Jam)
                  </h4>

                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    formData.schedule_status === 'Confirmed'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                  }`}>
                    {formData.schedule_status === 'Confirmed' ? '✓ Terkonfirmasi' : 'Belum Ada Jadwal'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  {/* Tanggal Sesi */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Tanggal Sesi</label>
                    <input
                      type="date"
                      value={formData.Trial_Date}
                      onChange={(e) => handleChange('Trial_Date', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                    />
                  </div>

                  {/* Hari (Auto) */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Hari (Otomatis)</label>
                    <input
                      type="text"
                      readOnly
                      placeholder="Otomatis dari tanggal"
                      value={formData.Trial_Day}
                      className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300"
                    />
                  </div>

                  {/* Waktu / Jam */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Jam Sesi (WIB)</label>
                    <input
                      type="time"
                      value={formData.Trial_Time}
                      onChange={(e) => handleChange('Trial_Time', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                    />
                  </div>
                </div>

                {/* Multiple Coach Selection */}
                <div className="space-y-2 pt-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 text-xs block">
                    Coach / Instruktur Ditugaskan (Bisa pilih lebih dari satu):
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COACHES_LIST.map((coachName) => {
                      const isSelected = formData.Coaches?.includes(coachName);
                      return (
                        <button
                          key={coachName}
                          type="button"
                          onClick={() => handleToggleCoach(coachName)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                          <span>{coachName}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: SEKOLAH & KLUB (KIDS) / KLUB & OLAHRAGA (ADULTS) */}
          {activeTabSection === 'sekolah' && (
            <div className="space-y-6">
              {isKids ? (
                /* KHUSUS KIDS: SEKOLAH & KLUB OLAHRAGA ANAK */
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-900 dark:text-slate-100 border-b pb-2 mb-4 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-amber-500" />
                    2. Data Sekolah & Klub Olahraga Anak (Kids)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Nama Sekolah</label>
                      <input
                        type="text"
                        placeholder="Nama Sekolah Dasar / Menengah"
                        value={formData.nama_sekolah || ''}
                        onChange={(e) => handleChange('nama_sekolah', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Kelas / Grade</label>
                      <select
                        value={formData.kelas_grade || ''}
                        onChange={(e) => handleChange('kelas_grade', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                      >
                        <option value="">-- Pilih Grade --</option>
                        {GRADE_OPTIONS.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">
                        Pernah Gabung Klub / Komunitas?
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleChange('formakids_tergabung_dalamClub', 'YA')}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border ${
                            formData.formakids_tergabung_dalamClub === 'YA'
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          YA
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChange('formakids_tergabung_dalamClub', 'TIDAK')}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border ${
                            formData.formakids_tergabung_dalamClub === 'TIDAK'
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          TIDAK
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Jenis Cabang Olahraga</label>
                      <input
                        type="text"
                        placeholder="misal: Renang, Basket, Sepak Bola"
                        value={formData.formakids_cabang_olahraga || ''}
                        onChange={(e) => handleChange('formakids_cabang_olahraga', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Frekuensi Latihan / Minggu</label>
                      <select
                        value={formData.formakids_frek_Latihan || ''}
                        onChange={(e) => handleChange('formakids_frek_Latihan', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                      >
                        <option value="">-- Pilih Frekuensi --</option>
                        {FREKUENSI_OPTIONS.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Aktif Olahraga Saat Ini?</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleChange('formakids_aktif_olahraga', 'YA')}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border ${
                            formData.formakids_aktif_olahraga === 'YA'
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          YA
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChange('formakids_aktif_olahraga', 'TIDAK')}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border ${
                            formData.formakids_aktif_olahraga === 'TIDAK'
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          TIDAK
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* KHUSUS ADULTS: KLUB & OLAHRAGA */
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-900 dark:text-slate-100 border-b pb-2 mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    2. Riwayat Klub & Komunitas Olahraga (Adults)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Pernah Tergabung Komunitas / Klub?</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleChange('formadults_tergabung_dalamKlub', 'YA')}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border ${
                            formData.formadults_tergabung_dalamKlub === 'YA'
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          YA
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChange('formadults_tergabung_dalamKlub', 'TIDAK')}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border ${
                            formData.formadults_tergabung_dalamKlub === 'TIDAK'
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          TIDAK
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Jenis Cabang Olahraga</label>
                      <input
                        type="text"
                        placeholder="misal: Lari, Sepeda, Crossfit, Tennis, Gym"
                        value={formData.formadults_cabang_olahraga || ''}
                        onChange={(e) => handleChange('formadults_cabang_olahraga', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Frekuensi Latihan / Minggu</label>
                      <select
                        value={formData.formadults_frek_Latihan || ''}
                        onChange={(e) => handleChange('formadults_frek_Latihan', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                      >
                        <option value="">-- Pilih Frekuensi --</option>
                        {FREKUENSI_OPTIONS.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Aktif Olahraga Saat Ini?</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleChange('formadults_aktif_olahraga', 'YA')}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border ${
                            formData.formadults_aktif_olahraga === 'YA'
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          YA
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChange('formadults_aktif_olahraga', 'TIDAK')}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border ${
                            formData.formadults_aktif_olahraga === 'TIDAK'
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          TIDAK
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION 3: DATA ORANG TUA / WALI (KIDS) / PEKERJAAN & OLAHRAGA (ADULTS) */}
          {activeTabSection === 'orangtua' && (
            <div className="space-y-6">
              {isKids ? (
                /* KHUSUS KIDS: DATA ORANG TUA / WALI */
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-900 dark:text-slate-100 border-b pb-2 mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    3. Data Orang Tua / Wali (Kids)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Nama Ayah</label>
                      <input
                        type="text"
                        placeholder="Nama lengkap ayah"
                        value={formData.nama_ayah || ''}
                        onChange={(e) => handleChange('nama_ayah', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">No. WhatsApp Ayah</label>
                      <input
                        type="tel"
                        placeholder="0812-xxxx atau +62 812-xxxx"
                        value={formData.no_whatsapp_ayah || ''}
                        onChange={(e) => handleChange('no_whatsapp_ayah', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Email Orang Tua</label>
                      <input
                        type="email"
                        placeholder="email.ayah.ibu@gmail.com"
                        value={formData.email_orangTua || ''}
                        onChange={(e) => handleChange('email_orangTua', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Nama Ibu</label>
                      <input
                        type="text"
                        placeholder="Nama lengkap ibu"
                        value={formData.nama_ibu || ''}
                        onChange={(e) => handleChange('nama_ibu', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">No. WhatsApp Ibu</label>
                      <input
                        type="tel"
                        placeholder="0813-xxxx atau +62 813-xxxx"
                        value={formData.no_whatsapp_ibu || ''}
                        onChange={(e) => handleChange('no_whatsapp_ibu', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Nama Wali (Jika ada)</label>
                      <input
                        type="text"
                        placeholder="Opsional / jika ada wali"
                        value={formData.nama_wali || ''}
                        onChange={(e) => handleChange('nama_wali', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">No. WhatsApp Wali</label>
                      <input
                        type="tel"
                        placeholder="Opsional / No WA Wali"
                        value={formData.no_whatsapp_wali || ''}
                        onChange={(e) => handleChange('no_whatsapp_wali', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Email Wali</label>
                      <input
                        type="email"
                        placeholder="Opsional / email wali"
                        value={formData.email_wali || ''}
                        onChange={(e) => handleChange('email_wali', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* KHUSUS ADULTS: PEKERJAAN & OLAHRAGA (KANTOR) */
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-900 dark:text-slate-100 border-b pb-2 mb-4 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-500" />
                    3. Data Pekerjaan & Olahraga (Adults)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Pekerjaan / Profesi</label>
                      <input
                        type="text"
                        placeholder="contoh: Pegawai Swasta, Dokter, Guru, Wiraswasta"
                        value={formData.formadults_pekerjaan || ''}
                        onChange={(e) => handleChange('formadults_pekerjaan', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Nama Perusahaan / Instansi</label>
                      <input
                        type="text"
                        placeholder="Nama instansi / perusahaan"
                        value={formData.formadults_perusahaan || ''}
                        onChange={(e) => handleChange('formadults_perusahaan', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2 md:col-span-1">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Alamat Kantor</label>
                      <input
                        type="text"
                        placeholder="Kota / daerah kantor"
                        value={formData.formadults_alamatKantor || ''}
                        onChange={(e) => handleChange('formadults_alamatKantor', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION 3: RIWAYAT KESEHATAN & CIDERA */}
          {activeTabSection === 'medis' && (
            <div className="space-y-6">
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-900 dark:text-slate-100 border-b pb-2 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                Skrining Riwayat Kesehatan & Cedera (Wajib Disalin dari Lembar Kertas)
              </h3>

              <div className="space-y-4 text-xs">
                {/* 1. Kondisi Kesehatan Saat Ini */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      1. Kondisi kesehatan saat ini:
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleChange('formadults_kondisi', 'Sehat')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                          formData.formadults_kondisi === 'Sehat'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        Sehat
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChange('formadults_kondisi', 'Ada Kondisi Khusus')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                          formData.formadults_kondisi === 'Ada Kondisi Khusus'
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        Ada Kondisi Khusus
                      </button>
                    </div>
                  </div>
                  {formData.formadults_kondisi === 'Ada Kondisi Khusus' && (
                    <input
                      type="text"
                      placeholder="Jelaskan kondisi khusus (contoh: Hipertensi, Asma, Diabetes)"
                      value={formData.formadults_kondisi_detail || ''}
                      onChange={(e) => handleChange('formadults_kondisi_detail', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-800 font-semibold"
                    />
                  )}
                </div>

                {/* 2. Riwayat Cedera */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      2. Riwayat Cedera (Lutut, Bahu, Punggung, dll):
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleChange('formadults_riwayat', 'Tidak Ada')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                          formData.formadults_riwayat === 'Tidak Ada'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        Tidak Ada
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChange('formadults_riwayat', 'Ada')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                          formData.formadults_riwayat === 'Ada'
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        Ada Cedera
                      </button>
                    </div>
                  </div>
                  {formData.formadults_riwayat === 'Ada' && (
                    <input
                      type="text"
                      placeholder="Jelaskan riwayat cedera (contoh: Keseleo Ankle kanan, Meniskus lutut kiri)"
                      value={formData.formadults_riwayat_detail || ''}
                      onChange={(e) => handleChange('formadults_riwayat_detail', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-800 font-semibold"
                    />
                  )}
                </div>

                {/* 3. Operasi Cedera 12 Bulan Terakhir */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      3. Operasi cedera dalam 12 bulan terakhir:
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleChange('formadults_cideraOperasi', 'Tidak Ada')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                          formData.formadults_cideraOperasi === 'Tidak Ada'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        Tidak Ada
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChange('formadults_cideraOperasi', 'Ada')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                          formData.formadults_cideraOperasi === 'Ada'
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        Ada Operasi
                      </button>
                    </div>
                  </div>
                  {formData.formadults_cideraOperasi === 'Ada' && (
                    <input
                      type="text"
                      placeholder="Jelaskan jenis operasi (contoh: Rekonstruksi ACL, Operasi Tulang Belikat)"
                      value={formData.formadults_cideraOperasi_detail || ''}
                      onChange={(e) => handleChange('formadults_cideraOperasi_detail', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-800 font-semibold"
                    />
                  )}
                </div>

                {/* 4. Kondisi Medis Khusus / Alergi */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      4. Kondisi medis khusus / Alergi:
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleChange('formadults_medisKhusus', 'Tidak Ada')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                          formData.formadults_medisKhusus === 'Tidak Ada'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        Tidak Ada
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChange('formadults_medisKhusus', 'Ada')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                          formData.formadults_medisKhusus === 'Ada'
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        Ada Alergi / Khusus
                      </button>
                    </div>
                  </div>
                  {formData.formadults_medisKhusus === 'Ada' && (
                    <input
                      type="text"
                      placeholder="Jelaskan kondisi alergi (contoh: Debu, Asma dingin, Serbuk bunga)"
                      value={formData.formadults_medisKhusus_detail || ''}
                      onChange={(e) => handleChange('formadults_medisKhusus_detail', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-800 font-semibold"
                    />
                  )}
                </div>

                {/* 5. Catatan Tambahan untuk Coach */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Catatan Lain yang Perlu Diketahui Coach / Instruktur:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tuliskan target khusus, keluhan postur, atau pesan tambahan..."
                    value={formData.formadults_catatan || ''}
                    onChange={(e) => handleChange('formadults_catatan', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: ASESMEN FISIK TRIAL (OPSIONAL / PRE-FILL) */}
          {activeTabSection === 'asesmen' && (
            <div className="space-y-6">
              <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs text-sky-800 dark:text-sky-300">
                <span className="font-bold">Info untuk Pelatih: </span>
                Bagian ini dapat diisi saat atau sesudah sesi trial berlangsung, atau dapat juga dinilai langsung di form <strong>Physical Fitness Score Card</strong> utama.
              </div>

              {/* Strength (1-5) */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      1. Strength (Skor 1 - 5)
                    </h4>
                    {(formData.lower_body || formData.core || formData.upper_body) && (
                      <button
                        type="button"
                        onClick={() => {
                          handleChange('lower_body', null);
                          handleChange('core', null);
                          handleChange('upper_body', null);
                        }}
                        className="text-[10px] font-bold text-rose-500 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900 cursor-pointer"
                        title="Kosongkan semua nilai Strength"
                      >
                        ✕ Reset Strength
                      </button>
                    )}
                  </div>
                  <span className="text-xs font-bold text-emerald-600">
                    Average: {formData.avg_strength ?? '-'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Lower Body */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold">A. Lower Body</label>
                      {formData.lower_body !== null && formData.lower_body !== undefined && (
                        <button
                          type="button"
                          onClick={() => handleChange('lower_body', null)}
                          className="text-[10px] text-rose-500 hover:underline font-bold"
                        >
                          ✕ Kosongkan
                        </button>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((lvl) => {
                        const isSel = formData.lower_body === lvl;
                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => handleChange('lower_body', isSel ? null : lvl)}
                            title={isSel ? 'Klik lagi untuk mengosongkan nilai' : `Pilih nilai ${lvl}`}
                            className={`flex-1 py-1 rounded-lg font-bold border text-xs cursor-pointer transition-all ${
                              isSel
                                ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-500/30 shadow-xs'
                                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            {lvl}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Core */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold">B. Core</label>
                      {formData.core !== null && formData.core !== undefined && (
                        <button
                          type="button"
                          onClick={() => handleChange('core', null)}
                          className="text-[10px] text-rose-500 hover:underline font-bold"
                        >
                          ✕ Kosongkan
                        </button>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((lvl) => {
                        const isSel = formData.core === lvl;
                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => handleChange('core', isSel ? null : lvl)}
                            title={isSel ? 'Klik lagi untuk mengosongkan nilai' : `Pilih nilai ${lvl}`}
                            className={`flex-1 py-1 rounded-lg font-bold border text-xs cursor-pointer transition-all ${
                              isSel
                                ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-500/30 shadow-xs'
                                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            {lvl}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Upper Body */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold">C. Upper Body</label>
                      {formData.upper_body !== null && formData.upper_body !== undefined && (
                        <button
                          type="button"
                          onClick={() => handleChange('upper_body', null)}
                          className="text-[10px] text-rose-500 hover:underline font-bold"
                        >
                          ✕ Kosongkan
                        </button>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((lvl) => {
                        const isSel = formData.upper_body === lvl;
                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => handleChange('upper_body', isSel ? null : lvl)}
                            title={isSel ? 'Klik lagi untuk mengosongkan nilai' : `Pilih nilai ${lvl}`}
                            className={`flex-1 py-1 rounded-lg font-bold border text-xs cursor-pointer transition-all ${
                              isSel
                                ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-500/30 shadow-xs'
                                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            {lvl}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Related Fitness (1-5) */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      2. Skills Related Fitness - Running Lane (Skor 1 - 5)
                    </h4>
                    {(formData.body_control || formData.flexibility || formData.agility || formData.speed) && (
                      <button
                        type="button"
                        onClick={() => {
                          handleChange('body_control', null);
                          handleChange('flexibility', null);
                          handleChange('agility', null);
                          handleChange('speed', null);
                        }}
                        className="text-[10px] font-bold text-rose-500 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900 cursor-pointer"
                        title="Kosongkan semua nilai Skill"
                      >
                        ✕ Reset Skill
                      </button>
                    )}
                  </div>
                  <span className="text-xs font-bold text-emerald-600">
                    Average: {formData.avg_skill ?? '-'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold">Body Control</label>
                      {formData.body_control !== null && formData.body_control !== undefined && (
                        <button
                          type="button"
                          onClick={() => handleChange('body_control', null)}
                          className="text-[10px] text-rose-500 hover:underline font-bold"
                        >
                          ✕ Reset
                        </button>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((lvl) => {
                        const isSel = formData.body_control === lvl;
                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => handleChange('body_control', isSel ? null : lvl)}
                            title={isSel ? 'Klik lagi untuk mengosongkan nilai' : `Pilih nilai ${lvl}`}
                            className={`flex-1 py-1 rounded-lg font-bold border text-xs cursor-pointer transition-all ${
                              isSel
                                ? 'bg-sky-600 text-white border-sky-600 ring-2 ring-sky-500/30 shadow-xs'
                                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            {lvl}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold">Flexibility</label>
                      {formData.flexibility !== null && formData.flexibility !== undefined && (
                        <button
                          type="button"
                          onClick={() => handleChange('flexibility', null)}
                          className="text-[10px] text-rose-500 hover:underline font-bold"
                        >
                          ✕ Reset
                        </button>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((lvl) => {
                        const isSel = formData.flexibility === lvl;
                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => handleChange('flexibility', isSel ? null : lvl)}
                            title={isSel ? 'Klik lagi untuk mengosongkan nilai' : `Pilih nilai ${lvl}`}
                            className={`flex-1 py-1 rounded-lg font-bold border text-xs cursor-pointer transition-all ${
                              isSel
                                ? 'bg-sky-600 text-white border-sky-600 ring-2 ring-sky-500/30 shadow-xs'
                                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            {lvl}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold">Agility</label>
                      {formData.agility !== null && formData.agility !== undefined && (
                        <button
                          type="button"
                          onClick={() => handleChange('agility', null)}
                          className="text-[10px] text-rose-500 hover:underline font-bold"
                        >
                          ✕ Reset
                        </button>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((lvl) => {
                        const isSel = formData.agility === lvl;
                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => handleChange('agility', isSel ? null : lvl)}
                            title={isSel ? 'Klik lagi untuk mengosongkan nilai' : `Pilih nilai ${lvl}`}
                            className={`flex-1 py-1 rounded-lg font-bold border text-xs cursor-pointer transition-all ${
                              isSel
                                ? 'bg-sky-600 text-white border-sky-600 ring-2 ring-sky-500/30 shadow-xs'
                                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            {lvl}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold">Speed</label>
                      {formData.speed !== null && formData.speed !== undefined && (
                        <button
                          type="button"
                          onClick={() => handleChange('speed', null)}
                          className="text-[10px] text-rose-500 hover:underline font-bold"
                        >
                          ✕ Reset
                        </button>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((lvl) => {
                        const isSel = formData.speed === lvl;
                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => handleChange('speed', isSel ? null : lvl)}
                            title={isSel ? 'Klik lagi untuk mengosongkan nilai' : `Pilih nilai ${lvl}`}
                            className={`flex-1 py-1 rounded-lg font-bold border text-xs cursor-pointer transition-all ${
                              isSel
                                ? 'bg-sky-600 text-white border-sky-600 ring-2 ring-sky-500/30 shadow-xs'
                                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            {lvl}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* DEDICATED SUMMARY BOX: TOTAL AVERAGE OVERALL (STRENGTH & SKILL RELATED FITNESS) */}
              {(() => {
                const validAvgs = [formData.avg_strength, formData.avg_skill].filter(
                  (n): n is number => typeof n === 'number' && n > 0
                );
                const overallPhysicalAvg =
                  validAvgs.length > 0
                    ? Number((validAvgs.reduce((a, b) => a + b, 0) / validAvgs.length).toFixed(2))
                    : null;

                const getOverallGrade = (avg: number | null) => {
                  if (avg === null) return 'Menunggu Pengisian Skor';
                  if (avg >= 4.0) return 'EXCELLENT (SANGAT BAIK)';
                  if (avg >= 3.25) return 'GOOD (SOLID FOUNDATION)';
                  if (avg >= 2.5) return 'FAIR (NEED DEVELOPMENT)';
                  return 'BASIC FUNDAMENTAL LEVEL';
                };

                return (
                  <div className="bg-slate-950 text-white rounded-xl p-4 border border-slate-800 shadow-sm space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-400 shrink-0" />
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-wider text-white">
                            Total Average Overall / Summary (Strength & Skill Related Fitness)
                          </h4>
                          <p className="text-[10px] text-slate-400">
                            Kalkulasi otomatis skor rata-rata gabungan sesi 1 (Strength) & sesi 2 (Skill)
                          </p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right shrink-0">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">TOTAL OVERALL SCORE</span>
                        <span className="text-xl font-black font-mono text-emerald-400">
                          {overallPhysicalAvg !== null ? `${overallPhysicalAvg.toFixed(2)}` : '-.--'}
                          <span className="text-xs text-slate-400 font-normal"> / 5.00</span>
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800 flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">1. Avg Strength:</span>
                        <span className="font-mono font-bold text-emerald-400 text-xs">
                          {formData.avg_strength !== null && formData.avg_strength !== undefined ? `${formData.avg_strength.toFixed(2)}` : '-'}
                        </span>
                      </div>
                      <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800 flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">2. Avg Skill:</span>
                        <span className="font-mono font-bold text-sky-400 text-xs">
                          {formData.avg_skill !== null && formData.avg_skill !== undefined ? `${formData.avg_skill.toFixed(2)}` : '-'}
                        </span>
                      </div>
                      <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800 flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">Predikat Fisik:</span>
                        <span className="font-bold text-amber-300 text-xs truncate">
                          {getOverallGrade(overallPhysicalAvg)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 3. Evaluasi Karakter, Sikap & Etos Latihan (1-5) */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      3. Evaluasi Karakter, Sikap & Etos Latihan (Skor 1 - 5)
                    </h4>
                    {(formData.integrity || formData.principled || formData.perseverance || formData.believe_god) && (
                      <button
                        type="button"
                        onClick={() => {
                          handleChange('integrity', null);
                          handleChange('principled', null);
                          handleChange('perseverance', null);
                          handleChange('believe_god', null);
                        }}
                        className="text-[10px] font-bold text-rose-500 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900 cursor-pointer"
                        title="Kosongkan semua nilai Karakter"
                      >
                        ✕ Reset Karakter
                      </button>
                    )}
                  </div>
                  <span className="text-xs font-bold text-indigo-600">
                    Average: {formData.avg_character !== null && formData.avg_character !== undefined ? Number(formData.avg_character).toFixed(2) : '-'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold">Integritas</label>
                      {formData.integrity !== null && formData.integrity !== undefined && (
                        <button
                          type="button"
                          onClick={() => handleChange('integrity', null)}
                          className="text-[10px] text-rose-500 hover:underline font-bold"
                        >
                          ✕ Reset
                        </button>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((lvl) => {
                        const isSel = formData.integrity === lvl;
                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => handleChange('integrity', isSel ? null : lvl)}
                            title={isSel ? 'Klik lagi untuk mengosongkan nilai' : `Pilih nilai ${lvl}`}
                            className={`flex-1 py-1 rounded-lg font-bold border text-xs cursor-pointer transition-all ${
                              isSel
                                ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-500/30 shadow-xs'
                                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            {lvl}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold">Berprinsip</label>
                      {formData.principled !== null && formData.principled !== undefined && (
                        <button
                          type="button"
                          onClick={() => handleChange('principled', null)}
                          className="text-[10px] text-rose-500 hover:underline font-bold"
                        >
                          ✕ Reset
                        </button>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((lvl) => {
                        const isSel = formData.principled === lvl;
                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => handleChange('principled', isSel ? null : lvl)}
                            title={isSel ? 'Klik lagi untuk mengosongkan nilai' : `Pilih nilai ${lvl}`}
                            className={`flex-1 py-1 rounded-lg font-bold border text-xs cursor-pointer transition-all ${
                              isSel
                                ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-500/30 shadow-xs'
                                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            {lvl}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold">Daya Juang</label>
                      {formData.perseverance !== null && formData.perseverance !== undefined && (
                        <button
                          type="button"
                          onClick={() => handleChange('perseverance', null)}
                          className="text-[10px] text-rose-500 hover:underline font-bold"
                        >
                          ✕ Reset
                        </button>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((lvl) => {
                        const isSel = formData.perseverance === lvl;
                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => handleChange('perseverance', isSel ? null : lvl)}
                            title={isSel ? 'Klik lagi untuk mengosongkan nilai' : `Pilih nilai ${lvl}`}
                            className={`flex-1 py-1 rounded-lg font-bold border text-xs cursor-pointer transition-all ${
                              isSel
                                ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-500/30 shadow-xs'
                                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            {lvl}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold">Rasa Syukur</label>
                      {formData.believe_god !== null && formData.believe_god !== undefined && (
                        <button
                          type="button"
                          onClick={() => handleChange('believe_god', null)}
                          className="text-[10px] text-rose-500 hover:underline font-bold"
                        >
                          ✕ Reset
                        </button>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((lvl) => {
                        const isSel = formData.believe_god === lvl;
                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => handleChange('believe_god', isSel ? null : lvl)}
                            title={isSel ? 'Klik lagi untuk mengosongkan nilai' : `Pilih nilai ${lvl}`}
                            className={`flex-1 py-1 rounded-lg font-bold border text-xs cursor-pointer transition-all ${
                              isSel
                                ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-500/30 shadow-xs'
                                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            {lvl}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rekomendasi Pelatih */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 border-b pb-2">
                  4. Rekomendasi Program Pelatih
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold block mb-1">A. Kekuatan Utama</label>
                    <input
                      type="text"
                      placeholder="Kekuatan utama peserta"
                      value={formData.kekuatan_utama || ''}
                      onChange={(e) => handleChange('kekuatan_utama', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">B. Hal Perlu Dikembangkan</label>
                    <input
                      type="text"
                      placeholder="Area perbaikan"
                      value={formData.perlu_develop || ''}
                      onChange={(e) => handleChange('perlu_develop', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">C. Category Performance</label>
                    <select
                      value={formData.cat_performance || ''}
                      onChange={(e) => handleChange('cat_performance', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                    >
                      <option value="">-- Pilih Performa --</option>
                      {PERFORMANCE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold block mb-1">D. Rekomendasi Program Latihan</label>
                    <select
                      value={formData.rekomendasi_program || ''}
                      onChange={(e) => handleChange('rekomendasi_program', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                    >
                      <option value="">-- Pilih Program --</option>
                      {PROGRAM_OPTIONS.map((prog) => (
                        <option key={prog} value={prog}>{prog}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Form</span>
              </button>

              {/* Step Navigation Helpers */}
              {activeTabSection === 'profil' && (
                <button
                  type="button"
                  onClick={() => setActiveTabSection('sekolah')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  Lanjut ke Bagian 2 ({isKids ? 'Sekolah & Klub' : 'Klub & Olahraga'}) ➔
                </button>
              )}
              {activeTabSection === 'sekolah' && (
                <button
                  type="button"
                  onClick={() => setActiveTabSection('orangtua')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  Lanjut ke Bagian 3 ({isKids ? 'Orang Tua' : 'Pekerjaan & Olahraga'}) ➔
                </button>
              )}
              {activeTabSection === 'orangtua' && (
                <button
                  type="button"
                  onClick={() => setActiveTabSection('medis')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  Lanjut ke Bagian 4 (Medis) ➔
                </button>
              )}
              {activeTabSection === 'medis' && (
                <button
                  type="button"
                  onClick={() => setActiveTabSection('asesmen')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300 hover:bg-sky-100 border border-sky-200 dark:border-sky-800"
                >
                  Ke Bagian 5 (Asesmen Fisik) ➔
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>

              <button
                type="submit"
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-extrabold shadow-md transition-all active:scale-95 cursor-pointer ${
                  activeTabSection === 'asesmen'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                    : 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900'
                }`}
              >
                <Check className={`w-4 h-4 ${activeTabSection === 'asesmen' ? 'text-white' : 'text-emerald-400 dark:text-emerald-600'}`} />
                <span>
                  {activeTabSection === 'asesmen'
                    ? 'SIMPAN ASESMEN FISIK & PROGRAM (COACH)'
                    : 'SIMPAN DATA REGISTRASI TRIAL (ADMIN)'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
