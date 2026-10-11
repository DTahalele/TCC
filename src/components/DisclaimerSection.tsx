import React from 'react';
import { AlertCircle } from 'lucide-react';

export const DisclaimerSection: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-xs">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0 mt-0.5">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="space-y-3">
          <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">
            DISCLAIMER (PERNYATAAN PELEPASAN TANGGUNG JAWAB)
          </h4>

          {/* Indonesian Text */}
          <p className="text-xs sm:text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
            Hasil Physical Fitness Score Card ini hanya digunakan sebagai gambaran umum mengenai kondisi kebugaran fisik individu pada saat pengukuran dilakukan. Nilai yang ditampilkan dipengaruhi oleh berbagai faktor, seperti usia, jenis kelamin, tingkat pertumbuhan, pengalaman latihan, kondisi kesehatan, kualitas tidur, nutrisi, hidrasi, motivasi, serta kondisi fisik pada saat pelaksanaan tes. Interpretasi hasil ditujukan sebagai acuan untuk menyusun program latihan, memantau perkembangan kebugaran, dan mengidentifikasi area yang perlu ditingkatkan, bukan sebagai satu-satunya dasar dalam menentukan kemampuan atau potensi individu.
          </p>

          {/* English Text */}
          <p className="text-[11px] sm:text-xs leading-relaxed text-slate-400 dark:text-slate-500 italic pt-1 border-t border-slate-100 dark:border-slate-800">
            This Physical Fitness Score Card is intended solely to provide a general overview of an individual's physical fitness status at the time of assessment. The results presented are influenced by various factors, including age, sex, growth and developmental stage, training experience, health condition, sleep quality, nutrition, hydration, motivation, and the individual's physical condition during the testing session. The interpretation of these results is intended to serve as a reference for designing training programs, monitoring fitness progress, and identifying areas for improvement. It should not be used as the sole basis for determining an individual's overall ability or potential.
          </p>
        </div>
      </div>
    </div>
  );
};
