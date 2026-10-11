export type CustomerType = 'member' | 'trial';
export type Gender = 'male' | 'female';
export type ScoreLevel = 1 | 2 | 3 | 4;

export interface ScoreItem {
  score: ScoreLevel | null;
  category: string;
}

export interface ScoreCardRecord {
  id: string; // Unique record ID (UUID / timestamp)
  createdAt: string;
  updatedAt: string;

  // Entry type & Personal Data
  entry_type: 'member' | 'trial' | 'edit';
  Customer_type: CustomerType;
  Full_Name: string;
  Gender: Gender | '';
  DoB: string; // YYYY-MM-DD
  Umur: number | null; // Years
  MemberID: string; // TCC-xxxx
  Test_Date: string; // YYYY-MM-DD
  Coaches: string;

  // Body Composition - 10 Body Measurements (cm)
  wing_span: number | null;
  chest: number | null;
  left_arm: number | null;
  right_arm: number | null;
  waist: number | null;
  hips: number | null;
  left_thigh: number | null;
  right_tight: number | null;
  left_calf: number | null;
  right_calf: number | null;

  // Komposisi Lemak, Massa Otot & BMI
  body_fat: number | null; // %
  muscle_mass: number | null; // %
  height: number | null; // cm
  weight: number | null; // kg
  BMI: number | null;
  cat_bmi: string;

  // Functional Assessment (Score 1-4)
  score_deepSquat: ScoreLevel | null;
  cat_deepSquat: string;
  score_hurdleStep: ScoreLevel | null;
  cat_hurdleStep: string;
  score_inlineLunge: ScoreLevel | null;
  cat_inlineLunge: string;
  score_balance: ScoreLevel | null;
  cat_balance: string;
  score_landing: ScoreLevel | null;
  cat_landing: string;
  avg_functional: number | null;

  // Strength (Score 1-4)
  score_lowerbody: ScoreLevel | null;
  cat_lowerbody: string;
  score_unilateralStrenght: ScoreLevel | null;
  cat_unilateralStrenght: string;
  score_posteriorChain: ScoreLevel | null;
  cat_posteriorChain: string;
  score_upperBody: ScoreLevel | null;
  cat_upperBody: string;
  score_core: ScoreLevel | null;
  cat_core: string;
  score_conditioning: ScoreLevel | null;
  cat_conditioning: string;
  avg_strength: number | null;

  // Skill Related Fitness (Score 1-4)
  score_power: ScoreLevel | null;
  cat_power: string;
  score_speed: ScoreLevel | null;
  cat_speed: string;
  score_agility: ScoreLevel | null;
  cat_agility: string;
  score_flexibility: ScoreLevel | null;
  cat_flexibility: string;
  score_coordination: ScoreLevel | null;
  cat_coordination: string;
  avg_skill: number | null;

  // Notes / Additional observations (optional)
  notes?: string;
}

export const COACHES_LIST = [
  'Mariskha Primasari',
  'Ayu Salsa Bella',
  'Lingga',
  'Arief',
  'Wirna',
];

export const SCORE_CATEGORIES: Record<ScoreLevel, string> = {
  1: 'Low (basic)',
  2: 'Fair (cukup)',
  3: 'Good (baik)',
  4: 'Great (baik sekali)',
};

export const INITIAL_RECORD: Omit<ScoreCardRecord, 'id' | 'createdAt' | 'updatedAt'> = {
  entry_type: 'member',
  Customer_type: 'member',
  Full_Name: '',
  Gender: 'male',
  DoB: '',
  Umur: null,
  MemberID: '',
  Test_Date: new Date().toISOString().split('T')[0],
  Coaches: 'Mariskha Primasari',

  wing_span: null,
  chest: null,
  left_arm: null,
  right_arm: null,
  waist: null,
  hips: null,
  left_thigh: null,
  right_tight: null,
  left_calf: null,
  right_calf: null,

  body_fat: null,
  muscle_mass: null,
  height: null,
  weight: null,
  BMI: null,
  cat_bmi: '',

  score_deepSquat: null,
  cat_deepSquat: '',
  score_hurdleStep: null,
  cat_hurdleStep: '',
  score_inlineLunge: null,
  cat_inlineLunge: '',
  score_balance: null,
  cat_balance: '',
  score_landing: null,
  cat_landing: '',
  avg_functional: null,

  score_lowerbody: null,
  cat_lowerbody: '',
  score_unilateralStrenght: null,
  cat_unilateralStrenght: '',
  score_posteriorChain: null,
  cat_posteriorChain: '',
  score_upperBody: null,
  cat_upperBody: '',
  score_core: null,
  cat_core: '',
  score_conditioning: null,
  cat_conditioning: '',
  avg_strength: null,

  score_power: null,
  cat_power: '',
  score_speed: null,
  cat_speed: '',
  score_agility: null,
  cat_agility: '',
  score_flexibility: null,
  cat_flexibility: '',
  score_coordination: null,
  cat_coordination: '',
  avg_skill: null,

  notes: '',
};
