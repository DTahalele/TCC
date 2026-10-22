import React from 'react';
import { Activity, HelpCircle, Check } from 'lucide-react';
import { getBMIBadgeStyle } from '../utils/calculations';

interface BodyCompositionSectionProps {
  // 10 Measurements
  wingSpan: number | null;
  chest: number | null;
  leftArm: number | null;
  rightArm: number | null;
  waist: number | null;
  hips: number | null;
  leftThigh: number | null;
  rightThigh: number | null;
  leftCalf: number | null;
  rightCalf: number | null;

  // Composition & BMI
  bodyFat: number | null;
  muscleMass: number | null;
  height: number | null;
  weight: number | null;
  bmi: number | null;
  catBmi: string;

  onChange: (field: string, value: any) => void;
  onOpenBMIRefModal: () => void;
}

export const BodyCompositionSection: React.FC<BodyCompositionSectionProps> = ({
  wingSpan,
  chest,
  leftArm,
  rightArm,
  waist,
  hips,
  leftThigh,
  rightThigh,
  leftCalf,
  rightCalf,
  bodyFat,
  muscleMass,
  height,
  weight,
  bmi,
  catBmi,
  onChange,
  onOpenBMIRefModal,
}) => {
  // Count filled measurements
  const measurementsList = [
    wingSpan, chest, leftArm, rightArm, waist,
    hips, leftThigh, rightThigh, leftCalf, rightCalf
  ];
  const filledMeasurements = measurementsList.filter((m) => m !== null && m !== undefined && m > 0).length;

  const isAllFilled = filledMeasurements === 10 && Boolean(height && weight);

  const bmiStyle = getBMIBadgeStyle(catBmi);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-xs space-y-6">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-extrabold uppercase tracking-tight text-slate-950 dark:text-white">
              BODY COMPOSITION
            </h3>
            {isAllFilled && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Lengkap 100%
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pengukuran lingkar tubuh, komposisi lemak & massa otot, serta kalkulasi BMI
          </p>
        </div>
      </div>

      {/* Subsection: BODY MEASUREMENTS (CM) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            BODY MEASUREMENTS (CM)
          </h4>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {filledMeasurements} / 10
          </span>
        </div>

        {/* 10 Measurements Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <MeasurementInput
            label="Wing Span"
            value={wingSpan}
            field="wing_span"
            onChange={onChange}
          />
          <MeasurementInput
            label="Chest"
            value={chest}
            field="chest"
            onChange={onChange}
          />
          <MeasurementInput
            label="Left Arm"
            value={leftArm}
            field="left_arm"
            onChange={onChange}
          />
          <MeasurementInput
            label="Right Arm"
            value={rightArm}
            field="right_arm"
            onChange={onChange}
          />
          <MeasurementInput
            label="Waist"
            value={waist}
            field="waist"
            onChange={onChange}
          />
          <MeasurementInput
            label="Hips"
            value={hips}
            field="hips"
            onChange={onChange}
          />
          <MeasurementInput
            label="Left Thigh"
            value={leftThigh}
            field="left_thigh"
            onChange={onChange}
          />
          <MeasurementInput
            label="Right Thigh"
            value={rightThigh}
            field="right_tight"
            onChange={onChange}
          />
          <MeasurementInput
            label="Left Calf"
            value={leftCalf}
            field="left_calf"
            onChange={onChange}
          />
          <MeasurementInput
            label="Right Calf"
            value={rightCalf}
            field="right_calf"
            onChange={onChange}
          />
        </div>
      </div>

      {/* Subsection: KOMPOSISI LEMAK, MASSA OTOT & KALKULATOR BMI */}
      <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            KOMPOSISI LEMAK, MASSA OTOT & KALKULATOR BMI
          </h4>
          <button
            type="button"
            onClick={onOpenBMIRefModal}
            className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Referensi BMI Calculator</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Body Fat % */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <span>Body Fat %</span>
                {bodyFat !== null && bodyFat > 0 && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                )}
              </label>
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                value={bodyFat ?? ''}
                onChange={(e) => onChange('body_fat', e.target.value === '' ? null : parseFloat(e.target.value))}
                placeholder="0"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  bodyFat !== null && bodyFat > 0
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-white'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                }`}
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400 dark:text-slate-500 pointer-events-none">
                %
              </span>
            </div>
          </div>

          {/* Muscle Mass % */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <span>Muscle Mass %</span>
                {muscleMass !== null && muscleMass > 0 && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                )}
              </label>
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                value={muscleMass ?? ''}
                onChange={(e) => onChange('muscle_mass', e.target.value === '' ? null : parseFloat(e.target.value))}
                placeholder="0"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  muscleMass !== null && muscleMass > 0
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-white'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                }`}
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400 dark:text-slate-500 pointer-events-none">
                %
              </span>
            </div>
          </div>

          {/* Height (cm) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <span>Height (cm)</span>
                <span className="text-rose-500">*</span>
                {height !== null && height > 0 && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                )}
              </label>
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                value={height ?? ''}
                onChange={(e) => onChange('height', e.target.value === '' ? null : parseFloat(e.target.value))}
                placeholder="e.g. 174"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  height !== null && height > 0
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-white'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                }`}
                required
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400 dark:text-slate-500 pointer-events-none">
                cm
              </span>
            </div>
          </div>

          {/* Weight (kg) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <span>Weight (kg)</span>
                <span className="text-rose-500">*</span>
                {weight !== null && weight > 0 && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                )}
              </label>
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                value={weight ?? ''}
                onChange={(e) => onChange('weight', e.target.value === '' ? null : parseFloat(e.target.value))}
                placeholder="e.g. 67"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  weight !== null && weight > 0
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-white'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                }`}
                required
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400 dark:text-slate-500 pointer-events-none">
                kg
              </span>
            </div>
          </div>
        </div>

        {/* Real-time BMI Result and Category Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
          {/* Real-time BMI */}
          <div className="p-3.5 rounded-xl border bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                BMI (Real-Time)
              </p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
                  {bmi !== null ? bmi.toFixed(1) : '--.-'}
                </span>
                <span className="text-xs font-semibold text-slate-400">kg/m²</span>
              </div>
            </div>
            <Activity className="w-6 h-6 text-emerald-500 opacity-60" />
          </div>

          {/* BMI Classification */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${bmiStyle.bg}`}>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                Classification BMI
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2.5 h-2.5 rounded-full ${bmiStyle.dot}`} />
                <span className={`text-sm sm:text-base font-extrabold ${bmiStyle.text}`}>
                  {catBmi || 'Belum Terhitung'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MeasurementInputProps {
  label: string;
  value: number | null;
  field: string;
  onChange: (field: string, value: any) => void;
}

const MeasurementInput: React.FC<MeasurementInputProps> = ({
  label,
  value,
  field,
  onChange,
}) => {
  const isFilled = value !== null && value !== undefined && value > 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-semibold text-slate-700 dark:text-slate-300 break-words whitespace-normal leading-tight" title={label}>
          {label}
        </span>
        {isFilled && (
          <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
            ✓
          </span>
        )}
      </div>
      <div className="relative">
        <input
          type="number"
          step="0.5"
          min="0"
          value={value ?? ''}
          onChange={(e) => onChange(field, e.target.value === '' ? null : parseFloat(e.target.value))}
          placeholder="0"
          className={`w-full px-2.5 py-2 pr-7 rounded-xl border text-xs sm:text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
            isFilled
              ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-white font-bold'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
          }`}
        />
        <span className="absolute right-2 top-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 pointer-events-none">
          cm
        </span>
      </div>
    </div>
  );
};
