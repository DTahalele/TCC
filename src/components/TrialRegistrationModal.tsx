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
} from '../types/trialRegistration';
import { COACHES_LIST } from '../types/scoreCard';
import { calculateAge } from '../utils/calculations';
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

interface TrialRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: TrialRegistrationRecord) => void;
  initialType?: TrialCustomerType;
  editingTrial?: TrialRegistrationRecord | null;
}

export const TrialRegistrationModal: React.FC<TrialRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialType = 'Trial Adults',
  editingTrial,
}) => {
  const [formData, setFormData] = useState<TrialRegistrationRecord>(() => {
    if (editingTrial) return editingTrial;
    const randomId = Math.floor(1000 + Math.random() * 9000);
    return {
      ...INITIAL_TRIAL_RECORD,
      id: `trial-${Date.now()}`,
      MemberID: `TCC-TR-${randomId}`,
      Customer_type: initialType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  const [activeTabSection, setActiveTabSection] = useState<'profil' | 'riwayat' | 'medis' | 'asesmen'>('profil');

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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }, [editingTrial, initialType, isOpen]);

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
        if (value && updated.Trial_Time) {
          updated.schedule_status = 'Confirmed';
        }
      }

      if (field === 'Trial_Time') {
        if (value && updated.Trial_Date) {
          updated.schedule_status = 'Confirmed';
        }
      }

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
    if (currentCoaches.includes(coachName)) {
      handleChange('Coaches', currentCoaches.filter((c) => c !== coachName));
    } else {
      handleChange('Coaches', [...currentCoaches, coachName]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.Full_Name.trim()) {
      alert('Mohon isi Nama Lengkap Calon Member.');
      return;
    }
    onSave({
      ...formData,
      updatedAt: new Date().toISOString(),
    });
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

          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTabSection('profil')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTabSection === 'profil'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              1. Identitas & Jadwal
            </button>
            <button
              type="button"
              onClick={() => setActiveTabSection('riwayat')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTabSection === 'riwayat'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {isKids ? '2. Sekolah & Orang Tua' : '2. Pekerjaan & Klub'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTabSection('medis')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTabSection === 'medis'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              3. Riwayat Medis / Cedera
            </button>
            <button
              type="button"
              onClick={() => setActiveTabSection('asesmen')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTabSection === 'asesmen'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              4. Asesmen Fisik (Opsional)
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

          {/* SECTION 2: RIWAYAT AKTIVITAS / SEKOLAH / PEKERJAAN */}
          {activeTabSection === 'riwayat' && (
            <div className="space-y-6">
              {isKids ? (
                /* KHUSUS KIDS: SEKOLAH & ORANG TUA */
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-900 dark:text-slate-100 border-b pb-2 mb-4 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-amber-500" />
                      Data Sekolah & Klub Olahraga Anak
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
                    </div>
                  </div>

                  {/* DATA ORANG TUA / WALI */}
                  <div>
                    <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-900 dark:text-slate-100 border-b pb-2 mb-4 flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-600" />
                      Data Orang Tua / Wali
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
                          placeholder="+62 812-xxxx"
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
                          placeholder="+62 813-xxxx"
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
                    </div>
                  </div>
                </div>
              ) : (
                /* KHUSUS ADULTS: PEKERJAAN & KLUB OLAHRAGA */
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-900 dark:text-slate-100 border-b pb-2 mb-4 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-indigo-500" />
                      Data Pekerjaan & Kantor
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 dark:text-slate-300">Pekerjaan</label>
                        <input
                          type="text"
                          placeholder="contoh: Pegawai Swasta, Dokter, Guru"
                          value={formData.formadults_pekerjaan || ''}
                          onChange={(e) => handleChange('formadults_pekerjaan', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 dark:text-slate-300">Nama Perusahaan</label>
                        <input
                          type="text"
                          placeholder="Nama instansi / perusahaan"
                          value={formData.formadults_perusahaan || ''}
                          onChange={(e) => handleChange('formadults_perusahaan', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold"
                        />
                      </div>

                      <div className="space-y-1">
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

                  <div>
                    <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-900 dark:text-slate-100 border-b pb-2 mb-4 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-600" />
                      Riwayat Club / Komunitas Olahraga
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 dark:text-slate-300">Pernah Tergabung Komunitas?</label>
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
                          placeholder="misal: Lari, Sepeda, Crossfit"
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
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    1. Strength (Skor 1 - 5)
                  </h4>
                  <span className="text-xs font-bold text-emerald-600">
                    Average: {formData.avg_strength ?? '-'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Lower Body */}
                  <div>
                    <label className="font-bold block mb-1">A. Lower Body</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => handleChange('lower_body', lvl)}
                          className={`flex-1 py-1 rounded-lg font-bold border text-xs ${
                            formData.lower_body === lvl
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                              : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Core */}
                  <div>
                    <label className="font-bold block mb-1">B. Core</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => handleChange('core', lvl)}
                          className={`flex-1 py-1 rounded-lg font-bold border text-xs ${
                            formData.core === lvl
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                              : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Upper Body */}
                  <div>
                    <label className="font-bold block mb-1">C. Upper Body</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => handleChange('upper_body', lvl)}
                          className={`flex-1 py-1 rounded-lg font-bold border text-xs ${
                            formData.upper_body === lvl
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                              : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Related Fitness (1-5) */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    2. Skills Related Fitness - Running Lane (Skor 1 - 5)
                  </h4>
                  <span className="text-xs font-bold text-emerald-600">
                    Average: {formData.avg_skill ?? '-'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="font-bold block mb-1">Body Control</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => handleChange('body_control', lvl)}
                          className={`flex-1 py-1 rounded-lg font-bold border text-xs ${
                            formData.body_control === lvl
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                              : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Flexibility</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => handleChange('flexibility', lvl)}
                          className={`flex-1 py-1 rounded-lg font-bold border text-xs ${
                            formData.flexibility === lvl
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                              : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Agility</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => handleChange('agility', lvl)}
                          className={`flex-1 py-1 rounded-lg font-bold border text-xs ${
                            formData.agility === lvl
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                              : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Speed</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => handleChange('speed', lvl)}
                          className={`flex-1 py-1 rounded-lg font-bold border text-xs ${
                            formData.speed === lvl
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                              : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rekomendasi Pelatih */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200 border-b pb-2">
                  3. Rekomendasi Pelatih
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
                    <label className="font-bold block mb-1">D. Rekomendasi Program</label>
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
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Form</span>
            </button>

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
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-extrabold shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                <span>SUBMIT & SAVE DATA</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
