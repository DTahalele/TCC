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

  const in3Days = new Date(now);
  in3Days.setDate(in3Days.getDate() + 3);
  const in3DaysStr = formatDate(in3Days);

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
      trial_status: 'Menunggu Trial',
      formadults_tergabung_dalamKlub: 'YA',
      formadults_cabang_olahraga: 'Basket & Lari',
      formadults_aktif_olahraga: 'YA',
      formadults_frek_Latihan: '2-3 kali',
      formadults_pekerjaan: 'Software Engineer',
      formadults_perusahaan: 'Tech Hub Indonesia',
      formadults_alamatKantor: 'Sudirman, Jakarta',
      formadults_kondisi: 'Sehat',
      formadults_riwayat: 'Ada',
      formadults_riwayat_detail: 'Cedera engkel kanan 2 tahun lalu saat main basket, sudah pulih namun butuh pemanasan ekstra',
      formadults_cideraOperasi: 'Tidak Ada',
      formadults_medisKhusus: 'Tidak Ada',
      formadults_kondisiKhusus: 'Tidak Ada',
      formadults_catatan: 'Ingin fokus meningkatkan endurance dan kekuatan lower body untuk kembali aktif kompetisi basket.',
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
      trial_status: 'Menunggu Trial',
      nama_sekolah: 'SMP Mentari Intercultural School',
      kelas_grade: 'Grade 8',
      formakids_tergabung_dalamClub: 'YA',
      formakids_cabang_olahraga: 'Renang',
      formakids_aktif_olahraga: 'YA',
      formakids_frek_Latihan: '4-5 kali',
      nama_ayah: 'Hendra Alfarizqi',
      no_whatsapp_ayah: '+62 811-2233-4455',
      nama_ibu: 'Maya Dewi',
      no_whatsapp_ibu: '+62 812-7788-9900',
      email_orangTua: 'hendra.alfa@example.com',
      formadults_kondisi: 'Sehat',
      formadults_riwayat: 'Tidak Ada',
      formadults_cideraOperasi: 'Tidak Ada',
      formadults_medisKhusus: 'Ada',
      formadults_medisKhusus_detail: 'Alergi dingin ringan di pagi hari',
      formadults_kondisiKhusus: 'Tidak Ada',
      formadults_catatan: 'Orang tua ingin memperbaiki postur tubuh dan penguatan core untuk menunjang performa renang.',
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
  ];
}

export function getStoredTrials(): TrialRegistrationRecord[] {
  try {
    const raw = localStorage.getItem(TRIAL_STORAGE_KEY);
    if (!raw) {
      const initial = getInitialSeedTrials();
      setStoredTrials(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    const initial = getInitialSeedTrials();
    setStoredTrials(initial);
    return initial;
  } catch (e) {
    console.error('Error loading trial registrations from storage:', e);
    return [];
  }
}

export function setStoredTrials(trials: TrialRegistrationRecord[]): void {
  try {
    localStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(trials));
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
        setStoredTrials(data.trials);
        return {
          success: true,
          trials: data.trials,
          message: `Berhasil memuat ${data.trials.length} data registrasi trial dari tab Registrasi_Trial Google Sheet.`,
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


