import { ScoreCardRecord } from '../types/scoreCard';

const STORAGE_KEY = 'tcc_scorecard_records_v1';
const GOOGLE_SHEET_URL_KEY = 'tcc_google_sheet_webhook_url';

export const SEED_RECORDS: ScoreCardRecord[] = [
  {
    id: 'rec-seed-001',
    createdAt: '2026-10-10T10:00:00.000Z',
    updatedAt: '2026-10-10T10:00:00.000Z',
    entry_type: 'member',
    Customer_type: 'member',
    Full_Name: 'Mariskha Primasari (Sample)',
    Gender: 'male',
    DoB: '2001-06-15',
    Umur: 25,
    MemberID: 'TCC-2481',
    Test_Date: '2026-10-11',
    Coaches: 'Mariskha Primasari',

    // Measurements (10)
    wing_span: 176,
    chest: 96,
    left_arm: 32,
    right_arm: 32.5,
    waist: 77,
    hips: 93,
    left_thigh: 53,
    right_tight: 53.5,
    left_calf: 36,
    right_calf: 36,

    // Composition
    body_fat: 15.2,
    muscle_mass: 41.5,
    height: 174,
    weight: 67,
    BMI: 22.1,
    cat_bmi: 'Normal Weight',

    // Functional
    score_deepSquat: 3,
    cat_deepSquat: 'Good (baik)',
    score_hurdleStep: 3,
    cat_hurdleStep: 'Good (baik)',
    score_inlineLunge: 3,
    cat_inlineLunge: 'Good (baik)',
    score_balance: 4,
    cat_balance: 'Great (baik sekali)',
    score_landing: 3,
    cat_landing: 'Good (baik)',
    avg_functional: 3.2,

    // Strength
    score_lowerbody: 3,
    cat_lowerbody: 'Good (baik)',
    score_unilateralStrenght: 3,
    cat_unilateralStrenght: 'Good (baik)',
    score_posteriorChain: 4,
    cat_posteriorChain: 'Great (baik sekali)',
    score_upperBody: 3,
    cat_upperBody: 'Good (baik)',
    score_core: 4,
    cat_core: 'Great (baik sekali)',
    score_conditioning: 3,
    cat_conditioning: 'Good (baik)',
    avg_strength: 3.33,

    // Skill
    score_power: 3,
    cat_power: 'Good (baik)',
    score_speed: 4,
    cat_speed: 'Great (baik sekali)',
    score_agility: 3,
    cat_agility: 'Good (baik)',
    score_flexibility: 3,
    cat_flexibility: 'Good (baik)',
    score_coordination: 4,
    cat_coordination: 'Great (baik sekali)',
    avg_skill: 3.4,

    notes: 'Member assessment awal kuartal ke-4. Keseimbangan dan core sangat baik.',
  },
  {
    id: 'rec-seed-002',
    createdAt: '2026-10-08T09:30:00.000Z',
    updatedAt: '2026-10-08T09:30:00.000Z',
    entry_type: 'trial',
    Customer_type: 'trial',
    Full_Name: 'Budi Santoso',
    Gender: 'male',
    DoB: '1998-04-20',
    Umur: 28,
    MemberID: 'TCC-1092',
    Test_Date: '2026-10-08',
    Coaches: 'Ayu Salsa Bella',

    wing_span: 170,
    chest: 92,
    left_arm: 30,
    right_arm: 30,
    waist: 82,
    hips: 95,
    left_thigh: 50,
    right_tight: 50,
    left_calf: 34,
    right_calf: 34,

    body_fat: 21.0,
    muscle_mass: 38.0,
    height: 168,
    weight: 71,
    BMI: 25.2,
    cat_bmi: 'Overweight',

    score_deepSquat: 2,
    cat_deepSquat: 'Fair (cukup)',
    score_hurdleStep: 2,
    cat_hurdleStep: 'Fair (cukup)',
    score_inlineLunge: 2,
    cat_inlineLunge: 'Fair (cukup)',
    score_balance: 3,
    cat_balance: 'Good (baik)',
    score_landing: 2,
    cat_landing: 'Fair (cukup)',
    avg_functional: 2.2,

    score_lowerbody: 2,
    cat_lowerbody: 'Fair (cukup)',
    score_unilateralStrenght: 2,
    cat_unilateralStrenght: 'Fair (cukup)',
    score_posteriorChain: 3,
    cat_posteriorChain: 'Good (baik)',
    score_upperBody: 2,
    cat_upperBody: 'Fair (cukup)',
    score_core: 3,
    cat_core: 'Good (baik)',
    score_conditioning: 2,
    cat_conditioning: 'Fair (cukup)',
    avg_strength: 2.33,

    score_power: 2,
    cat_power: 'Fair (cukup)',
    score_speed: 3,
    cat_speed: 'Good (baik)',
    score_agility: 2,
    cat_agility: 'Fair (cukup)',
    score_flexibility: 2,
    cat_flexibility: 'Fair (cukup)',
    score_coordination: 3,
    cat_coordination: 'Good (baik)',
    avg_skill: 2.4,

    notes: 'Sesi trial 1x. Membutuhkan peningkatan mobilitas ankle dan hip.',
  },
];

export function getStoredRecords(): ScoreCardRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_RECORDS));
      return SEED_RECORDS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Normalize any historical or external records to ensure Full_Name and MemberID are always present
      return parsed.map((item: any) => ({
        ...item,
        Full_Name:
          (
            item.Full_Name ||
            item.fullName ||
            item.full_name ||
            item.Name ||
            item.name ||
            item.nama ||
            item.Nama ||
            item.member_name ||
            item.memberName ||
            item.customer_name ||
            item.customerName ||
            (item.MemberID ? `Member ${item.MemberID}` : 'Nama Belum Diisi')
          ).toString().trim() || (item.MemberID ? `Member ${item.MemberID}` : 'Nama Belum Diisi'),
        MemberID: item.MemberID || item.memberId || item.member_id || item.Member_Id || '',
        Customer_type: item.Customer_type || item.customer_type || item.customerType || 'member',
      }));
    }
    return SEED_RECORDS;
  } catch (e) {
    console.error('Failed reading records from localStorage:', e);
    return SEED_RECORDS;
  }
}

/**
 * Save or update record.
 * Crucial: If record with same ID exists, it updates in-place without creating a duplicate row!
 */
export function saveOrUpdateRecord(record: ScoreCardRecord): { records: ScoreCardRecord[]; isUpdate: boolean } {
  const current = getStoredRecords();
  const index = current.findIndex((r) => r.id === record.id || (r.MemberID && r.MemberID === record.MemberID && record.entry_type === 'edit'));

  const now = new Date().toISOString();
  let updatedList: ScoreCardRecord[];
  let isUpdate = false;

  if (index >= 0) {
    // Update existing row
    isUpdate = true;
    const updatedRecord = {
      ...record,
      id: current[index].id,
      createdAt: current[index].createdAt || now,
      updatedAt: now,
    };
    updatedList = [...current];
    updatedList[index] = updatedRecord;
  } else {
    // New entry
    const newRecord = {
      ...record,
      id: record.id || `rec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: now,
      updatedAt: now,
    };
    updatedList = [newRecord, ...current];
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  } catch (e) {
    console.error('Failed saving records to localStorage:', e);
  }

  return { records: updatedList, isUpdate };
}

export function deleteStoredRecord(id: string): ScoreCardRecord[] {
  const current = getStoredRecords();
  const filtered = current.filter((r) => r.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed deleting record from localStorage:', e);
  }
  return filtered;
}

export function setStoredRecords(records: ScoreCardRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed setting records in localStorage:', e);
  }
}

export function getGoogleSheetUrl(): string {
  return (
    localStorage.getItem(GOOGLE_SHEET_URL_KEY) ||
    (import.meta.env.VITE_GOOGLE_SHEET_WEBHOOK_URL as string) ||
    ''
  );
}

export function hasGoogleSheetUrlConfigured(): boolean {
  const url = getGoogleSheetUrl();
  return Boolean(url && url.trim().length > 0);
}

export function setGoogleSheetUrl(url: string): void {
  const trimmed = url.trim();
  localStorage.setItem(GOOGLE_SHEET_URL_KEY, trimmed);
  if (trimmed.length > 0) {
    setDatabaseConnected(true);
  }
}

const ADMIN_PASSWORD_KEY = 'tcc_admin_pin_password';
const DEFAULT_ADMIN_PASSWORD = 'admin';

export function getAdminPassword(): string {
  try {
    return localStorage.getItem(ADMIN_PASSWORD_KEY) || DEFAULT_ADMIN_PASSWORD;
  } catch (e) {
    return DEFAULT_ADMIN_PASSWORD;
  }
}

export function setAdminPassword(newPass: string): void {
  try {
    localStorage.setItem(ADMIN_PASSWORD_KEY, newPass.trim());
  } catch (e) {
    // ignore
  }
}

export function verifyAdminPassword(input: string): boolean {
  return input.trim() === getAdminPassword();
}

const DB_STATUS_KEY = 'tcc_database_status_active';

export function isDatabaseConnected(): boolean {
  try {
    const hasUrl = hasGoogleSheetUrlConfigured();
    if (!hasUrl) return false;
    const val = localStorage.getItem(DB_STATUS_KEY);
    if (val === 'false') return false;
    return true;
  } catch (e) {
    return false;
  }
}

export function setDatabaseConnected(connected: boolean): void {
  try {
    localStorage.setItem(DB_STATUS_KEY, connected ? 'true' : 'false');
  } catch (e) {
    // ignore
  }
}

/**
 * Format CSV matching the exact CSV schema provided by user
 */
export function exportRecordsToCSV(records: ScoreCardRecord[]): void {
  const headers = [
    'Record_ID',
    'Created_At',
    'Updated_At',
    'Entry_Type',
    'Customer_Type',
    'Full_Name',
    'Gender',
    'DoB',
    'Age',
    'MemberID',
    'Test_Date',
    'Coaches',
    'Wing_Span_cm',
    'Chest_cm',
    'Left_Arm_cm',
    'Right_Arm_cm',
    'Waist_cm',
    'Hips_cm',
    'Left_Thigh_cm',
    'Right_Thigh_cm',
    'Left_Calf_cm',
    'Right_Calf_cm',
    'Body_Fat_pct',
    'Muscle_Mass_pct',
    'Height_cm',
    'Weight_kg',
    'BMI',
    'Category_BMI',
    'Score_DeepSquat',
    'Cat_DeepSquat',
    'Score_HurdleStep',
    'Cat_HurdleStep',
    'Score_InlineLunge',
    'Cat_InlineLunge',
    'Score_Balance',
    'Cat_Balance',
    'Score_Landing',
    'Cat_Landing',
    'Avg_Functional',
    'Score_LowerBody',
    'Cat_LowerBody',
    'Score_UnilateralStrength',
    'Cat_UnilateralStrength',
    'Score_PosteriorChain',
    'Cat_PosteriorChain',
    'Score_UpperBody',
    'Cat_UpperBody',
    'Score_Core',
    'Cat_Core',
    'Score_Conditioning',
    'Cat_Conditioning',
    'Avg_Strength',
    'Score_Power',
    'Cat_Power',
    'Score_Speed',
    'Cat_Speed',
    'Score_Agility',
    'Cat_Agility',
    'Score_Flexibility',
    'Cat_Flexibility',
    'Score_Coordination',
    'Cat_Coordination',
    'Avg_Skill_Related_Fitness',
    'Notes',
  ];

  const rows = records.map((r) => [
    r.id,
    r.createdAt,
    r.updatedAt,
    r.entry_type,
    r.Customer_type,
    `"${(r.Full_Name || '').replace(/"/g, '""')}"`,
    r.Gender,
    r.DoB,
    r.Umur ?? '',
    r.MemberID,
    r.Test_Date,
    `"${(r.Coaches || '').replace(/"/g, '""')}"`,
    r.wing_span ?? '',
    r.chest ?? '',
    r.left_arm ?? '',
    r.right_arm ?? '',
    r.waist ?? '',
    r.hips ?? '',
    r.left_thigh ?? '',
    r.right_tight ?? '',
    r.left_calf ?? '',
    r.right_calf ?? '',
    r.body_fat ?? '',
    r.muscle_mass ?? '',
    r.height ?? '',
    r.weight ?? '',
    r.BMI ?? '',
    `"${r.cat_bmi || ''}"`,
    r.score_deepSquat ?? '',
    `"${r.cat_deepSquat || ''}"`,
    r.score_hurdleStep ?? '',
    `"${r.cat_hurdleStep || ''}"`,
    r.score_inlineLunge ?? '',
    `"${r.cat_inlineLunge || ''}"`,
    r.score_balance ?? '',
    `"${r.cat_balance || ''}"`,
    r.score_landing ?? '',
    `"${r.cat_landing || ''}"`,
    r.avg_functional ?? '',
    r.score_lowerbody ?? '',
    `"${r.cat_lowerbody || ''}"`,
    r.score_unilateralStrenght ?? '',
    `"${r.cat_unilateralStrenght || ''}"`,
    r.score_posteriorChain ?? '',
    `"${r.cat_posteriorChain || ''}"`,
    r.score_upperBody ?? '',
    `"${r.cat_upperBody || ''}"`,
    r.score_core ?? '',
    `"${r.cat_core || ''}"`,
    r.score_conditioning ?? '',
    `"${r.cat_conditioning || ''}"`,
    r.avg_strength ?? '',
    r.score_power ?? '',
    `"${r.cat_power || ''}"`,
    r.score_speed ?? '',
    `"${r.cat_speed || ''}"`,
    r.score_agility ?? '',
    `"${r.cat_agility || ''}"`,
    r.score_flexibility ?? '',
    `"${r.cat_flexibility || ''}"`,
    r.score_coordination ?? '',
    `"${r.cat_coordination || ''}"`,
    r.avg_skill ?? '',
    `"${(r.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `TCC_Fitness_ScoreCard_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
