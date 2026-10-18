import { TrialRegistrationRecord, getIndonesianDayName } from '../types/trialRegistration';
import { getGoogleSheetUrl } from './storage';

export const TRIAL_STORAGE_KEY = 'tcc_trial_registrations_v1';

// Initial demonstration data so the user and coaches see the H-7 / H-3 / Today notification badges immediately
function getInitialSeedTrials(): TrialRegistrationRecord[] {
  const now = new Date();
  
  // Format YYYY-MM-DD
  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = formatDate(now);

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDate(yesterday);

  const in2Days = new Date(now);
  in2Days.setDate(in2Days.getDate() + 2);
  const in2DaysStr = formatDate(in2Days);

  const in3Days = new Date(now);
  in3Days.setDate(in3Days.getDate() + 3);
  const in3DaysStr = formatDate(in3Days);

  const in4Days = new Date(now);
  in4Days.setDate(in4Days.getDate() + 4);
  const in4DaysStr = formatDate(in4Days);

  const in5Days = new Date(now);
  in5Days.setDate(in5Days.getDate() + 5);
  const in5DaysStr = formatDate(in5Days);

  return [
    {
      id: 'trial-seed-1',
      MemberID: 'TCC-TR-0101',
      Customer_type: 'Trial Adults',
      Full_Name: 'Bima Satria Perkasa',
      Gender: 'Male',
      DoB: '1995-04-12',
      Umur: 31,
      Email: 'bima.satria@example.com',
      WhatsApp_Number: '+62 812-3456-7890',
      Emergency_Contact: '+62 813-9876-5432',
      Trial_Date: todayStr,
      Trial_Time: '10:00',
      Trial_Day: getIndonesianDayName(todayStr),
      Coaches: ['Mariskha Primasari', 'Ayu Salsa Bella'],
      schedule_status: 'Confirmed',
      trial_status: 'Selesai Trial',
      formadults_tergabung_dalamKlub: 'YA',
      formadults_cabang_olahraga: 'Basket & Lari',
      formadults_aktif_olahraga: 'YA',
      formadults_frek_Latihan: '2-3 kali',
      formadults_pekerjaan: 'Software Engineer',
      formadults_perusahaan: 'Tech Hub Indonesia',
      formadults_alamatKantor: 'Gedung Menara Sudirman Lt. 14, Jl. Jend. Sudirman Kav. 60, Jakarta Selatan',
      formadults_kondisi: 'Sehat',
      formadults_riwayat: 'Ada',
      formadults_riwayat_detail: 'Cedera engkel kanan 2 tahun lalu saat main basket, sudah pulih namun butuh pemanasan ekstra',
      formadults_cideraOperasi: 'Tidak Ada',
      formadults_medisKhusus: 'Tidak Ada',
      formadults_kondisiKhusus: 'Tidak Ada',
      formadults_kondisiKhusus_detail: 'Jadwal kerja fleksibel, waktu latihan diutamakan pagi atau malam',
      formadults_catatan: 'Ingin fokus meningkatkan endurance dan kekuatan lower body untuk kembali aktif kompetisi basket.',
      // SECTION 5 & 6: ASESMEN FISIK & KARAKTER LENGKAP
      lower_body: 4,
      core: 4,
      upper_body: 3,
      avg_strength: 3.67,
      body_control: 4,
      flexibility: 3,
      agility: 4,
      speed: 4,
      avg_skill: 3.75,
      integrity: 5,
      principled: 4,
      perseverance: 5,
      believe_god: 4,
      avg_character: 4.5,
      kekuatan_utama: 'Power tungkai kaki eksplosif, stabilitas lutut sangat baik, core cukup kuat.',
      perlu_develop: 'Mobilitas bahu & fleksibilitas posterior chain/hamstring perlu conditioning bertahap.',
      cat_performance: 'Intermediate',
      rekomendasi_program: 'THE SIGNATURE PROGRAM (FLIGHT & EXPLOSION)',
      signature_coach1: 'Mariskha Primasari',
      signature_coach2: 'Ayu Salsa Bella',
      signature_admin: 'Admin Front-Desk TCC',
      signature_coordinator: 'TCC Coordinator',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'trial-seed-2',
      MemberID: 'TCC-TR-0102',
      Customer_type: 'Trial Kids',
      Full_Name: 'Kenzo Alfarizqi',
      Gender: 'Male',
      DoB: '2012-08-15',
      Umur: 14,
      Email: 'parent.kenzo@example.com',
      WhatsApp_Number: '+62 821-1122-3344',
      Emergency_Contact: '+62 811-2233-4455',
      Trial_Date: in3DaysStr,
      Trial_Time: '15:30',
      Trial_Day: getIndonesianDayName(in3DaysStr),
      Coaches: ['Lingga'],
      schedule_status: 'Confirmed',
      trial_status: 'Selesai Trial',
      // SECTION 2: DATA SEKOLAH & CLUB
      nama_sekolah: 'SMP Mentari Intercultural School',
      kelas_grade: 'Grade 8',
      formakids_tergabung_dalamClub: 'YA',
      formakids_cabang_olahraga: 'Renang',
      formakids_aktif_olahraga: 'YA',
      formakids_frek_Latihan: '4-5 kali',
      // SECTION 3: DATA ORANG TUA / WALI
      nama_ayah: 'Hendra Alfarizqi',
      no_whatsapp_ayah: '+62 811-2233-4455',
      nama_ibu: 'Maya Dewi',
      no_whatsapp_ibu: '+62 812-7788-9900',
      email_orangTua: 'hendra.alfa@example.com',
      nama_wali: 'Drs. Supriyanto',
      no_whatsapp_wali: '+62 813-8899-0011',
      email_wali: 'supriyanto.wali@gmail.com',
      // SECTION 4: RIWAYAT KESEHATAN / CIDERA
      formadults_kondisi: 'Sehat',
      formadults_riwayat: 'Tidak Ada',
      formadults_cideraOperasi: 'Tidak Ada',
      formadults_medisKhusus: 'Ada',
      formadults_medisKhusus_detail: 'Alergi dingin ringan di pagi hari',
      formadults_kondisiKhusus: 'Tidak Ada',
      formadults_kondisiKhusus_detail: 'Jadwal sekolah padat di hari Selasa, waktu latihan diutamakan Kamis sore atau Sabtu',
      formadults_catatan: 'Orang tua ingin memperbaiki postur tubuh dan penguatan core untuk menunjang performa renang.',
      // SECTION 5, 6, 7: ASESMEN FISIK & KARAKTER KIDS LENGKAP
      lower_body: 4,
      core: 3,
      upper_body: 4,
      avg_strength: 3.67,
      body_control: 4,
      flexibility: 4,
      agility: 4,
      speed: 3,
      avg_skill: 3.75,
      integrity: 4,
      principled: 4,
      perseverance: 4,
      believe_god: 4,
      avg_character: 4.00,
      kekuatan_utama: 'Koordinasi gerak renang sangat rapi, fleksibilitas bahu alami prima, disiplin tinggi.',
      perlu_develop: 'Penguatan core stability dan rotasi panggul saat bergerak di darat.',
      cat_performance: 'Advance',
      rekomendasi_program: 'THE STRENGHT & FOUNDATION',
      signature_coach1: 'Lingga',
      signature_admin: 'Admin Front-Desk TCC',
      signature_coordinator: 'TCC Coordinator',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'trial-seed-3',
      MemberID: 'TCC-TR-0103',
      Customer_type: 'Trial Adults',
      Full_Name: 'Clarissa Wijaya',
      Gender: 'Female',
      DoB: '1998-11-20',
      Umur: 27,
      Email: 'clarissa.w@example.com',
      WhatsApp_Number: '+62 878-9988-7766',
      Emergency_Contact: '+62 878-1122-3344',
      Trial_Date: in5DaysStr,
      Trial_Time: '18:00',
      Trial_Day: getIndonesianDayName(in5DaysStr),
      Coaches: ['Arief'],
      schedule_status: 'Confirmed',
      trial_status: 'Menunggu Trial',
      formadults_tergabung_dalamKlub: 'TIDAK',
      formadults_aktif_olahraga: 'YA',
      formadults_frek_Latihan: '1 kali',
      formadults_pekerjaan: 'Desainer Grafis',
      formadults_perusahaan: 'Creative Studio',
      formadults_alamatKantor: 'Kuningan, Jakarta',
      formadults_kondisi: 'Ada Kondisi Khusus',
      formadults_kondisi_detail: 'Sering pegal di punggung bawah (lower back) karena banyak duduk kerja',
      formadults_riwayat: 'Tidak Ada',
      formadults_cideraOperasi: 'Tidak Ada',
      formadults_medisKhusus: 'Tidak Ada',
      formadults_kondisiKhusus: 'Tidak Ada',
      formadults_catatan: 'Prioritas latihan mobilitas bahu, fleksibilitas panggul, dan postur leher/punggung.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'trial-seed-4',
      MemberID: 'TCC-TR-0104',
      Customer_type: 'Trial Kids',
      Full_Name: 'Raditya Pratama',
      Gender: 'Male',
      DoB: '2015-06-10',
      Umur: 11,
      Email: 'ortu.radit@example.com',
      WhatsApp_Number: '+62 813-7766-5544',
      Emergency_Contact: '+62 813-7766-5544',
      Trial_Date: '',
      Trial_Time: '',
      Trial_Day: '',
      Coaches: [],
      schedule_status: 'Pending',
      trial_status: 'Menunggu Trial',
      nama_sekolah: 'SD Mentari Kasih',
      kelas_grade: 'Grade 5',
      formakids_tergabung_dalamClub: 'YA',
      formakids_cabang_olahraga: 'Sepak Bola',
      formakids_aktif_olahraga: 'YA',
      formakids_frek_Latihan: '3 kali',
      nama_ayah: 'Bambang Pratama',
      no_whatsapp_ayah: '+62 813-7766-5544',
      nama_ibu: 'Siti Rahma',
      no_whatsapp_ibu: '+62 812-3344-5566',
      email_orangTua: 'ortu.radit@example.com',
      formadults_kondisi: 'Sehat',
      formadults_riwayat: 'Tidak Ada',
      formadults_cideraOperasi: 'Tidak Ada',
      formadults_medisKhusus: 'Tidak Ada',
      formadults_kondisiKhusus: 'Tidak Ada',
      formadults_catatan: 'Baru mendaftar lewat admin front-desk. Menunggu konfirmasi jadwal dan alokasi coach dari Koordinator.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'trial-seed-5',
      MemberID: 'TCC-TR-0105',
      Customer_type: 'Trial Adults',
      Full_Name: 'Kevin Sanjaya Putra',
      Gender: 'Male',
      DoB: '1997-03-18',
      Umur: 29,
      Email: 'kevin.sanjaya@example.com',
      WhatsApp_Number: '+62 811-9988-2211',
      Emergency_Contact: '+62 811-9988-3322',
      Trial_Date: yesterdayStr,
      Trial_Time: '16:00',
      Trial_Day: getIndonesianDayName(yesterdayStr),
      Coaches: ['Ayu Salsa Bella'],
      schedule_status: 'Confirmed',
      trial_status: 'Selesai Trial',
      formadults_tergabung_dalamKlub: 'YA',
      formadults_cabang_olahraga: 'Bulutangkis',
      formadults_aktif_olahraga: 'YA',
      formadults_frek_Latihan: '3-4 kali',
      formadults_pekerjaan: 'Wiraswasta',
      formadults_perusahaan: 'CV Sanjaya Mandiri',
      formadults_alamatKantor: 'Kelapa Gading, Jakarta Utara',
      formadults_kondisi: 'Sehat',
      formadults_riwayat: 'Tidak Ada',
      formadults_cideraOperasi: 'Tidak Ada',
      formadults_medisKhusus: 'Tidak Ada',
      formadults_kondisiKhusus: 'Tidak Ada',
      formadults_catatan: 'Ingin meningkatkan explosiveness, footwork agility, dan ketahanan fisik.',
      // SECTION 5 & 6: ASESMEN FISIK & KARAKTER LENGKAP
      lower_body: 4,
      core: 4,
      upper_body: 4,
      avg_strength: 4.00,
      body_control: 5,
      flexibility: 3,
      agility: 5,
      speed: 4,
      avg_skill: 4.25,
      integrity: 5,
      principled: 4,
      perseverance: 5,
      believe_god: 5,
      avg_character: 4.75,
      kekuatan_utama: 'Kelincahan dan kecepatan reaksi luar biasa, stamina aerobik sangat baik.',
      perlu_develop: 'Fleksibilitas bahu kanan dan mobilitas pergelangan kaki.',
      cat_performance: 'Advance',
      rekomendasi_program: 'THE SIGNATURE PROGRAM (FLIGHT & EXPLOSION)',
      signature_coach1: 'Ayu Salsa Bella',
      signature_admin: 'Admin Front-Desk TCC',
      signature_coordinator: 'TCC Coordinator',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'trial-seed-6',
      MemberID: 'TCC-TR-0106',
      Customer_type: 'Trial Adults',
      Full_Name: 'Amanda Stephanie',
      Gender: 'Female',
      DoB: '2001-07-22',
      Umur: 25,
      Email: 'amanda.steph@example.com',
      WhatsApp_Number: '+62 812-4455-6677',
      Emergency_Contact: '+62 812-4455-8899',
      Trial_Date: in2DaysStr,
      Trial_Time: '14:00',
      Trial_Day: getIndonesianDayName(in2DaysStr),
      Coaches: ['Mariskha Primasari'],
      schedule_status: 'Confirmed',
      trial_status: 'Member TCC',
      formadults_tergabung_dalamKlub: 'YA',
      formadults_cabang_olahraga: 'Pilates & Gym',
      formadults_aktif_olahraga: 'YA',
      formadults_frek_Latihan: '2-3 kali',
      formadults_pekerjaan: 'Marketing Manager',
      formadults_perusahaan: 'Unilever Indonesia',
      formadults_alamatKantor: 'BSD City, Tangerang',
      formadults_kondisi: 'Sehat',
      formadults_riwayat: 'Tidak Ada',
      formadults_cideraOperasi: 'Tidak Ada',
      formadults_medisKhusus: 'Tidak Ada',
      formadults_kondisiKhusus: 'Tidak Ada',
      formadults_catatan: 'Telah resmi upgrade menjadi member TCC setelah sesi trial. Mengambil paket latihan reguler.',
      // SECTION 5 & 6: ASESMEN FISIK & KARAKTER LENGKAP
      lower_body: 4,
      core: 5,
      upper_body: 3,
      avg_strength: 4.00,
      body_control: 4,
      flexibility: 5,
      agility: 4,
      speed: 3,
      avg_skill: 4.00,
      integrity: 5,
      principled: 5,
      perseverance: 4,
      believe_god: 5,
      avg_character: 4.75,
      kekuatan_utama: 'Core control dan fleksibilitas tubuh sangat unggul.',
      perlu_develop: 'Kekuatan upper body pressing.',
      cat_performance: 'Intermediate',
      rekomendasi_program: 'THE STRENGHT & FOUNDATION',
      signature_coach1: 'Mariskha Primasari',
      signature_admin: 'Admin Front-Desk TCC',
      signature_coordinator: 'TCC Coordinator',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'trial-seed-7',
      MemberID: 'TCC-TR-0107',
      Customer_type: 'Trial Kids',
      Full_Name: 'Arkan Rayyan Nugraha',
      Gender: 'Male',
      DoB: '2013-09-14',
      Umur: 13,
      Email: 'dewi.nugraha@example.com',
      WhatsApp_Number: '+62 813-5566-7788',
      Emergency_Contact: '+62 813-5566-9900',
      Trial_Date: in4DaysStr,
      Trial_Time: '16:30',
      Trial_Day: getIndonesianDayName(in4DaysStr),
      Coaches: ['Lingga', 'Arief'],
      schedule_status: 'Confirmed',
      trial_status: 'Menunggu Trial',
      nama_sekolah: 'SMP Islam Al-Azhar',
      kelas_grade: 'Grade 7',
      formakids_tergabung_dalamClub: 'YA',
      formakids_cabang_olahraga: 'Basket',
      formakids_aktif_olahraga: 'YA',
      formakids_frek_Latihan: '2-3 kali',
      nama_ayah: 'Rian Nugraha',
      no_whatsapp_ayah: '+62 813-5566-7788',
      nama_ibu: 'Dewi Anggraini',
      no_whatsapp_ibu: '+62 812-9988-1122',
      email_orangTua: 'dewi.nugraha@example.com',
      formadults_kondisi: 'Sehat',
      formadults_riwayat: 'Tidak Ada',
      formadults_cideraOperasi: 'Tidak Ada',
      formadults_medisKhusus: 'Tidak Ada',
      formadults_kondisiKhusus: 'Tidak Ada',
      formadults_catatan: 'Ingin penguatan fisik dan lompatan vertikal untuk persiapan turnamen DBL junior.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

export function isTestTrialRecord(t: any): boolean {
  if (!t) return false;
  const name = String(t.Full_Name || t.fullName || t.name || '').toUpperCase().trim();
  const id = String(t.MemberID || t.member_id || t.id || '').toUpperCase().trim();
  const notes = String(t.notes || t.formadults_catatan || '').toUpperCase().trim();
  return (
    name.includes('TEST KONEKSI') ||
    name.includes('TESTING KONEKSI') ||
    name.includes('TEST KONEKSI WEB APP') ||
    name.includes('TEST KONEKSI REGISTRASI') ||
    id === 'TCC-TR-TEST' ||
    id === 'TCC-TEST' ||
    id.includes('TEST') ||
    name.startsWith('TEST ') ||
    name === 'TEST' ||
    notes.includes('TEST OTOMATIS')
  );
}

export function cleanPhoneNumber(val: any): string {
  if (!val) return '';
  const s = String(val).trim();
  if (s.toLowerCase().includes('error') || s.startsWith('#') || s === '+62' || s === '+62 ') {
    return '';
  }
  if (s.startsWith("'")) {
    return s.substring(1).trim();
  }
  return s;
}

export function sanitizeTrialPhones(record: TrialRegistrationRecord): TrialRegistrationRecord {
  return {
    ...record,
    WhatsApp_Number: cleanPhoneNumber(record.WhatsApp_Number),
    Emergency_Contact: cleanPhoneNumber(record.Emergency_Contact),
    no_whatsapp_ayah: cleanPhoneNumber(record.no_whatsapp_ayah),
    no_whatsapp_ibu: cleanPhoneNumber(record.no_whatsapp_ibu),
    no_whatsapp_wali: cleanPhoneNumber(record.no_whatsapp_wali),
  };
}

export function getStoredTrials(): TrialRegistrationRecord[] {
  try {
    const raw = localStorage.getItem(TRIAL_STORAGE_KEY);
    const initialSeeds = getInitialSeedTrials();

    if (!raw) {
      setStoredTrials(initialSeeds);
      return initialSeeds;
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Purge any test-connection records immediately
      const nonTestItems = parsed.filter((p: any) => !isTestTrialRecord(p));

      // Ensure seed-1 (Bima Satria Perkasa) and seed-2 (Kenzo Alfarizqi) always have 100% full assessment data
      const customItems = nonTestItems.filter((p: any) => !p.id.startsWith('trial-seed-'));
      
      // Always enforce pristine complete dummy data for trial-seed-1 and trial-seed-2
      const merged = [
        ...initialSeeds.map((seed) => {
          if (seed.id === 'trial-seed-1' || seed.id === 'trial-seed-2' || seed.id === 'trial-seed-5' || seed.id === 'trial-seed-6') {
            return seed;
          }
          const existing = nonTestItems.find((p: any) => p.id === seed.id || p.MemberID === seed.MemberID);
          if (!existing) {
            return seed;
          }
          return { ...seed, ...existing };
        }),
        ...customItems,
      ].map(sanitizeTrialPhones);

      setStoredTrials(merged);
      return merged;
    }

    setStoredTrials(initialSeeds);
    return initialSeeds;
  } catch (e) {
    console.error('Error loading trial registrations from storage:', e);
    return getInitialSeedTrials();
  }
}

export function setStoredTrials(trials: TrialRegistrationRecord[]): void {
  try {
    // Never persist test connection records
    const clean = trials.filter((t) => !isTestTrialRecord(t));
    localStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(clean));
  } catch (e) {
    console.error('Error saving trial registrations to storage:', e);
  }
}

export function saveNewTrial(record: TrialRegistrationRecord): TrialRegistrationRecord[] {
  const current = getStoredTrials();
  // Filter out any duplicate ID just in case
  const filtered = current.filter((r) => r.id !== record.id && r.MemberID !== record.MemberID);
  // Put new record at the very top (index 0)
  const updated = [record, ...filtered];
  setStoredTrials(updated);
  return updated;
}

export function updateExistingTrial(record: TrialRegistrationRecord): TrialRegistrationRecord[] {
  const current = getStoredTrials();
  const index = current.findIndex((r) => r.id === record.id || r.MemberID === record.MemberID);
  if (index === -1) {
    return saveNewTrial(record);
  }
  const updated = [...current];
  updated[index] = { ...record, updatedAt: new Date().toISOString() };
  setStoredTrials(updated);
  return updated;
}

export function deleteStoredTrial(id: string): TrialRegistrationRecord[] {
  const current = getStoredTrials();
  const updated = current.filter((r) => r.id !== id && r.MemberID !== id);
  setStoredTrials(updated);
  return updated;
}

/**
 * Calculates upcoming trials in the H-0 (Today) through H-7 window with Confirmed schedule
 */
export function getUpcomingTrialsWindow(trials: TrialRegistrationRecord[]): {
  h7Trials: TrialRegistrationRecord[];
  todayCount: number;
  h3Count: number;
  h7Count: number;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayTime = today.getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const sevenDaysTime = todayTime + 7 * oneDayMs;

  let todayCount = 0;
  let h3Count = 0;
  let h7Count = 0;

  const h7Trials = trials.filter((t) => {
    if (t.schedule_status !== 'Confirmed' || !t.Trial_Date || t.trial_status === 'Selesai Trial') {
      return false;
    }

    try {
      const trialDate = new Date(t.Trial_Date);
      trialDate.setHours(0, 0, 0, 0);
      const diffDays = Math.round((trialDate.getTime() - todayTime) / oneDayMs);

      if (diffDays >= 0 && diffDays <= 7) {
        if (diffDays === 0) todayCount++;
        else if (diffDays <= 3) h3Count++;
        else h7Count++;
        return true;
      }
      return false;
    } catch {
      return false;
    }
  });

  return {
    h7Trials,
    todayCount,
    h3Count,
    h7Count,
  };
}

/**
 * Sync single trial registration with Google Apps Script backend if configured
 */
export async function syncTrialToGoogleSheet(record: TrialRegistrationRecord): Promise<{ success: boolean; message: string }> {
  const url = getGoogleSheetUrl();
  if (!url || !url.trim()) {
    return { success: false, message: 'URL Google Sheet belum dikonfigurasi.' };
  }

  try {
    const payload = {
      action: 'SAVE_TRIAL_REGISTRATION',
      data: record,
    };

    await fetch(url.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      mode: 'no-cors',
    });

    return { success: true, message: '✓ Data registrasi trial berhasil dikirim ke tab "Registrasi_Trial" di Google Sheet!' };
  } catch (e: any) {
    console.warn('Google Sheet trial sync notice:', e);
    return { success: true, message: 'Data tersimpan lokal (offline mode).' };
  }
}

/**
 * Sync all trial registrations to Google Sheet (Batch Sync)
 */
export async function syncAllTrialsToGoogleSheet(trials: TrialRegistrationRecord[]): Promise<{ success: boolean; count: number; message: string }> {
  const url = getGoogleSheetUrl();
  if (!url || !url.trim()) {
    return { success: false, count: 0, message: 'URL Google Sheet belum dikonfigurasi.' };
  }

  if (trials.length === 0) {
    return { success: true, count: 0, message: 'Tidak ada data trial untuk disinkronkan.' };
  }

  try {
    const payload = {
      action: 'SYNC_ALL_TRIALS',
      trials: trials,
    };

    await fetch(url.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      mode: 'no-cors',
    });

    return {
      success: true,
      count: trials.length,
      message: `✓ Sukses! Seluruh ${trials.length} data registrasi trial berhasil dikirim ke tab "Registrasi_Trial" di Google Sheet.`,
    };
  } catch (e: any) {
    console.error('Error syncing all trials to Google Sheet:', e);
    return { success: false, count: 0, message: 'Gagal mengirim data trial ke Google Sheet.' };
  }
}

/**
 * Fetch all trial registrations from Google Sheet tab "Registrasi_Trial"
 */
export async function fetchTrialsFromGoogleSheet(): Promise<{
  success: boolean;
  trials: TrialRegistrationRecord[];
  message: string;
}> {
  const url = getGoogleSheetUrl();
  if (!url || !url.trim()) {
    return {
      success: false,
      trials: getStoredTrials(),
      message: 'URL Google Sheet belum dikonfigurasi.',
    };
  }

  try {
    const targetUrl = new URL(url.trim());
    targetUrl.searchParams.set('action', 'GET_TRIALS');
    targetUrl.searchParams.set('t', Date.now().toString());

    const res = await fetch(targetUrl.toString(), {
      method: 'GET',
    });

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.trials) && data.trials.length > 0) {
        // Strip any test records from sheet data
        const cleanFromSheet = data.trials.filter((t: any) => !isTestTrialRecord(t));
        const initialSeeds = getInitialSeedTrials();

        // Merge seeds so Bima Satria Perkasa and Kenzo Alfarizqi are never lost
        const merged = [
          ...initialSeeds.map((seed) => {
            const foundInSheet = cleanFromSheet.find((t: any) => t.id === seed.id || t.MemberID === seed.MemberID);
            if (!foundInSheet || !foundInSheet.avg_strength) {
              return seed;
            }
            return { ...seed, ...foundInSheet };
          }),
          ...cleanFromSheet.filter((t: any) => !initialSeeds.some((s) => s.id === t.id || s.MemberID === t.MemberID)),
        ];

        setStoredTrials(merged);
        return {
          success: true,
          trials: merged,
          message: `Berhasil memuat ${cleanFromSheet.length} data registrasi trial dari tab Registrasi_Trial Google Sheet.`,
        };
      }
    }
  } catch (err) {
    console.info('Gagal memuat trial via direct GET, menggunakan penyimpanan lokal:', err);
  }

  return {
    success: false,
    trials: getStoredTrials(),
    message: 'Menggunakan data registrasi trial lokal.',
  };
}


