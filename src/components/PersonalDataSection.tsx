import React, { useMemo, useState } from 'react';
import { User, Calendar, Shield, RefreshCw, Check, AlertCircle, UserCheck, X, Plus } from 'lucide-react';
import { CustomerType, Gender, COACHES_LIST } from '../types/scoreCard';
import { formatDisplayDate } from '../utils/dateFormatter';

interface PersonalDataSectionProps {
  customerType: CustomerType;
  fullName: string;
  gender: Gender | '';
  dob: string;
  age: number | null;
  memberId: string;
  testDate: string;
  coach: string;
  isEditing?: boolean;
  onChange: (field: string, value: any) => void;
  onGenerateMemberId: () => void;
}

export const PersonalDataSection: React.FC<PersonalDataSectionProps> = ({
  customerType,
  fullName,
  gender,
  dob,
  age,
  memberId,
  testDate,
  coach,
  isEditing = false,
  onChange,
  onGenerateMemberId,
}) => {
  // Split comma-separated coaches into an array
  const selectedCoaches = useMemo(() => {
    if (!coach) return [];
    return coach.split(',').map((c) => c.trim()).filter(Boolean);
  }, [coach]);

  // Combine standard COACHES_LIST with any custom assigned coaches
  const allAvailableCoaches = useMemo(() => {
    const list = [...COACHES_LIST];
    selectedCoaches.forEach((c) => {
      if (!list.includes(c)) {
        list.push(c);
      }
    });
    return list;
  }, [selectedCoaches]);

  const [customCoachInput, setCustomCoachInput] = useState('');

  const handleToggleCoach = (cName: string) => {
    let next: string[];
    if (selectedCoaches.includes(cName)) {
      next = selectedCoaches.filter((c) => c !== cName);
    } else {
      next = [...selectedCoaches, cName];
    }
    onChange('Coaches', next.join(', '));
  };

  const handleAddCustomCoach = () => {
    const trimmed = customCoachInput.trim();
    if (!trimmed) return;
    if (!selectedCoaches.includes(trimmed)) {
      const next = [...selectedCoaches, trimmed];
      onChange('Coaches', next.join(', '));
    }
    setCustomCoachInput('');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-extrabold uppercase tracking-tight text-slate-950 dark:text-white">
              PERSONAL DATA
            </h3>
            {customerType === 'member' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Member
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Identitas dan data dasar peserta evaluasi
          </p>
        </div>

        {memberId && (
          <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-xs font-bold tracking-wider">
            {memberId}
          </div>
        )}
      </div>

      {/* 1. Kategori Customer (Otomatis Plain Text saat pengisian baru / Dapat diubah saat Mode Edit) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <span>Kategori Customer</span>
            <span className="text-rose-500">*</span>
            {isEditing ? (
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                Mode Edit: Dapat Diubah
              </span>
            ) : (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
            )}
          </label>
          <span className="text-slate-400 text-[11px]">
            {isEditing
              ? 'Pilihan khusus admin untuk mengubah Trial User menjadi Member TCC'
              : 'Otomatis terisi dari pilihan tombol atas'}
          </span>
        </div>

        {isEditing ? (
          /* Opsi Pilihan saat Mode Edit (khususnya untuk upgrade Trial User ke Member TCC) */
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => onChange('Customer_type', 'trial')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                customerType === 'trial'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200/70 dark:hover:bg-slate-700'
              }`}
            >
              Trial User (1x Sesi / Trial)
            </button>
            <button
              type="button"
              onClick={() => onChange('Customer_type', 'member')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                customerType === 'member'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200/70 dark:hover:bg-slate-700'
              }`}
            >
              <span>Member TCC (Regular TCC)</span>
              {customerType === 'member' && <Check className="w-3.5 h-3.5" />}
            </button>
            {customerType === 'member' && (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                ✓ Peserta akan diperbarui sebagai Member TCC
              </span>
            )}
          </div>
        ) : (
          /* Format Plain Text saat bukan mode edit (tanpa box/button) */
          <div className="py-1">
            <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-wide">
              {customerType === 'member' ? 'Member TCC' : 'Trial User'}
            </span>
            <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-400">
              {customerType === 'member' ? '(Member Regular TCC)' : '(1x Sesi / Trial User)'}
            </span>
          </div>
        )}
      </div>

      {/* 2. Full Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <span>Full Name</span>
          <span className="text-rose-500">*</span>
          {fullName.trim() && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
          )}
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => onChange('Full_Name', e.target.value)}
          placeholder="Masukkan nama lengkap peserta"
          className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
            fullName.trim()
              ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-white'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
          }`}
          required
        />
      </div>

      {/* 3. Gender & TCC Membership ID Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gender */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <span>Gender</span>
            {gender && <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">✓</span>}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onChange('Gender', 'male')}
              className={`py-2 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                gender === 'male'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold ring-1 ring-emerald-500'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'
              }`}
            >
              Male
            </button>
            <button
              type="button"
              onClick={() => onChange('Gender', 'female')}
              className={`py-2 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                gender === 'female'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold ring-1 ring-emerald-500'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'
              }`}
            >
              Female
            </button>
          </div>
        </div>

        {/* TCC Membership ID */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>TCC Membership ID</span>
              {memberId && <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">✓</span>}
            </label>
            <button
              type="button"
              onClick={onGenerateMemberId}
              className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Generate ID
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              value={memberId}
              onChange={(e) => onChange('MemberID', e.target.value)}
              placeholder="e.g. TCC-2481"
              className={`w-full px-4 py-2.5 rounded-xl border font-mono text-sm tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                memberId
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-white font-bold'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
              }`}
            />
          </div>
        </div>
      </div>

      {/* 4. Date of Birth & Age (Automatic Calculation) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* DoB */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span>Date of Birth</span>
              {dob && <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">✓</span>}
            </span>
            {dob && (
              <span className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                {formatDisplayDate(dob)}
              </span>
            )}
          </label>
          <div className="relative">
            <input
              type="date"
              value={dob}
              onChange={(e) => onChange('DoB', e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                dob
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-white'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
              }`}
            />
          </div>
        </div>

        {/* Age (Auto-calculated) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <span>Age (DoB)</span>
            {age !== null && <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">✓</span>}
          </label>
          <div className="relative">
            <input
              type="text"
              readOnly
              value={age !== null ? `${age}` : ''}
              placeholder="Terhitung otomatis"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
                age !== null
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-white'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
              }`}
            />
            <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-slate-400 dark:text-slate-500 pointer-events-none">
              Years
            </span>
          </div>
        </div>
      </div>

      {/* 5. Date of Test & Coach / Instruktur Assessment */}
      <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
        {/* Date of Test & Notice */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>Date of Test</span>
                {testDate && <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">✓</span>}
              </span>
              {testDate && (
                <span className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  {formatDisplayDate(testDate)}
                </span>
              )}
            </label>
            <input
              type="date"
              value={testDate}
              onChange={(e) => onChange('Test_Date', e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                testDate
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-white font-medium'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
              }`}
            />
          </div>

          <div className="flex flex-col justify-end">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">Ketentuan Pelatih Assessment:</span>
              <span>Minimal <strong>1 pelatih adalah WAJIB</strong>. Anda dapat memilih 2 atau lebih pelatih di bawah jika asesmen dipandu bersama (multi-coach).</span>
            </div>
          </div>
        </div>

        {/* Coach / Instruktur Assessment Multi-Select Section */}
        <div
          className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            selectedCoaches.length === 0
              ? 'bg-rose-50/50 dark:bg-rose-950/25 border-rose-300 dark:border-rose-800 ring-2 ring-rose-500/10'
              : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80'
          }`}
        >
          {/* Header Label & Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Coach / Instruktur Assessment</span>
              </label>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                WAJIB (Min. 1)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                Multi-Select
              </span>
            </div>

            {selectedCoaches.length > 0 ? (
              <span className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>{selectedCoaches.length} Pelatih Terpilih</span>
              </span>
            ) : (
              <span className="text-[11px] font-extrabold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/80 px-2.5 py-0.5 rounded-full border border-rose-300 dark:border-rose-700 flex items-center gap-1 animate-pulse">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Belum Ada Pelatih Dipilih</span>
              </span>
            )}
          </div>

          {/* Coach Selection Pills Grid */}
          <div className="space-y-3">
            <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
              Klik nama pelatih di bawah untuk memilih / membatalkan pilihan (bisa pilih lebih dari satu):
            </div>
            <div className="flex flex-wrap gap-2">
              {allAvailableCoaches.map((cName) => {
                const isSelected = selectedCoaches.includes(cName);
                return (
                  <button
                    key={cName}
                    type="button"
                    onClick={() => handleToggleCoach(cName)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white dark:bg-emerald-600 dark:text-white border-emerald-600 dark:border-emerald-500 ring-2 ring-emerald-500/25 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 shadow-2xs'
                    }`}
                  >
                    {isSelected ? (
                      <Check className="w-3.5 h-3.5 stroke-[3] text-white" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>{cName}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Coach Input */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Nama pelatih tidak ada di daftar?
              </span>
              <div className="flex items-center gap-1.5 flex-1 max-w-sm">
                <input
                  type="text"
                  value={customCoachInput}
                  onChange={(e) => setCustomCoachInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomCoach();
                    }
                  }}
                  placeholder="Ketik nama pelatih lain..."
                  className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomCoach}
                  disabled={!customCoachInput.trim()}
                  className="shrink-0 text-xs px-3 py-1.5 rounded-lg font-bold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  + Tambah
                </button>
              </div>
            </div>

            {/* Selected Coaches Summary Tags or Empty Warning Notice */}
            {selectedCoaches.length === 0 ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-bold mt-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>
                  PERINGATAN: Kolom Coach / Instruktur Assessment WAJIB diisi minimal 1 pelatih! Silakan klik nama pelatih di atas untuk memilih.
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs mt-2">
                <span className="font-bold text-emerald-900 dark:text-emerald-200 shrink-0">
                  Pelatih Tercantum di Score Card & Cetak PDF:
                </span>
                <div className="flex flex-wrap gap-1.5 items-center">
                  {selectedCoaches.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold border border-emerald-300 dark:border-emerald-700 text-xs shadow-2xs"
                    >
                      <span>{c}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleCoach(c)}
                        title={`Hapus ${c}`}
                        className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 ml-0.5 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
