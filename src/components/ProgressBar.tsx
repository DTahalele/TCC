import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { CompletionStatus } from '../utils/calculations';

interface ProgressBarProps {
  status: CompletionStatus;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ status }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mt-0.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-slate-900 dark:text-white">
              INDIKATOR HIGHLIGHT DATA TERISI
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
              Setiap kolom yang sudah dilengkapi otomatis berwarna hijau emerald lembut agar mudah dipantau
            </p>
          </div>
        </div>

        <div className="text-right flex sm:block items-baseline justify-between">
          <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
            {status.totalFilled} / {status.totalFields} Data Terisi ({status.percentage}%)
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
        <div
          className="h-full bg-linear-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 ease-out shadow-xs"
          style={{ width: `${Math.min(100, Math.max(0, status.percentage))}%` }}
        />
      </div>

      {/* Section Indicators */}
      <div className="mt-3.5 flex flex-wrap gap-1.5 sm:gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <SectionBadge
          label="Personal"
          filled={status.personal.filled}
          total={status.personal.total}
        />
        <SectionBadge
          label="Measurements"
          filled={status.measurements.filled}
          total={status.measurements.total}
        />
        <SectionBadge
          label="Komposisi & BMI"
          filled={status.composition.filled}
          total={status.composition.total}
        />
        <SectionBadge
          label="Functional"
          filled={status.functional.filled}
          total={status.functional.total}
        />
        <SectionBadge
          label="Strength"
          filled={status.strength.filled}
          total={status.strength.total}
        />
        <SectionBadge
          label="Skill Related"
          filled={status.skill.filled}
          total={status.skill.total}
        />
      </div>
    </div>
  );
};

const SectionBadge: React.FC<{ label: string; filled: number; total: number }> = ({ label, filled, total }) => {
  const isComplete = filled >= total;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors ${
        isComplete
          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
          : filled > 0
          ? 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
          : 'bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 border-dashed border-slate-200 dark:border-slate-800'
      }`}
    >
      <span>{label}</span>
      <span className="font-mono text-[10px] opacity-80">
        ({filled}/{total})
      </span>
      {isComplete && <span className="text-[10px]">✓</span>}
    </span>
  );
};
