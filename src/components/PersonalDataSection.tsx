import React from 'react';
import { User, Calendar, Shield, RefreshCw, Check } from 'lucide-react';
import { CustomerType, Gender, COACHES_LIST } from '../types/scoreCard';

interface PersonalDataSectionProps {
  customerType: CustomerType;
  fullName: string;
  gender: Gender | '';
  dob: string;
  age: number | null;
  memberId: string;
  testDate: string;
  coach: string;
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
  onChange,
  onGenerateMemberId,
}) => {
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

      {/* 1. Kategori Customer */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <span>Kategori Customer</span>
            <span className="text-rose-500">*</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">✓ Terisi</span>
          </label>
          <span className="text-slate-400 text-[11px]">
            {customerType === 'member' ? 'Member Regular TCC' : 'Customer Trial (1x Sesi)'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              onChange('Customer_type', 'member');
              onChange('entry_type', 'member');
            }}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
              customerType === 'member'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Customer "Member" (Regular TCC)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onChange('Customer_type', 'trial');
              onChange('entry_type', 'trial');
            }}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
              customerType === 'trial'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Customer "Trial" (1x Sesi / Trial)</span>
          </button>
        </div>
      </div>

      {/* 2. Full Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <span>Full Name</span>
          <span className="text-rose-500">*</span>
          {fullName.trim() && (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">✓ Terisi</span>
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
            {gender && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">✓ Terisi</span>}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onChange('Gender', 'male')}
              className={`py-2 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                gender === 'male'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold ring-1 ring-emerald-500'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
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
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
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
              {memberId && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">✓ Terisi</span>}
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
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <span>Date of Birth</span>
            {dob && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">✓ Terisi</span>}
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
            <span>Age (Otomatis dari DoB)</span>
            {age !== null && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">✓ Terisi</span>}
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date of Test */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <span>Date of Test</span>
            {testDate && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">✓ Terisi</span>}
          </label>
          <input
            type="date"
            value={testDate}
            onChange={(e) => onChange('Test_Date', e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              testDate
                ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-white'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
            }`}
          />
        </div>

        {/* Coach / Instructor Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <span>Coach / Instruktur Assessment</span>
            {coach && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">✓ Terisi</span>}
          </label>
          <select
            value={coach}
            onChange={(e) => onChange('Coaches', e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              coach
                ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-white font-medium'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
            }`}
          >
            <option value="">Pilih Coach / Instruktur...</option>
            {COACHES_LIST.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
