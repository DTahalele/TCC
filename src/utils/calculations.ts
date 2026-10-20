import { ScoreCardRecord, ScoreLevel, SCORE_CATEGORIES } from '../types/scoreCard';

/**
 * Calculate age in completed years from Date of Birth
 */
export function calculateAge(dobString: string): number | null {
  if (!dobString) return null;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

/**
 * Get current local date in YYYY-MM-DD format (prevents UTC timezone off-by-one errors)
 */
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculate BMI in kg/m²
 */
export function calculateBMI(heightCm: number | null, weightKg: number | null): number | null {
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) return null;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10;
}

/**
 * Get BMI classification category
 */
export function getBMICategory(bmi: number | null): string {
  if (bmi === null) return '';
  if (bmi < 18.5) return 'Underweight';
  if (bmi <= 24.9) return 'Normal Weight';
  if (bmi <= 29.9) return 'Overweight';
  return 'Obesitas (Obese)';
}

/**
 * Color class for BMI category
 */
export function getBMIBadgeStyle(category: string): { bg: string; text: string; dot: string } {
  switch (category) {
    case 'Normal Weight':
      return { bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' };
    case 'Underweight':
      return { bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' };
    case 'Overweight':
      return { bg: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800', text: 'text-orange-700 dark:text-orange-300', dot: 'bg-orange-500' };
    case 'Obesitas (Obese)':
      return { bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800', text: 'text-rose-700 dark:text-rose-300', dot: 'bg-rose-500' };
    default:
      return { bg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700', text: 'text-slate-600 dark:text-slate-400', dot: 'bg-slate-400' };
  }
}

/**
 * Category label from Score Level (1-4)
 */
export function getScoreCategory(score: ScoreLevel | null): string {
  if (!score) return '';
  return SCORE_CATEGORIES[score] || '';
}

/**
 * Calculate average of numeric scores (ignoring nulls)
 */
export function calculateAverage(scores: (ScoreLevel | null)[]): { avg: number | null; category: string } {
  const valid = scores.filter((s): s is ScoreLevel => s !== null && s !== undefined);
  if (valid.length === 0) return { avg: null, category: '' };
  const sum = valid.reduce((acc, curr) => acc + curr, 0);
  const avg = Math.round((sum / valid.length) * 100) / 100;

  // Resolve category based on rounded average
  let category = '';
  if (avg < 1.75) category = 'Low (basic)';
  else if (avg < 2.75) category = 'Fair (cukup)';
  else if (avg < 3.75) category = 'Good (baik)';
  else category = 'Great (baik sekali)';

  return { avg, category };
}

/**
 * Generate a random TCC Membership ID
 */
export function generateMemberId(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `TCC-${randomNum}`;
}

/**
 * Calculate completion status breakdown
 */
export interface CompletionStatus {
  totalFilled: number;
  totalFields: number;
  percentage: number;
  personal: { filled: number; total: number };
  measurements: { filled: number; total: number };
  composition: { filled: number; total: number };
  functional: { filled: number; total: number };
  strength: { filled: number; total: number };
  skill: { filled: number; total: number };
}

export function computeCompletion(form: Partial<ScoreCardRecord>): CompletionStatus {
  // 1. Personal (7 fields)
  // Full_Name, Gender, DoB, Umur, MemberID, Test_Date, Coaches
  const personalFields = [
    Boolean(form.Full_Name?.trim()),
    Boolean(form.Gender),
    Boolean(form.DoB),
    form.Umur !== null && form.Umur !== undefined,
    Boolean(form.MemberID?.trim()),
    Boolean(form.Test_Date),
    Boolean(form.Coaches),
  ];
  const personalFilled = personalFields.filter(Boolean).length;

  // 2. Measurements (10 fields)
  const measurementFields = [
    form.wing_span !== null && form.wing_span !== undefined && form.wing_span > 0,
    form.chest !== null && form.chest !== undefined && form.chest > 0,
    form.left_arm !== null && form.left_arm !== undefined && form.left_arm > 0,
    form.right_arm !== null && form.right_arm !== undefined && form.right_arm > 0,
    form.waist !== null && form.waist !== undefined && form.waist > 0,
    form.hips !== null && form.hips !== undefined && form.hips > 0,
    form.left_thigh !== null && form.left_thigh !== undefined && form.left_thigh > 0,
    form.right_tight !== null && form.right_tight !== undefined && form.right_tight > 0,
    form.left_calf !== null && form.left_calf !== undefined && form.left_calf > 0,
    form.right_calf !== null && form.right_calf !== undefined && form.right_calf > 0,
  ];
  const measurementsFilled = measurementFields.filter(Boolean).length;

  // 3. Composition & BMI (4 fields: body_fat, muscle_mass, height, weight)
  const compositionFields = [
    form.body_fat !== null && form.body_fat !== undefined && form.body_fat > 0,
    form.muscle_mass !== null && form.muscle_mass !== undefined && form.muscle_mass > 0,
    form.height !== null && form.height !== undefined && form.height > 0,
    form.weight !== null && form.weight !== undefined && form.weight > 0,
  ];
  const compositionFilled = compositionFields.filter(Boolean).length;

  // 4. Functional (5 fields)
  const functionalFields = [
    Boolean(form.score_deepSquat),
    Boolean(form.score_hurdleStep),
    Boolean(form.score_inlineLunge),
    Boolean(form.score_balance),
    Boolean(form.score_landing),
  ];
  const functionalFilled = functionalFields.filter(Boolean).length;

  // 5. Strength (6 fields)
  const strengthFields = [
    Boolean(form.score_lowerbody),
    Boolean(form.score_unilateralStrenght),
    Boolean(form.score_posteriorChain),
    Boolean(form.score_upperBody),
    Boolean(form.score_core),
    Boolean(form.score_conditioning),
  ];
  const strengthFilled = strengthFields.filter(Boolean).length;

  // 6. Skill (5 fields)
  const skillFields = [
    Boolean(form.score_power),
    Boolean(form.score_speed),
    Boolean(form.score_agility),
    Boolean(form.score_flexibility),
    Boolean(form.score_coordination),
  ];
  const skillFilled = skillFields.filter(Boolean).length;

  const totalFilled = personalFilled + measurementsFilled + compositionFilled + functionalFilled + strengthFilled + skillFilled;
  const totalFields = 7 + 10 + 4 + 5 + 6 + 5; // 37
  const percentage = Math.round((totalFilled / totalFields) * 100);

  return {
    totalFilled,
    totalFields,
    percentage,
    personal: { filled: personalFilled, total: 7 },
    measurements: { filled: measurementsFilled, total: 10 },
    composition: { filled: compositionFilled, total: 4 },
    functional: { filled: functionalFilled, total: 5 },
    strength: { filled: strengthFilled, total: 6 },
    skill: { filled: skillFilled, total: 5 },
  };
}
