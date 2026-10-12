import React from 'react';
import { FileText } from 'lucide-react';

interface CoachNotesSectionProps {
  notes?: string;
  onChange: (notes: string) => void;
}

export const CoachNotesSection: React.FC<CoachNotesSectionProps> = ({
  notes = '',
  onChange,
}) => {
  const isFilled = notes.trim().length > 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-extrabold uppercase tracking-tight text-slate-950 dark:text-white">
              CATATAN TAMBAHAN COACH / INSTRUKTUR
            </h3>
            {isFilled && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                ✓
              </span>
            )}
          </div>
        </div>

        {isFilled && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[11px] font-semibold text-slate-400 hover:text-rose-500 transition-colors"
          >
            Hapus Catatan
          </button>
        )}
      </div>

      {/* Textarea */}
      <div className="space-y-2">
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Tuliskan catatan tambahan evaluasi di sini (contoh: rekomendasi fokus program latihan, evaluasi mobilitas/stabilitas khusus, riwayat cedera, atau instruksi perkembangan sesi berikutnya)..."
          className="w-full min-h-[95px] max-h-[220px] px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-y leading-relaxed"
        />
        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
          <span>* Catatan otomatis tersimpan ke database Google Sheet & cetakan PDF</span>
          {notes.length > 0 && <span>{notes.length} karakter</span>}
        </div>
      </div>
    </div>
  );
};
