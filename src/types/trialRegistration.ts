export type TrialCustomerType = 'Trial Kids' | 'Trial Adults';
export type ScheduleStatus = 'Confirmed' | 'Pending';
export type TrialStatus = 'Menunggu Trial' | 'Selesai Trial' | 'Member TCC';

export interface TrialRegistrationRecord {
  id: string;
  MemberID: string; // TCC-xxxx
  Customer_type: TrialCustomerType;
  Full_Name: string;
  Gender: 'Male' | 'Female' | '';
  DoB: string; // YYYY-MM-DD
  Umur: number | null;
  Email: string;
  WhatsApp_Number: string;
  Emergency_Contact: string;

  // Jadwal Sesi Trial
  Trial_Date: string; // YYYY-MM-DD
  Trial_Time: string; // HH:mm, e.g. "10:00"
  Trial_Day: string; // Hari, e.g. "Kamis"
  Coaches: string[]; // Assigned coach names
  schedule_status: ScheduleStatus;
  trial_status: TrialStatus;

  // Khusus KIDS - Sekolah & Club
  nama_sekolah?: string;
  kelas_grade?: string; // Grade 7 s/d College/University
  formakids_tergabung_dalamClub?: 'YA' | 'TIDAK' | '';
  formakids_cabang_olahraga?: string;
  formakids_aktif_olahraga?: 'YA' | 'TIDAK' | '';
  formakids_frek_Latihan?: string;

  // Khusus KIDS - Data Orang Tua / Wali
  nama_ayah?: string;
  no_whatsapp_ayah?: string;
  nama_ibu?: string;
  no_whatsapp_ibu?: string;
  email_orangTua?: string;
  nama_wali?: string;
  no_whatsapp_wali?: string;
  email_wali?: string;

  // Khusus ADULTS - Pekerjaan & Club
  formadults_tergabung_dalamKlub?: 'YA' | 'TIDAK' | '';
  formadults_cabang_olahraga?: string;
  formadults_aktif_olahraga?: 'YA' | 'TIDAK' | '';
  formadults_frek_Latihan?: string;
  formadults_pekerjaan?: string;
  formadults_perusahaan?: string;
  formadults_alamatKantor?: string;

  // Riwayat Kesehatan / Cedera (KIDS & ADULTS)
  formadults_kondisi: 'Sehat' | 'Ada Kondisi Khusus';
  formadults_kondisi_detail?: string;
  formadults_riwayat: 'Tidak Ada' | 'Ada';
  formadults_riwayat_detail?: string;
  formadults_cideraOperasi: 'Tidak Ada' | 'Ada';
  formadults_cideraOperasi_detail?: string;
  formadults_medisKhusus: 'Tidak Ada' | 'Ada';
  formadults_medisKhusus_detail?: string;
  formadults_kondisiKhusus: 'Tidak Ada' | 'Ada';
  formadults_kondisiKhusus_detail?: string;
  formadults_catatan?: string;

  // Asesmen Fisik Trial (Nilai 1-5)
  lower_body?: number | null;
  core?: number | null;
  upper_body?: number | null;
  avg_strength?: number | null;

  body_control?: number | null;
  flexibility?: number | null;
  agility?: number | null;
  speed?: number | null;
  avg_skill?: number | null;

  integrity?: number | null;
  principled?: number | null;
  perseverance?: number | null;
  believe_god?: number | null;
  avg_character?: number | null;

  // Rekomendasi Pelatih
  kekuatan_utama?: string;
  perlu_develop?: string;
  cat_performance?: string; // Basic Fundamental, Begginer, Intermediate, Advance
  rekomendasi_program?: string; // THE STRENGHT & FOUNDATION, THE SIGNATURE PROGRAM (FLIGHT & EXPLOSION)

  // Signatures
  signature_coach1?: string;
  signature_coach2?: string;
  signature_admin?: string;
  signature_coordinator?: string;

  // Conversion to Member TCC
  converted_member_id?: string; // New official TCC-xxxx ID when converted
  converted_at?: string;

  createdAt: string;
  updatedAt: string;
}

export const INITIAL_TRIAL_RECORD: Omit<TrialRegistrationRecord, 'id' | 'MemberID' | 'createdAt' | 'updatedAt'> = {
  Customer_type: 'Trial Adults',
  Full_Name: '',
  Gender: '',
  DoB: '',
  Umur: null,
  Email: '',
  WhatsApp_Number: '+62 ',
  Emergency_Contact: '+62 ',
  Trial_Date: '',
  Trial_Time: '',
  Trial_Day: '',
  Coaches: [],
  schedule_status: 'Pending',
  trial_status: 'Menunggu Trial',

  // Kids
  nama_sekolah: '',
  kelas_grade: '',
  formakids_tergabung_dalamClub: '',
  formakids_cabang_olahraga: '',
  formakids_aktif_olahraga: '',
  formakids_frek_Latihan: '',
  nama_ayah: '',
  no_whatsapp_ayah: '+62 ',
  nama_ibu: '',
  no_whatsapp_ibu: '+62 ',
  email_orangTua: '',
  nama_wali: '',
  no_whatsapp_wali: '+62 ',
  email_wali: '',

  // Adults
  formadults_tergabung_dalamKlub: '',
  formadults_cabang_olahraga: '',
  formadults_aktif_olahraga: '',
  formadults_frek_Latihan: '',
  formadults_pekerjaan: '',
  formadults_perusahaan: '',
  formadults_alamatKantor: '',

  // Medis
  formadults_kondisi: 'Sehat',
  formadults_kondisi_detail: '',
  formadults_riwayat: 'Tidak Ada',
  formadults_riwayat_detail: '',
  formadults_cideraOperasi: 'Tidak Ada',
  formadults_cideraOperasi_detail: '',
  formadults_medisKhusus: 'Tidak Ada',
  formadults_medisKhusus_detail: '',
  formadults_kondisiKhusus: 'Tidak Ada',
  formadults_kondisiKhusus_detail: '',
  formadults_catatan: '',

  // Asesmen Fisik
  lower_body: null,
  core: null,
  upper_body: null,
  avg_strength: null,
  body_control: null,
  flexibility: null,
  agility: null,
  speed: null,
  avg_skill: null,
  integrity: null,
  principled: null,
  perseverance: null,
  believe_god: null,
  avg_character: null,

  kekuatan_utama: '',
  perlu_develop: '',
  cat_performance: '',
  rekomendasi_program: '',

  signature_coach1: '',
  signature_coach2: '',
  signature_admin: '',
  signature_coordinator: '',
};

export const GRADE_OPTIONS = [
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12',
  'College/University',
];

export const FREKUENSI_OPTIONS = [
  '1 kali',
  '2-3 kali',
  '4-5 kali',
  '5-6 kali',
  '>6 kali',
];

export const PERFORMANCE_CATEGORIES = [
  'Basic Fundamental',
  'Begginer',
  'Intermediate',
  'Advance',
];

export const PROGRAM_OPTIONS = [
  'THE STRENGHT & FOUNDATION',
  'THE SIGNATURE PROGRAM (FLIGHT & EXPLOSION)',
];

export const INDONESIAN_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export function getIndonesianDayName(dateString: string): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return INDONESIAN_DAYS[d.getDay()];
  } catch {
    return '';
  }
}

/**
 * Logika Penjadwalan:
 * - 'Confirmed': HANYA JIKA Tanggal + Hari + Jam + Coach terpilih (minimal 1) semuanya lengkap!
 * - 'Pending': Jika salah satu atau lebih belum lengkap.
 */
export function computeScheduleStatus(record: Partial<TrialRegistrationRecord>): ScheduleStatus {
  const hasDate = Boolean(record.Trial_Date && record.Trial_Date.trim());
  const hasDay = Boolean(record.Trial_Day && record.Trial_Day.trim());
  const hasTime = Boolean(record.Trial_Time && record.Trial_Time.trim());
  const hasCoach = Array.isArray(record.Coaches) && record.Coaches.length > 0;
  return hasDate && hasDay && hasTime && hasCoach ? 'Confirmed' : 'Pending';
}

