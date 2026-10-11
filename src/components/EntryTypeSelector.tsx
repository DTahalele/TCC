import React from 'react';
import { UserCheck, UserPlus, Edit3, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';
import { CustomerType } from '../types/scoreCard';

interface EntryTypeSelectorProps {
  currentEntryType: 'member' | 'trial' | 'edit';
  customerType: CustomerType;
  editingRecordName?: string;
  editingMemberId?: string;
  onSelectMemberTCC: () => void;
  onSelectNewUser: () => void;
  onSelectEditExistData: () => void;
  onCancelEditMode?: () => void;
}

export const EntryTypeSelector: React.FC<EntryTypeSelectorProps> = ({
  currentEntryType,
  customerType,
  editingRecordName,
  editingMemberId,
  onSelectMemberTCC,
  onSelectNewUser,
  onSelectEditExistData,
  onCancelEditMode,
}) => {
  return (
    <div className="space-y-3">
      {/* 3 Main Action Buttons matching mockup */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Button 1: Member TCC (Sesi Baru) */}
        <button
          type="button"
          onClick={onSelectMemberTCC}
          className={`relative group flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 border ${
            currentEntryType === 'member'
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-md shadow-emerald-600/20 ring-2 ring-emerald-500/30'
              : 'bg-white dark:bg-slate-800/80 hover:bg-emerald-50/50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
          }`}
        >
          <UserCheck className={`w-4 h-4 ${currentEntryType === 'member' ? 'text-white' : 'text-emerald-600'}`} />
          <div className="text-left">
            <span>Member TCC</span>
            <span className={`block text-[10px] font-normal opacity-90 ${currentEntryType === 'member' ? 'text-emerald-100' : 'text-slate-400'}`}>
              Sesi Baru / Member Lama
            </span>
          </div>
        </button>

        {/* Button 2: New User (Trial) */}
        <button
          type="button"
          onClick={onSelectNewUser}
          className={`relative group flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 border ${
            currentEntryType === 'trial'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md shadow-slate-900/20 ring-2 ring-slate-500/20'
              : 'bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
          }`}
        >
          <UserPlus className={`w-4 h-4 ${currentEntryType === 'trial' ? 'text-emerald-400 dark:text-emerald-600' : 'text-slate-500'}`} />
          <div className="text-left">
            <span>New User</span>
            <span className={`block text-[10px] font-normal opacity-90 ${currentEntryType === 'trial' ? 'text-slate-300 dark:text-slate-600' : 'text-slate-400'}`}>
              Trial / Member Baru
            </span>
          </div>
        </button>

        {/* Button 3: Edit Exist Data */}
        <button
          type="button"
          onClick={onSelectEditExistData}
          className={`relative group flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 border ${
            currentEntryType === 'edit'
              ? 'bg-sky-600 hover:bg-sky-700 text-white border-sky-600 shadow-md shadow-sky-600/20 ring-2 ring-sky-500/30'
              : 'bg-white dark:bg-slate-800/80 hover:bg-sky-50/50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
          }`}
        >
          <Edit3 className={`w-4 h-4 ${currentEntryType === 'edit' ? 'text-white' : 'text-sky-600'}`} />
          <div className="text-left">
            <span>Edit Exist Data</span>
            <span className={`block text-[10px] font-normal opacity-90 ${currentEntryType === 'edit' ? 'text-sky-100' : 'text-slate-400'}`}>
              Cari & Perbarui Baris Data
            </span>
          </div>
        </button>
      </div>

      {/* Editing State Banner if currently in edit mode */}
      {currentEntryType === 'edit' && editingMemberId && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-200 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
            <span className="font-semibold">Mode Edit Aktif:</span>
            <span>{editingRecordName || 'Peserta'} ({editingMemberId})</span>
            <span className="hidden sm:inline text-sky-600 dark:text-sky-400 text-[11px]">
              • Saat disimpan, data akan meng-update baris database yang sama tanpa menambah baris baru.
            </span>
          </div>
          {onCancelEditMode && (
            <button
              type="button"
              onClick={onCancelEditMode}
              className="flex items-center gap-1 font-semibold text-sky-700 hover:text-sky-900 dark:text-sky-300 underline text-[11px]"
            >
              <RotateCcw className="w-3 h-3" />
              Batal Edit / Form Baru
            </button>
          )}
        </div>
      )}
    </div>
  );
};
