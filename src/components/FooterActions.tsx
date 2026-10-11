import React from 'react';
import { RotateCcw, Printer, Save, CheckCircle2, Loader2, ArrowUpRight } from 'lucide-react';

interface FooterActionsProps {
  isEditing: boolean;
  isSubmitting: boolean;
  onClear: () => void;
  onPrint: () => void;
  onSubmit: () => void;
}

export const FooterActions: React.FC<FooterActionsProps> = ({
  isEditing,
  isSubmitting,
  onClear,
  onPrint,
  onSubmit,
}) => {
  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
      {/* Left button: Kosongkan Formulir */}
      <button
        type="button"
        onClick={onClear}
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
      >
        <RotateCcw className="w-4 h-4 text-slate-400" />
        <span>Kosongkan Formulir</span>
      </button>

      {/* Right buttons */}
      <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2.5">
        {/* Cetak (PDF) */}
        <button
          type="button"
          onClick={onPrint}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          <span>Cetak (PDF)</span>
        </button>

        {/* Submit / Update Button */}
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white transition-all shadow-md active:scale-98 ${
            isEditing
              ? 'bg-sky-600 hover:bg-sky-700 shadow-sky-600/25 ring-2 ring-sky-500/20'
              : 'bg-slate-950 hover:bg-slate-900 dark:bg-emerald-600 dark:hover:bg-emerald-700 shadow-slate-900/20 dark:shadow-emerald-600/25'
          } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Menyimpan ke Database...</span>
            </>
          ) : isEditing ? (
            <>
              <Save className="w-4 h-4" />
              <span>Update & Simpan Record</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit & Simpan Record</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
