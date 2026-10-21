import React from 'react';
import { AlertCircle } from 'lucide-react';

interface DisclaimerSectionProps {
  className?: string;
}

export const DisclaimerSection: React.FC<DisclaimerSectionProps> = ({ className = '' }) => {
  return (
    <div
      className={`rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-3 sm:p-4 text-left shadow-2xs break-inside-avoid print:bg-slate-50 print:border-slate-400 print:shadow-none ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-slate-600 dark:text-slate-400 shrink-0 mt-0.5 print:text-slate-800" />
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center justify-between">
            <h5 className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 print:text-black">
              DISCLAIMER (PERNYATAAN PELEPASAN TANGGUNG JAWAB)
            </h5>
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider print:text-slate-600">
              The Core Chamber
            </span>
          </div>

          {/* Indonesian Text */}
          <p className="text-[10px] sm:text-[11px] leading-relaxed text-slate-700 dark:text-slate-300 print:text-slate-900 font-normal">
            Hasil Physical Fitness Score Card ini hanya digunakan sebagai gambaran umum mengenai kondisi kebugaran fisik individu pada saat pengukuran dilakukan. Nilai yang ditampilkan dipengaruhi oleh berbagai faktor, seperti usia, jenis kelamin, tingkat pertumbuhan, pengalaman latihan, kondisi kesehatan, kualitas tidur, nutrisi, hidrasi, motivasi, serta kondisi fisik pada saat pelaksanaan tes. Interpretasi hasil ditujukan sebagai acuan untuk menyusun program latihan, memantau perkembangan kebugaran, dan mengidentifikasi area yang perlu ditingkatkan, bukan sebagai satu-satunya dasar dalam menentukan kemampuan atau potensi individu.
          </p>

          {/* English Text */}
          <p className="text-[9px] sm:text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 italic pt-1 border-t border-slate-200 dark:border-slate-700 print:border-slate-300 print:text-slate-600">
            This Physical Fitness Score Card is intended solely to provide a general overview of an individual's physical fitness status at the time of assessment. The results presented are influenced by various factors, including age, sex, growth and developmental stage, training experience, health condition, sleep quality, nutrition, hydration, motivation, and the individual's physical condition during the testing session. The interpretation of these results is intended to serve as a reference for designing training programs, monitoring fitness progress, and identifying areas for improvement. It should not be used as the sole basis for determining an individual's overall ability or potential.
          </p>
        </div>
      </div>
    </div>
  );
};
