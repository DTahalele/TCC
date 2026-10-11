import React from 'react';
import { X, Info, HeartPulse } from 'lucide-react';

interface BMICalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BMICalculatorModal: React.FC<BMICalculatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">
                REFERENSI KLASIFIKASI BMI
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Formula Body Mass Index (BMI): Berat (kg) / [Tinggi (m)]²
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                <tr>
                  <th className="p-3">Rentang BMI (kg/m²)</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Status Indikator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                <tr className="bg-amber-50/40 dark:bg-amber-950/20">
                  <td className="p-3 font-mono font-semibold">&lt; 18.5</td>
                  <td className="p-3 font-bold text-amber-700 dark:text-amber-400">Underweight</td>
                  <td className="p-3">Berat Kurang</td>
                </tr>
                <tr className="bg-emerald-50/50 dark:bg-emerald-950/20">
                  <td className="p-3 font-mono font-semibold">18.5 – 24.9</td>
                  <td className="p-3 font-bold text-emerald-700 dark:text-emerald-400">Normal Weight</td>
                  <td className="p-3">Ideal / Sehat</td>
                </tr>
                <tr className="bg-orange-50/40 dark:bg-orange-950/20">
                  <td className="p-3 font-mono font-semibold">25.0 – 29.9</td>
                  <td className="p-3 font-bold text-orange-700 dark:text-orange-400">Overweight</td>
                  <td className="p-3">Kelebihan Berat</td>
                </tr>
                <tr className="bg-rose-50/40 dark:bg-rose-950/20">
                  <td className="p-3 font-mono font-semibold">≥ 30.0</td>
                  <td className="p-3 font-bold text-rose-700 dark:text-rose-400">Obesitas (Obese)</td>
                  <td className="p-3">Kategori Obesitas</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <strong>Catatan Evaluator:</strong> BMI adalah perkiraan awal. Untuk atlet atau individu dengan massa otot tinggi, perhatikan juga nilai <strong>Body Fat %</strong> dan <strong>Muscle Mass %</strong> agar analisa komposisi tubuh lebih komprehensif.
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
};
