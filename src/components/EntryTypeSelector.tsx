import React from 'react';
import { UserCheck, RotateCcw } from 'lucide-react';
import { CustomerType } from '../types/scoreCard';

interface EntryTypeSelectorProps {
  currentEntryType: 'member' | 'trial' | 'edit';
  customerType: CustomerType;
  editingRecordName?: string;
  editingMemberId?: string;
  onSelectMemberTCC: () => void;
  onSelectNewUser?: () => void;
  onSelectEditExistData?: () => void;
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
      {/* Main Action Button for Member TCC Assessment */}
      <div className="flex flex-col sm:flex-row items-stretch gap-3">
        {/* Button: Member TCC (Sesi Baru / Member Lama) */}
        <button
          type="button"
          onClick={onSelectMemberTCC}
          className={`flex-1 relative group flex items-center justify-between gap-3 px-5 py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 border cursor-pointer ${
            currentEntryType === 'member'
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-md shadow-emerald-600/20 ring-2 ring-emerald-500/30'
              : 'bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                currentEntryType === 'member'
                  ? 'bg-white/20 text-white'
                  : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-sm sm:text-base font-extrabold tracking-tight">
                Member TCC (Sesi Baru / Member Lama)
              </span>
              <span
                className={`block text-[11px] font-normal ${
                  currentEntryType === 'member'
                    ? 'text-emerald-100'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Klik di sini untuk memilih nama member dari database dan memulai sesi asesmen fisik berkala
              </span>
            </div>
          </div>
          <span
            className={`hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold ${
              currentEntryType === 'member'
                ? 'bg-white/20 text-white'
                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
            }`}
          >
            Pilih Member &rarr;
          </span>
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
