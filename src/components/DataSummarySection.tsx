import React from 'react';
import { IdCard, Scale, Activity, Award } from 'lucide-react';
import { getBMIBadgeStyle } from '../utils/calculations';

interface DataSummarySectionProps {
  memberId: string;
  fullName: string;
  height: number | null;
  weight: number | null;
  bodyFat: number | null;
  bmi: number | null;
  catBmi: string;
  avgSkill: number | null;
  catSkill: string;
}

export const DataSummarySection: React.FC<DataSummarySectionProps> = ({
  memberId,
  fullName,
  height,
  weight,
  bodyFat,
  bmi,
  catBmi,
  avgSkill,
  catSkill,
}) => {
  const bmiStyle = getBMIBadgeStyle(catBmi);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-xs space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-base sm:text-lg font-extrabold uppercase tracking-tight text-slate-950 dark:text-white">
          DATA SUMMARY
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Ringkasan otomatis evaluasi fisik: TCC Membership ID, BMI, Ukuran Tubuh & Rata-rata Skill
        </p>
      </div>

      {/* 4 Cards Grid matching mockup */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: TCC Membership ID */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              TCC MEMBERSHIP ID
            </span>
            <IdCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-mono font-extrabold text-slate-900 dark:text-white tracking-wide">
              {memberId || 'TCC-XXXX'}
            </div>
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 break-words whitespace-normal leading-snug mt-0.5">
              {fullName || 'Nama Peserta'}
            </div>
          </div>
        </div>

        {/* Card 2: Tinggi & Berat Badan */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              TINGGI & BERAT BADAN
            </span>
            <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {height ? `${height} cm` : '- cm'}{' '}
              <span className="text-slate-400 font-normal">/</span>{' '}
              {weight ? `${weight} kg` : '- kg'}
            </div>
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
              Lemak: {bodyFat !== null ? `${bodyFat}%` : '- %'}
            </div>
          </div>
        </div>

        {/* Card 3: BMI & Klasifikasi */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              BMI & KLASIFIKASI
            </span>
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-mono">
              {bmi !== null ? `${bmi.toFixed(1)} kg/m²` : '-.- kg/m²'}
            </div>
            <div className="mt-1">
              {catBmi ? (
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-extrabold border ${bmiStyle.bg} ${bmiStyle.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${bmiStyle.dot}`} />
                  {catBmi}
                </span>
              ) : (
                <span className="text-xs text-slate-400 font-medium">Belum terisi</span>
              )}
            </div>
          </div>
        </div>

        {/* Card 4: Avg Skill Related Fitness */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              AVG SKILL RELATED FITNESS
            </span>
            <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-mono">
              {avgSkill !== null ? `${avgSkill.toFixed(1)} / 4.0` : '-.- / 4.0'}
            </div>
            <div className="text-xs font-semibold text-purple-700 dark:text-purple-300 mt-0.5">
              {catSkill || 'Belum terisi'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
