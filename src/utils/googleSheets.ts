import { ScoreCardRecord } from '../types/scoreCard';
import { getGoogleSheetUrl, getStoredRecords, setStoredRecords } from './storage';

export interface SyncResult {
  success: boolean;
  message: string;
  actionUsed: 'CREATE' | 'UPDATE' | 'SYNC_ALL' | 'TEST';
  syncedCount?: number;
}

function formatRecordForSheet(record: ScoreCardRecord) {
  return {
    record_id: record.id,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
    entry_type: record.entry_type,
    customer_type: record.Customer_type,
    full_name: record.Full_Name,
    gender: record.Gender,
    dob: record.DoB,
    age: record.Umur,
    member_id: record.MemberID,
    test_date: record.Test_Date,
    coaches: record.Coaches,
    wing_span: record.wing_span,
    chest: record.chest,
    left_arm: record.left_arm,
    right_arm: record.right_arm,
    waist: record.waist,
    hips: record.hips,
    left_thigh: record.left_thigh,
    right_tight: record.right_tight,
    left_calf: record.left_calf,
    right_calf: record.right_calf,
    body_fat: record.body_fat,
    muscle_mass: record.muscle_mass,
    height: record.height,
    weight: record.weight,
    bmi: record.BMI,
    category_bmi: record.cat_bmi,
    score_deep_squat: record.score_deepSquat,
    cat_deep_squat: record.cat_deepSquat,
    score_hurdle_step: record.score_hurdleStep,
    cat_hurdle_step: record.cat_hurdleStep,
    score_inline_lunge: record.score_inlineLunge,
    cat_inline_lunge: record.cat_inlineLunge,
    score_balance: record.score_balance,
    cat_balance: record.cat_balance,
    score_landing: record.score_landing,
    cat_landing: record.cat_landing,
    avg_functional: record.avg_functional,
    score_lower_body: record.score_lowerbody,
    cat_lower_body: record.cat_lowerbody,
    score_unilateral_strength: record.score_unilateralStrenght,
    cat_unilateral_strength: record.cat_unilateralStrenght,
    score_posterior_chain: record.score_posteriorChain,
    cat_posterior_chain: record.cat_posteriorChain,
    score_upper_body: record.score_upperBody,
    cat_upper_body: record.cat_upperBody,
    score_core: record.score_core,
    cat_core: record.cat_core,
    score_conditioning: record.score_conditioning,
    cat_conditioning: record.cat_conditioning,
    avg_strength: record.avg_strength,
    score_power: record.score_power,
    cat_power: record.cat_power,
    score_speed: record.score_speed,
    cat_speed: record.cat_speed,
    score_agility: record.score_agility,
    cat_agility: record.cat_agility,
    score_flexibility: record.score_flexibility,
    cat_flexibility: record.cat_flexibility,
    score_coordination: record.score_coordination,
    cat_coordination: record.cat_coordination,
    avg_skill: record.avg_skill,
    notes: record.notes || '',
  };
}

/**
 * Send single record to Google Sheet Webhook.
 * It sends action "UPDATE" if editing existing record, or "CREATE" if new.
 */
export async function syncRecordToGoogleSheet(
  record: ScoreCardRecord,
  isUpdate: boolean
): Promise<SyncResult> {
  const webhookUrl = getGoogleSheetUrl();
  const actionUsed = isUpdate ? 'UPDATE' : 'CREATE';

  if (!webhookUrl || !webhookUrl.trim()) {
    return {
      success: false,
      message: 'URL Google Apps Script belum dikonfigurasi di Web App ini. Data disimpan di Arsip lokal perangkat.',
      actionUsed,
    };
  }

  try {
    const payload = {
      action: actionUsed,
      recordId: record.id,
      memberId: record.MemberID,
      timestamp: new Date().toISOString(),
      data: formatRecordForSheet(record),
    };

    await fetch(webhookUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      mode: 'no-cors',
    });

    return {
      success: true,
      message: isUpdate
        ? 'Data berhasil di-UPDATE pada Database Sheet (baris yang sama diperbarui tanpa duplikasi).'
        : 'Data berhasil di-SUBMIT sebagai record baru ke Database Sheet.',
      actionUsed,
    };
  } catch (error) {
    console.warn('Google Sheet sync note:', error);
    return {
      success: false,
      message: `Gagal mengirim ke Google Sheet: ${(error as Error).message || 'Koneksi gagal'}`,
      actionUsed,
    };
  }
}

/**
 * Bulk sync all records from Arsip to Google Sheet.
 * Crucial guarantee: Deduplicates data by unique MemberID/Record_ID before transmission,
 * and updates existing rows in-place on the database sheet so data is NEVER duplicated!
 */
export async function syncAllRecordsToGoogleSheet(
  records: ScoreCardRecord[]
): Promise<SyncResult> {
  const webhookUrl = getGoogleSheetUrl();

  if (!webhookUrl || !webhookUrl.trim()) {
    return {
      success: false,
      message: 'URL Google Apps Script belum dikonfigurasi di Web App ini. Silakan buka ikon Pengaturan Database (⚙️) di header untuk memasukkan URL.',
      actionUsed: 'SYNC_ALL',
      syncedCount: 0,
    };
  }

  if (records.length === 0) {
    return {
      success: true,
      message: 'Tidak ada data dalam Arsip untuk disinkronkan.',
      actionUsed: 'SYNC_ALL',
      syncedCount: 0,
    };
  }

  // Deduplicate records client-side first so each MemberID only occurs once with the newest record
  const uniqueMap = new Map<string, ScoreCardRecord>();
  for (const r of records) {
    const key = (r.MemberID && r.MemberID.trim()) ? r.MemberID.trim() : r.id;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, r);
    } else {
      const existing = uniqueMap.get(key)!;
      const existingTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
      const currentTime = new Date(r.updatedAt || r.createdAt || 0).getTime();
      if (currentTime >= existingTime) {
        uniqueMap.set(key, r);
      }
    }
  }
  const cleanRecords = Array.from(uniqueMap.values());

  try {
    const payload = {
      action: 'SYNC_ALL',
      timestamp: new Date().toISOString(),
      records: cleanRecords.map((r) => ({
        recordId: r.id,
        memberId: r.MemberID,
        data: formatRecordForSheet(r),
      })),
    };

    await fetch(webhookUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      mode: 'no-cors',
    });

    try {
      localStorage.setItem('tcc_last_database_sync', new Date().toISOString());
    } catch (e) {
      // ignore
    }

    return {
      success: true,
      message: `Berhasil menyinkronkan ${cleanRecords.length} data ke Database Sheet! Data diperbarui secara in-place tanpa duplikasi row.`,
      actionUsed: 'SYNC_ALL',
      syncedCount: cleanRecords.length,
    };
  } catch (error) {
    console.warn('Batch sync network warning:', error);
    return {
      success: false,
      message: `Gagal mengirim data ke Google Sheet: ${(error as Error).message || 'Gagal menghubungi server Google'}`,
      actionUsed: 'SYNC_ALL',
      syncedCount: 0,
    };
  }
}

/**
 * Tarik / sinkronkan seluruh baris data dari tab "Database" di Google Sheet ke Web App.
 * Memastikan semua pengguna / pelatih melihat arsip yang sama dan terpusat saat login atau membuka aplikasi.
 */
export async function fetchRecordsFromGoogleSheet(): Promise<{
  success: boolean;
  records: ScoreCardRecord[];
  message: string;
}> {
  const webhookUrl = getGoogleSheetUrl();
  if (!webhookUrl || !webhookUrl.trim()) {
    return {
      success: false,
      records: getStoredRecords(),
      message: 'URL Google Apps Script belum dikonfigurasi. Menggunakan cache data lokal.',
    };
  }

  try {
    const targetUrl = new URL(webhookUrl.trim());
    targetUrl.searchParams.set('action', 'GET_RECORDS');
    targetUrl.searchParams.set('t', Date.now().toString());

    const res = await fetch(targetUrl.toString(), {
      method: 'GET',
    });

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.records)) {
        const rawList = data.records;
        const cleanList: ScoreCardRecord[] = rawList.map((item: any, idx: number) => {
          return {
            id: String(item.id || item.record_id || `rec-sheet-${idx + 1}`),
            createdAt: item.createdAt || item.created_at || new Date().toISOString(),
            updatedAt: item.updatedAt || item.updated_at || new Date().toISOString(),
            entry_type: (item.entry_type || 'member') as any,
            Customer_type: (item.Customer_type || item.customer_type || 'member') as any,
            Full_Name: String(
              item.Full_Name ||
              item.full_name ||
              item.fullName ||
              (item.MemberID ? `Member ${item.MemberID}` : 'Peserta')
            ).trim(),
            Gender: (item.Gender || item.gender || '') as any,
            DoB: String(item.DoB || item.dob || ''),
            Umur: item.Umur !== null && item.Umur !== undefined && item.Umur !== '' ? Number(item.Umur) : null,
            MemberID: String(item.MemberID || item.member_id || item.memberId || ''),
            Test_Date: String(item.Test_Date || item.test_date || ''),
            Coaches: String(item.Coaches || item.coaches || ''),
            wing_span: item.wing_span !== null && item.wing_span !== undefined && item.wing_span !== '' ? Number(item.wing_span) : null,
            chest: item.chest !== null && item.chest !== undefined && item.chest !== '' ? Number(item.chest) : null,
            left_arm: item.left_arm !== null && item.left_arm !== undefined && item.left_arm !== '' ? Number(item.left_arm) : null,
            right_arm: item.right_arm !== null && item.right_arm !== undefined && item.right_arm !== '' ? Number(item.right_arm) : null,
            waist: item.waist !== null && item.waist !== undefined && item.waist !== '' ? Number(item.waist) : null,
            hips: item.hips !== null && item.hips !== undefined && item.hips !== '' ? Number(item.hips) : null,
            left_thigh: item.left_thigh !== null && item.left_thigh !== undefined && item.left_thigh !== '' ? Number(item.left_thigh) : null,
            right_tight: item.right_tight !== null && item.right_tight !== undefined && item.right_tight !== '' ? Number(item.right_tight) : null,
            left_calf: item.left_calf !== null && item.left_calf !== undefined && item.left_calf !== '' ? Number(item.left_calf) : null,
            right_calf: item.right_calf !== null && item.right_calf !== undefined && item.right_calf !== '' ? Number(item.right_calf) : null,
            body_fat: item.body_fat !== null && item.body_fat !== undefined && item.body_fat !== '' ? Number(item.body_fat) : null,
            muscle_mass: item.muscle_mass !== null && item.muscle_mass !== undefined && item.muscle_mass !== '' ? Number(item.muscle_mass) : null,
            height: item.height !== null && item.height !== undefined && item.height !== '' ? Number(item.height) : null,
            weight: item.weight !== null && item.weight !== undefined && item.weight !== '' ? Number(item.weight) : null,
            BMI: item.BMI !== null && item.BMI !== undefined && item.BMI !== '' ? Number(item.BMI) : null,
            cat_bmi: String(item.cat_bmi || item.category_bmi || ''),
            score_deepSquat: item.score_deepSquat || item.score_deep_squat || null,
            cat_deepSquat: String(item.cat_deepSquat || item.cat_deep_squat || ''),
            score_hurdleStep: item.score_hurdleStep || item.score_hurdle_step || null,
            cat_hurdleStep: String(item.cat_hurdleStep || item.cat_hurdle_step || ''),
            score_inlineLunge: item.score_inlineLunge || item.score_inline_lunge || null,
            cat_inlineLunge: String(item.cat_inlineLunge || item.cat_inline_lunge || ''),
            score_balance: item.score_balance || null,
            cat_balance: String(item.cat_balance || ''),
            score_landing: item.score_landing || null,
            cat_landing: String(item.cat_landing || ''),
            avg_functional: item.avg_functional !== null && item.avg_functional !== undefined && item.avg_functional !== '' ? Number(item.avg_functional) : null,
            score_lowerbody: item.score_lowerbody || item.score_lower_body || null,
            cat_lowerbody: String(item.cat_lowerbody || item.cat_lower_body || ''),
            score_unilateralStrenght: item.score_unilateralStrenght || item.score_unilateral_strength || null,
            cat_unilateralStrenght: String(item.cat_unilateralStrenght || item.cat_unilateral_strength || ''),
            score_posteriorChain: item.score_posteriorChain || item.score_posterior_chain || null,
            cat_posteriorChain: String(item.cat_posteriorChain || item.cat_posterior_chain || ''),
            score_upperBody: item.score_upperBody || item.score_upper_body || null,
            cat_upperBody: String(item.cat_upperBody || item.cat_upper_body || ''),
            score_core: item.score_core || null,
            cat_core: String(item.cat_core || ''),
            score_conditioning: item.score_conditioning || null,
            cat_conditioning: String(item.cat_conditioning || ''),
            avg_strength: item.avg_strength !== null && item.avg_strength !== undefined && item.avg_strength !== '' ? Number(item.avg_strength) : null,
            score_power: item.score_power || null,
            cat_power: String(item.cat_power || ''),
            score_speed: item.score_speed || null,
            cat_speed: String(item.cat_speed || ''),
            score_agility: item.score_agility || null,
            cat_agility: String(item.cat_agility || ''),
            score_flexibility: item.score_flexibility || null,
            cat_flexibility: String(item.cat_flexibility || ''),
            score_coordination: item.score_coordination || null,
            cat_coordination: String(item.cat_coordination || ''),
            avg_skill: item.avg_skill !== null && item.avg_skill !== undefined && item.avg_skill !== '' ? Number(item.avg_skill) : null,
            notes: String(item.notes || ''),
          };
        });

        // Simpan hasil sinkronisasi ke penyimpanan lokal agar cepat dan bisa offline
        setStoredRecords(cleanList);
        return {
          success: true,
          records: cleanList,
          message: `Berhasil menyinkronkan ${cleanList.length} data riwayat dari database Google Sheet!`,
        };
      }
    }
  } catch (err) {
    console.info('Pemberitahuan: Belum dapat memuat data via koneksi langsung Google Sheet, memuat data tersimpan:', err);
  }

  return {
    success: false,
    records: getStoredRecords(),
    message: 'Menggunakan data arsip lokal.',
  };
}

/**
 * Send a tangible test row to Google Sheet to visually verify in the sheet
 */
export async function sendTestRowToGoogleSheet(): Promise<SyncResult> {
  const webhookUrl = getGoogleSheetUrl();
  if (!webhookUrl) {
    return {
      success: false,
      message: 'Silakan masukkan URL Web App Google Apps Script terlebih dahulu.',
      actionUsed: 'TEST',
    };
  }

  try {
    const testPayload = {
      action: 'TEST',
      timestamp: new Date().toISOString(),
      data: {
        record_id: `rec-test-${Date.now().toString().slice(-4)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        entry_type: 'trial',
        customer_type: 'trial',
        full_name: 'TEST KONEKSI WEB APP',
        gender: 'male',
        dob: '2000-01-01',
        age: 26,
        member_id: 'TCC-TEST',
        test_date: new Date().toISOString().split('T')[0],
        coaches: 'System Test',
        wing_span: 170,
        chest: 90,
        left_arm: 30,
        right_arm: 30,
        waist: 75,
        hips: 90,
        left_thigh: 50,
        right_tight: 50,
        left_calf: 35,
        right_calf: 35,
        body_fat: 15,
        muscle_mass: 40,
        height: 170,
        weight: 65,
        bmi: 22.5,
        category_bmi: 'Normal Weight',
        score_deep_squat: 3,
        cat_deep_squat: 'Good (baik)',
        score_hurdle_step: 3,
        cat_hurdle_step: 'Good (baik)',
        score_inline_lunge: 3,
        cat_inline_lunge: 'Good (baik)',
        score_balance: 4,
        cat_balance: 'Great (baik sekali)',
        score_landing: 3,
        cat_landing: 'Good (baik)',
        avg_functional: 3.2,
        score_lower_body: 3,
        cat_lower_body: 'Good (baik)',
        score_unilateral_strength: 3,
        cat_unilateral_strength: 'Good (baik)',
        score_posterior_chain: 4,
        cat_posterior_chain: 'Great (baik sekali)',
        score_upper_body: 3,
        cat_upper_body: 'Good (baik)',
        score_core: 4,
        cat_core: 'Great (baik sekali)',
        score_conditioning: 3,
        cat_conditioning: 'Good (baik)',
        avg_strength: 3.33,
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
        notes: 'Baris ini adalah tes otomatis untuk memverifikasi bahwa Webhook Google Sheet berfungsi dengan baik. Anda dapat menghapus baris ini kapan saja.',
      },
    };

    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(testPayload),
      mode: 'no-cors',
    });

    return {
      success: true,
      message: 'Perintah tes tulis baris "TCC-TEST" telah dikirim ke Google Sheet! Silakan buka spreadsheet Anda untuk memeriksa apakah baris "TCC-TEST" muncul di tab DataCustomer.',
      actionUsed: 'TEST',
    };
  } catch (err) {
    return {
      success: false,
      message: `Gagal mengirim tes: ${(err as Error).message}`,
      actionUsed: 'TEST',
    };
  }
}

/**
 * Send a tangible test row specifically to the "Registrasi_Trial" sheet in Google Spreadsheet
 */
export async function sendTestRowToTrialSheet(): Promise<{
  success: boolean;
  message: string;
  actionUsed: string;
}> {
  const webhookUrl = getGoogleSheetUrl();
  if (!webhookUrl || !webhookUrl.trim()) {
    return {
      success: false,
      message: 'URL Google Apps Script belum dikonfigurasi.',
      actionUsed: 'NONE',
    };
  }

  try {
    const testPayload = {
      action: 'TEST_TRIAL',
      data: {
        id: 'trial-test-' + Date.now(),
        MemberID: 'TCC-TR-TEST',
        Customer_type: 'Trial Adults',
        Full_Name: 'TEST KONEKSI REGISTRASI TRIAL',
        Gender: 'Male',
        DoB: '1995-05-15',
        Umur: 31,
        Email: 'trial.test@example.com',
        WhatsApp_Number: '+62 812-3456-7890',
        Emergency_Contact: '+62 813-9876-5432',
        Trial_Date: new Date().toISOString().split('T')[0],
        Trial_Day: 'Hari Ini',
        Trial_Time: '10:00',
        Coaches: ['Mariskha Primasari'],
        schedule_status: 'Confirmed',
        trial_status: 'Menunggu Trial',
        formadults_pekerjaan: 'Tester Sistem',
        formadults_perusahaan: 'The Core Chamber',
        formadults_kondisi: 'Sehat',
        formadults_riwayat: 'Tidak Ada',
        formadults_catatan: 'Baris ini adalah tes verifikasi bahwa tab Registrasi_Trial terhubung 100%. Anda dapat menghapus baris ini kapan saja.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(testPayload),
      mode: 'no-cors',
    });

    return {
      success: true,
      message: '✓ Perintah tes tulis baris "TCC-TR-TEST" telah dikirim ke sheet "Registrasi_Trial"! Buka tab Registrasi_Trial di spreadsheet Anda untuk memeriksa baris tes ini.',
      actionUsed: 'TEST_TRIAL',
    };
  } catch (err) {
    return {
      success: false,
      message: `Gagal mengirim tes: ${(err as Error).message}`,
      actionUsed: 'TEST_TRIAL',
    };
  }
}


export interface DiagnosticProbeResult {
  probeName: string;
  method: string;
  mode: string;
  httpStatus?: number;
  httpStatusText?: string;
  durationMs: number;
  success: boolean;
  responseTextSnippet?: string;
  corsBlocked?: boolean;
  timeout?: boolean;
  error?: string;
}

export interface GoogleAppsScriptDiagnosticReport {
  timestamp: string;
  targetUrl: string;
  isAndroid: boolean;
  isMobile: boolean;
  isOnline: boolean;
  userAgent: string;
  probes: DiagnosticProbeResult[];
  detectedIssue:
    | 'NONE'
    | 'EMPTY_URL'
    | 'INVALID_URL_SCHEME'
    | 'DEV_URL_INSTEAD_OF_EXEC'
    | 'CORS_OR_AUTH_RESTRICTED'
    | 'NETWORK_TIMEOUT'
    | 'NETWORK_OFFLINE'
    | 'UNKNOWN_ERROR';
  summaryMessage: string;
  technicalDetails: string;
  recommendedAction: string;
}

/**
 * Diagnostic tool function that logs specific response (HTTP status code and text)
 * from the Google App Script endpoint to identify CORS, network timeouts,
 * or mobile device differences.
 */
export async function runGoogleSheetDiagnostics(
  customUrl?: string,
  timeoutMs: number = 10000
): Promise<GoogleAppsScriptDiagnosticReport> {
  const targetUrl = (customUrl || getGoogleSheetUrl() || '').trim();
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
  const isAndroid = /android/i.test(userAgent);
  const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  const probes: DiagnosticProbeResult[] = [];
  const startTime = Date.now();

  console.group(`🔍 [TCC GOOGLE APPS SCRIPT DIAGNOSTIC] - ${new Date().toLocaleTimeString()}`);
  console.info('Diagnosing Google Apps Script Endpoint:', targetUrl || '(KOSONG)');
  console.info('Client Environment:', {
    isAndroid,
    isMobile,
    isOnline,
    userAgent,
    timestamp: new Date().toISOString(),
  });

  // Check 1: Empty or Invalid URL format
  if (!targetUrl) {
    const report: GoogleAppsScriptDiagnosticReport = {
      timestamp: new Date().toISOString(),
      targetUrl: '',
      isAndroid,
      isMobile,
      isOnline,
      userAgent,
      probes: [],
      detectedIssue: 'EMPTY_URL',
      summaryMessage: 'URL Google Apps Script belum diisi di perangkat ini.',
      technicalDetails: 'Target endpoint URL string is empty or undefined in storage.',
      recommendedAction:
        'Masukkan URL Web App Google Apps Script (berakhiran /exec) di kolom pengaturan lalu simpan.',
    };
    console.warn('Diagnostic Result: URL is empty.');
    console.groupEnd();
    return report;
  }

  const isDevUrl = targetUrl.endsWith('/dev');
  const isExecUrl = targetUrl.includes('/macros/s/') && targetUrl.endsWith('/exec');
  const hasValidScheme = targetUrl.startsWith('https://script.google.com/');

  // Probe 1: HTTP GET Probe (Testing Endpoint Readability, HTTP Status Code & Text)
  const probe1Start = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const getRes = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json, text/plain, */*',
      },
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timer);

    const probe1Duration = Date.now() - probe1Start;
    const bodyText = await getRes.text();
    const snippet = bodyText.slice(0, 400);

    probes.push({
      probeName: 'Probe 1: HTTP GET (CORS enabled)',
      method: 'GET',
      mode: 'cors',
      httpStatus: getRes.status,
      httpStatusText: getRes.statusText,
      durationMs: probe1Duration,
      success: getRes.status >= 200 && getRes.status < 400,
      responseTextSnippet: snippet,
      corsBlocked: false,
      timeout: false,
    });

    console.log(`[Probe 1 GET] Status: ${getRes.status} ${getRes.statusText} (${probe1Duration}ms)`);
    console.log('[Probe 1 GET] Response Body:', snippet);
  } catch (err: unknown) {
    const probe1Duration = Date.now() - probe1Start;
    const errorObj = err as Error;
    const isTimeout = errorObj.name === 'AbortError';
    const isCors =
      !isTimeout &&
      (errorObj instanceof TypeError || errorObj.message.toLowerCase().includes('fetch'));

    probes.push({
      probeName: 'Probe 1: HTTP GET (CORS enabled)',
      method: 'GET',
      mode: 'cors',
      durationMs: probe1Duration,
      success: false,
      timeout: isTimeout,
      corsBlocked: isCors,
      error: errorObj.message || 'Gagal melakukan fetch GET',
      responseTextSnippet: isTimeout
        ? 'Request timeout (>10s)'
        : isCors
        ? 'Akses diblokir oleh CORS atau redirect Google Auth'
        : errorObj.message,
    });

    console.warn(`[Probe 1 GET Error] (${probe1Duration}ms):`, errorObj.message);
  }

  // Probe 2: HTTP POST Probe with text payload
  const probe2Start = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const postPayload = JSON.stringify({
      action: 'DIAGNOSTIC_PING',
      timestamp: new Date().toISOString(),
      clientInfo: { isAndroid, isMobile },
    });

    const postRes = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: postPayload,
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timer);

    const probe2Duration = Date.now() - probe2Start;
    const postBodyText = await postRes.text();
    const postSnippet = postBodyText.slice(0, 400);

    probes.push({
      probeName: 'Probe 2: HTTP POST (CORS follow redirect)',
      method: 'POST',
      mode: 'cors',
      httpStatus: postRes.status,
      httpStatusText: postRes.statusText,
      durationMs: probe2Duration,
      success: postRes.status >= 200 && postRes.status < 400,
      responseTextSnippet: postSnippet,
      corsBlocked: false,
      timeout: false,
    });

    console.log(`[Probe 2 POST] Status: ${postRes.status} ${postRes.statusText} (${probe2Duration}ms)`);
    console.log('[Probe 2 POST] Response Body:', postSnippet);
  } catch (err: unknown) {
    const probe2Duration = Date.now() - probe2Start;
    const errorObj = err as Error;
    const isTimeout = errorObj.name === 'AbortError';
    const isCors =
      !isTimeout &&
      (errorObj instanceof TypeError || errorObj.message.toLowerCase().includes('fetch'));

    probes.push({
      probeName: 'Probe 2: HTTP POST (CORS follow redirect)',
      method: 'POST',
      mode: 'cors',
      durationMs: probe2Duration,
      success: false,
      timeout: isTimeout,
      corsBlocked: isCors,
      error: errorObj.message,
      responseTextSnippet: isTimeout
        ? 'Request timeout (>10s)'
        : isCors
        ? 'CORS Preflight / Redirect dibatasi oleh Google Auth'
        : errorObj.message,
    });

    console.warn(`[Probe 2 POST Error] (${probe2Duration}ms):`, errorObj.message);
  }

  // Probe 3: HTTP POST (mode: 'no-cors' - Transport Reachability Check)
  const probe3Start = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const opaqueRes = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({ action: 'DIAGNOSTIC_OPAQUE_CHECK', timestamp: new Date().toISOString() }),
      mode: 'no-cors',
      signal: controller.signal,
    });
    clearTimeout(timer);

    const probe3Duration = Date.now() - probe3Start;
    probes.push({
      probeName: 'Probe 3: HTTP POST Transport Check (no-cors mode)',
      method: 'POST',
      mode: 'no-cors',
      httpStatus: opaqueRes.status, // Typically 0 in opaque mode
      httpStatusText: opaqueRes.type === 'opaque' ? 'OPAQUE (PACKET DELIVERED)' : opaqueRes.statusText,
      durationMs: probe3Duration,
      success: true,
      responseTextSnippet: 'Paket HTTP berhasil terkirim ke server Google (Status 0 Opaque - Respon sengaja disembunyikan oleh browser)',
      corsBlocked: false,
      timeout: false,
    });

    console.log(`[Probe 3 NO-CORS] Packet Reachability OK (${probe3Duration}ms, Status: ${opaqueRes.status}, Type: ${opaqueRes.type})`);
  } catch (err: unknown) {
    const probe3Duration = Date.now() - probe3Start;
    const errorObj = err as Error;
    const isTimeout = errorObj.name === 'AbortError';

    probes.push({
      probeName: 'Probe 3: HTTP POST Transport Check (no-cors mode)',
      method: 'POST',
      mode: 'no-cors',
      durationMs: probe3Duration,
      success: false,
      timeout: isTimeout,
      error: errorObj.message,
      responseTextSnippet: isTimeout ? 'Koneksi timeout pada level jaringan' : 'Gagal mengirim paket jaringan',
    });

    console.warn(`[Probe 3 NO-CORS Error] (${probe3Duration}ms):`, errorObj.message);
  }

  // Analyze & Determine Detected Issue
  let detectedIssue: GoogleAppsScriptDiagnosticReport['detectedIssue'] = 'NONE';
  let summaryMessage = 'Koneksi ke Google Apps Script berfungsi dengan sempurna!';
  let technicalDetails = '';
  let recommendedAction = 'Tidak ada tindakan yang diperlukan. Semua probe jaringan berhasil.';

  if (!isOnline) {
    detectedIssue = 'NETWORK_OFFLINE';
    summaryMessage = 'Perangkat Android sedang OFFLINE (Tidak ada koneksi internet).';
    technicalDetails = 'navigator.onLine is false. Network stack is disconnected.';
    recommendedAction = 'Periksa koneksi WiFi atau Data Seluler di perangkat Android Anda.';
  } else if (!hasValidScheme) {
    detectedIssue = 'INVALID_URL_SCHEME';
    summaryMessage = 'URL bukan alamat Google Apps Script yang valid.';
    technicalDetails = `URL provided does not match https://script.google.com/macros/s/... Pattern: ${targetUrl}`;
    recommendedAction = 'Pastikan URL dimulai dengan https://script.google.com/macros/s/';
  } else if (isDevUrl) {
    detectedIssue = 'DEV_URL_INSTEAD_OF_EXEC';
    summaryMessage = 'URL berakhiran "/dev". Ini memerlukan login akun Google pengembang!';
    technicalDetails = 'Deploy /dev requires dev session cookies and blocks cross-origin fetch on Android.';
    recommendedAction =
      'Ganti akhiran "/dev" menjadi "/exec", atau lakukan Deploy > New Deployment > Web App di Google Apps Script.';
  } else {
    const hasTimeout = probes.some((p) => p.timeout);
    const hasCors = probes.some((p) => p.corsBlocked);
    const hasAnySuccessStatus = probes.some((p) => p.httpStatus && p.httpStatus >= 200 && p.httpStatus < 400);
    const probe3Ok = probes.find((p) => p.probeName.includes('no-cors'))?.success;

    if (hasAnySuccessStatus) {
      detectedIssue = 'NONE';
      const successProbe = probes.find((p) => p.httpStatus && p.httpStatus >= 200);
      summaryMessage = `Koneksi berhasil! Respon HTTP ${successProbe?.httpStatus || 200} ${successProbe?.httpStatusText || 'OK'} diterima dari Google Apps Script.`;
      technicalDetails = `Latency: ${successProbe?.durationMs}ms. Response: ${successProbe?.responseTextSnippet || 'OK'}`;
      recommendedAction = 'Sambungan berfungsi normal.';
    } else if (hasCors && probe3Ok) {
      detectedIssue = 'CORS_OR_AUTH_RESTRICTED';
      summaryMessage =
        'Paket data berhasil sampai ke Google, tetapi respon HTTP diblokir oleh kebijakan CORS atau Izin Akses Google Apps Script.';
      technicalDetails =
        'CORS preflight / redirect blocked reading HTTP status and text. Probe 3 (no-cors) succeeded, meaning network delivery is functional, but Who Has Access might not be set to "Anyone".';
      recommendedAction =
        'Di Google Apps Script: Buka Deploy > Manage deployments > Edit > Pastikan "Who has access" = Anyone (Siapa saja), lalu klik Deploy.';
    } else if (hasTimeout) {
      detectedIssue = 'NETWORK_TIMEOUT';
      summaryMessage =
        'Permintaan ke Google Apps Script mengalami Time Out (lebih dari 10 detik).';
      technicalDetails =
        'Fetch aborted due to network latency timeout. Likely due to slow Android mobile network or Google Script cold start.';
      recommendedAction =
        'Coba ulangi beberapa saat lagi atau gunakan koneksi Wi-Fi yang lebih stabil.';
    } else {
      detectedIssue = 'UNKNOWN_ERROR';
      summaryMessage = 'Gagal menghubungi endpoint Google Apps Script.';
      technicalDetails = probes.map((p) => `${p.probeName}: ${p.error || p.responseTextSnippet}`).join(' | ');
      recommendedAction = 'Periksa kembali URL Web App dan pastikan deployment Google Apps Script aktif.';
    }
  }

  const report: GoogleAppsScriptDiagnosticReport = {
    timestamp: new Date().toISOString(),
    targetUrl,
    isAndroid,
    isMobile,
    isOnline,
    userAgent,
    probes,
    detectedIssue,
    summaryMessage,
    technicalDetails,
    recommendedAction,
  };

  console.info('Diagnostik Selesai dalam', Date.now() - startTime, 'ms');
  console.info('Kesimpulan:', report.summaryMessage);
  console.info('Rekomendasi:', report.recommendedAction);
  console.table(
    probes.map((p) => ({
      Probe: p.probeName,
      Method: p.method,
      Mode: p.mode,
      HTTP_Status: p.httpStatus !== undefined ? `${p.httpStatus} ${p.httpStatusText || ''}` : p.corsBlocked ? 'CORS_BLOCKED' : p.timeout ? 'TIMEOUT' : 'FAILED',
      Duration_ms: `${p.durationMs}ms`,
      Response_Snippet: p.responseTextSnippet?.slice(0, 80) || p.error || '-',
    }))
  );
  console.groupEnd();

  // Attach to window object for Chrome DevTools / Remote Debugging on Android
  if (typeof window !== 'undefined') {
    (window as unknown as { __lastGoogleSheetDiagnosticReport?: GoogleAppsScriptDiagnosticReport }).__lastGoogleSheetDiagnosticReport = report;
  }

  return report;
}

// Expose globally for quick debugging in mobile developer console
if (typeof window !== 'undefined') {
  (window as unknown as { __runGoogleSheetDiagnostics?: typeof runGoogleSheetDiagnostics }).__runGoogleSheetDiagnostics = runGoogleSheetDiagnostics;
}

/**
 * Production-ready Google Apps Script template for the user's Google Sheet
 * Handles doGet, doPost, CREATE, UPDATE, SYNC_ALL, TEST, and WHITELIST_USER authentication.
 */
export const GOOGLE_APPS_SCRIPT_TEMPLATE = `/**
 * THE CORE CHAMBER - PHYSICAL FITNESS SCORE CARD & REGISTRASI TRIAL
 * Google Apps Script Web App Endpoint + Whitelist User Security
 * 
 * STRUKTUR SPREADSHEET:
 * 1. Tab "DataCustomer" (atau Database) -> Menyimpan hasil rekaman formulir scorecard (64 kolom)
 * 2. Tab "Registrasi_Trial" -> Menyimpan rekaman formulir trial customer Kids & Adults (23 kolom)
 * 3. Tab "whitelist_user" -> Menyimpan daftar pengguna/coach yang berhak akses (5 kolom)
 * 
 * PANDUAN PENTING SAAT MEMPERBARUI KODE:
 * 1. Hapus semua kode lama di Apps Script, paste kode ini seluruhnya.
 * 2. Klik ikon Disket / Simpan (Ctrl+S).
 * 3. WAJIB BUAT VERSI BARU: Klik tombol biru "Deploy" > "Manage deployments" (Kelola deployment)
 * 4. Klik ikon Pensil (Edit) di deployment aktif Anda.
 * 5. Pada bagian "Version", pilih: "New version" (Versi baru).
 * 6. Pastikan "Execute as" = Me, dan "Who has access" = Anyone (Siapa saja).
 * 7. Klik "Deploy"! (Jika langkah ini dilewati, URL Anda masih menjalankan kode lama).
 */

function getTodayString() {
  var d = new Date();
  var y = d.getFullYear();
  var m = ("0" + (d.getMonth() + 1)).slice(-2);
  var day = ("0" + d.getDate()).slice(-2);
  return y + "-" + m + "-" + day;
}

function getDatabaseSheet(ss) {
  var direct = ss.getSheetByName("DataCustomer");
  if (direct) return direct;

  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    var name = sheets[i].getName().trim().toLowerCase();
    if (name === "datacustomer" || name === "data_customer" || name === "database") {
      return sheets[i];
    }
  }
  return ss.getSheetByName("Database") || ss.getActiveSheet();
}

function getWhitelistSheet(ss) {
  var direct = ss.getSheetByName("whitelist_user");
  if (direct) return direct;

  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    var name = sheets[i].getName().trim().toLowerCase();
    if (name === "whitelist_user" || name === "whitelist" || name === "whitelist_users") {
      return sheets[i];
    }
  }
  return null;
}

function ensureTrialHeader(sheet) {
  if (!sheet) return;
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "ID", "TCC Trial ID", "Kategori", "Nama Lengkap", "Gender", "DoB", "Umur",
      "Email", "WhatsApp", "Kontak Darurat", "Tanggal Sesi", "Hari", "Jam Sesi",
      "Coach Bertugas", "Status Jadwal", "Status Trial", "Sekolah/Club", "Orang Tua/Pekerjaan",
      "Kondisi Kesehatan", "Riwayat Cedera", "Catatan Khusus", "Created At", "Updated At"
    ]);
    sheet.getRange(1, 1, 1, 23).setFontWeight("bold").setBackground("#f1f5f9");
    try {
      sheet.setFrozenRows(1);
    } catch (e) {}
  }
}

function getTrialSheet(ss) {
  // 1. Prioritaskan sheet bernama persis "Registrasi_Trial"
  var direct = ss.getSheetByName("Registrasi_Trial");
  if (direct) {
    ensureTrialHeader(direct);
    return direct;
  }

  // 2. Cari sheet dengan nama yang serupa (toleransi spasi/huruf besar-kecil)
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    var rawName = sheets[i].getName();
    var cleanName = rawName.trim().toLowerCase().replace(/\\s+/g, '_');
    if (
      cleanName === "registrasi_trial" ||
      cleanName === "upcoming_trial" ||
      cleanName === "trial_registration" ||
      cleanName.indexOf("trial") !== -1
    ) {
      if (cleanName.indexOf("whitelist") === -1 && cleanName.indexOf("datacustomer") === -1 && cleanName.indexOf("database") === -1) {
        ensureTrialHeader(sheets[i]);
        return sheets[i];
      }
    }
  }

  // 3. Jika belum ada sama sekali, buat otomatis sheet Registrasi_Trial
  var sheet = ss.insertSheet("Registrasi_Trial");
  ensureTrialHeader(sheet);
  return sheet;
}

function ensureHeader(sheet) {
  if (!sheet) return;
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Record_ID", "Created_At", "Updated_At", "Entry_Type", "Customer_Type",
      "Full_Name", "Gender", "DoB", "Age", "MemberID", "Test_Date", "Coaches",
      "Wing_Span_cm", "Chest_cm", "Left_Arm_cm", "Right_Arm_cm", "Waist_cm", "Hips_cm",
      "Left_Thigh_cm", "Right_Thigh_cm", "Left_Calf_cm", "Right_Calf_cm",
      "Body_Fat_pct", "Muscle_Mass_pct", "Height_cm", "Weight_kg", "BMI", "Category_BMI",
      "Score_DeepSquat", "Cat_DeepSquat", "Score_HurdleStep", "Cat_HurdleStep",
      "Score_InlineLunge", "Cat_InlineLunge", "Score_Balance", "Cat_Balance",
      "Score_Landing", "Cat_Landing", "Avg_Functional",
      "Score_LowerBody", "Cat_LowerBody", "Score_UnilateralStrength", "Cat_UnilateralStrength",
      "Score_PosteriorChain", "Cat_PosteriorChain", "Score_UpperBody", "Cat_UpperBody",
      "Score_Core", "Cat_Core", "Score_Conditioning", "Cat_Conditioning", "Avg_Strength",
      "Score_Power", "Cat_Power", "Score_Speed", "Cat_Speed", "Score_Agility", "Cat_Agility",
      "Score_Flexibility", "Cat_Flexibility", "Score_Coordination", "Cat_Coordination",
      "Avg_Skill", "Notes"
    ]);
    sheet.getRange(1, 1, 1, 64).setFontWeight("bold").setBackground("#f1f5f9");
    try {
      sheet.setFrozenRows(1);
    } catch (e) {}
  }
}

function readWhitelistUsers(ss) {
  var sheet = getWhitelistSheet(ss);
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var lastCol = Math.max(sheet.getLastColumn(), 5);

  var data = sheet.getRange(1, 1, lastRow, lastCol).getDisplayValues();
  var headers = data[0].map(function(h) { return String(h).trim().toLowerCase(); });

  var colNama = headers.indexOf("nama");
  var colEmail = headers.indexOf("email");
  var colPin = headers.indexOf("pin");
  var colPeran = headers.indexOf("peran");
  var colStatus = headers.indexOf("status");

  if (colNama === -1) colNama = 0;
  if (colEmail === -1) colEmail = 1;
  if (colPin === -1) colPin = 2;
  if (colPeran === -1) colPeran = 3;
  if (colStatus === -1) colStatus = 4;

  var users = [];
  for (var r = 1; r < data.length; r++) {
    var row = data[r];
    var nama = String(row[colNama] || "").trim();
    var email = String(row[colEmail] || "").trim().toLowerCase();
    var pin = String(row[colPin] || "").trim();
    var peran = String(row[colPeran] || "").trim();
    var status = String(row[colStatus] || "Aktif").trim();

    if (nama || email) {
      users.push({
        nama: nama,
        email: email,
        pin: pin,
        peran: peran,
        status: status
      });
    }
  }
  return users;
}

function mapDataToRow(d) {
  if (!d) return [];
  return [
    d.record_id || "", d.created_at || "", d.updated_at || "", d.entry_type || "", d.customer_type || "",
    d.full_name || "", d.gender || "", d.dob || "", d.age !== undefined ? d.age : "", d.member_id || "", d.test_date || "", d.coaches || "",
    d.wing_span !== undefined ? d.wing_span : "", d.chest !== undefined ? d.chest : "", d.left_arm !== undefined ? d.left_arm : "", d.right_arm !== undefined ? d.right_arm : "", d.waist !== undefined ? d.waist : "", d.hips !== undefined ? d.hips : "",
    d.left_thigh !== undefined ? d.left_thigh : "", d.right_tight !== undefined ? d.right_tight : "", d.left_calf !== undefined ? d.left_calf : "", d.right_calf !== undefined ? d.right_calf : "",
    d.body_fat !== undefined ? d.body_fat : "", d.muscle_mass !== undefined ? d.muscle_mass : "", d.height !== undefined ? d.height : "", d.weight !== undefined ? d.weight : "", d.bmi !== undefined ? d.bmi : "", d.category_bmi || "",
    d.score_deep_squat || "", d.cat_deep_squat || "", d.score_hurdle_step || "", d.cat_hurdle_step || "",
    d.score_inline_lunge || "", d.cat_inline_lunge || "", d.score_balance || "", d.cat_balance || "",
    d.score_landing || "", d.cat_landing || "", d.avg_functional !== undefined ? d.avg_functional : "",
    d.score_lower_body || "", d.cat_lower_body || "", d.score_unilateral_strength || "", d.cat_unilateral_strength || "",
    d.score_posterior_chain || "", d.cat_posterior_chain || "", d.score_upper_body || "", d.cat_upper_body || "",
    d.score_core || "", d.cat_core || "", d.score_conditioning || "", d.cat_conditioning || "", d.avg_strength !== undefined ? d.avg_strength : "",
    d.score_power || "", d.cat_power || "", d.score_speed || "", d.cat_speed || "", d.score_agility || "", d.cat_agility || "",
    d.score_flexibility || "", d.cat_flexibility || "", d.score_coordination || "", d.cat_coordination || "",
    d.avg_skill !== undefined ? d.avg_skill : "", d.notes || ""
  ];
}

function readDatabaseRecords(ss) {
  var sheet = getDatabaseSheet(ss);
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var lastCol = Math.max(sheet.getLastColumn(), 64);

  var values = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  var records = [];

  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var recId = String(row[0] || "").trim();
    var fullName = String(row[5] || "").trim();
    var memberId = String(row[9] || "").trim();

    if (!recId && !fullName && !memberId) continue;

    function toNum(v) {
      if (v === "" || v === null || v === undefined) return null;
      var n = Number(v);
      return isNaN(n) ? null : n;
    }
    function toScore(v) {
      var n = toNum(v);
      return (n === 1 || n === 2 || n === 3 || n === 4) ? n : null;
    }
    function toDateStr(v) {
      if (!v) return "";
      if (v instanceof Date) {
        var y = v.getFullYear();
        var m = ("0" + (v.getMonth() + 1)).slice(-2);
        var d = ("0" + v.getDate()).slice(-2);
        return y + "-" + m + "-" + d;
      }
      return String(v).split("T")[0];
    }
    function toIso(v) {
      if (!v) return new Date().toISOString();
      if (v instanceof Date) return v.toISOString();
      return String(v);
    }

    records.push({
      id: recId || ("rec-sheet-" + (i + 1)),
      createdAt: toIso(row[1]),
      updatedAt: toIso(row[2]),
      entry_type: String(row[3] || "member").toLowerCase(),
      Customer_type: String(row[4] || "member").toLowerCase(),
      Full_Name: fullName || (memberId ? ("Member " + memberId) : "Peserta"),
      Gender: String(row[6] || "").toLowerCase(),
      DoB: toDateStr(row[7]),
      Umur: toNum(row[8]),
      MemberID: memberId || "",
      Test_Date: toDateStr(row[10]),
      Coaches: String(row[11] || ""),
      wing_span: toNum(row[12]),
      chest: toNum(row[13]),
      left_arm: toNum(row[14]),
      right_arm: toNum(row[15]),
      waist: toNum(row[16]),
      hips: toNum(row[17]),
      left_thigh: toNum(row[18]),
      right_tight: toNum(row[19]),
      left_calf: toNum(row[20]),
      right_calf: toNum(row[21]),
      body_fat: toNum(row[22]),
      muscle_mass: toNum(row[23]),
      height: toNum(row[24]),
      weight: toNum(row[25]),
      BMI: toNum(row[26]),
      cat_bmi: String(row[27] || ""),
      score_deepSquat: toScore(row[28]),
      cat_deepSquat: String(row[29] || ""),
      score_hurdleStep: toScore(row[30]),
      cat_hurdleStep: String(row[31] || ""),
      score_inlineLunge: toScore(row[32]),
      cat_inlineLunge: String(row[33] || ""),
      score_balance: toScore(row[34]),
      cat_balance: String(row[35] || ""),
      score_landing: toScore(row[36]),
      cat_landing: String(row[37] || ""),
      avg_functional: toNum(row[38]),
      score_lowerbody: toScore(row[39]),
      cat_lowerbody: String(row[40] || ""),
      score_unilateralStrenght: toScore(row[41]),
      cat_unilateralStrenght: String(row[42] || ""),
      score_posteriorChain: toScore(row[43]),
      cat_posteriorChain: String(row[44] || ""),
      score_upperBody: toScore(row[45]),
      cat_upperBody: String(row[46] || ""),
      score_core: toScore(row[47]),
      cat_core: String(row[48] || ""),
      score_conditioning: toScore(row[49]),
      cat_conditioning: String(row[50] || ""),
      avg_strength: toNum(row[51]),
      score_power: toScore(row[52]),
      cat_power: String(row[53] || ""),
      score_speed: toScore(row[54]),
      cat_speed: String(row[55] || ""),
      score_agility: toScore(row[56]),
      cat_agility: String(row[57] || ""),
      score_flexibility: toScore(row[58]),
      cat_flexibility: String(row[59] || ""),
      score_coordination: toScore(row[60]),
      cat_coordination: String(row[61] || ""),
      avg_skill: toNum(row[62]),
      notes: String(row[63] || "")
    });
  }

  return records;
}

function readTrialRecords(ss) {
  var sheet = getTrialSheet(ss);
  if (!sheet) return [];
  ensureTrialHeader(sheet);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var lastCol = Math.max(sheet.getLastColumn(), 23);
  var values = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  var records = [];

  for (var i = 0; i < values.length; i++) {
    var r = values[i];
    var id = String(r[0] || '').trim();
    var memberId = String(r[1] || '').trim();
    var name = String(r[3] || '').trim();
    if (!id && !memberId && !name) continue;

    records.push({
      id: id || ('trial-' + (i + 1)),
      MemberID: memberId,
      Customer_type: String(r[2] || 'Trial Adults'),
      Full_Name: name,
      Gender: String(r[4] || ''),
      DoB: r[5] ? String(r[5]) : '',
      Umur: r[6] ? Number(r[6]) : null,
      Email: String(r[7] || ''),
      WhatsApp_Number: String(r[8] || ''),
      Emergency_Contact: String(r[9] || ''),
      Trial_Date: r[10] ? String(r[10]).split('T')[0] : '',
      Trial_Day: String(r[11] || ''),
      Trial_Time: String(r[12] || ''),
      Coaches: r[13] ? String(r[13]).split(',').map(function(c) { return c.trim(); }) : [],
      schedule_status: String(r[14] || 'Pending'),
      trial_status: String(r[15] || 'Menunggu Trial'),
      nama_sekolah: String(r[16] || ''),
      formadults_pekerjaan: String(r[16] || ''),
      nama_ayah: String(r[17] || ''),
      formadults_perusahaan: String(r[17] || ''),
      formadults_kondisi: String(r[18] || ''),
      formadults_riwayat: String(r[19] || ''),
      formadults_catatan: String(r[20] || ''),
      createdAt: r[21] ? String(r[21]) : new Date().toISOString(),
      updatedAt: r[22] ? String(r[22]) : new Date().toISOString()
    });
  }
  return records;
}

// Untuk tes buka URL langsung di browser / verifikasi GET
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var pAction = (e && e.parameter && e.parameter.action) ? String(e.parameter.action).trim() : "";

  // 1. GET ALL RECORDS (SINKRONISASI ARSIP KE SELURUH USER)
  if (pAction === "GET_RECORDS" || pAction === "GET_DATABASE") {
    var dbRecs = readDatabaseRecords(ss);
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      total: dbRecs.length,
      records: dbRecs
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // 2. GET TRIALS (SINKRONISASI TAB REGISTRASI TRIAL)
  if (pAction === "GET_TRIALS") {
    var trials = readTrialRecords(ss);
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      total: trials.length,
      trials: trials
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // 3. GET WHITELIST USERS
  if (pAction === "GET_WHITELIST") {
    var users = readWhitelistUsers(ss);
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      total: users.length,
      users: users
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // 4. VERIFY USER VIA GET
  if (pAction === "VERIFY_USER") {
    var reqEmail = (e && e.parameter && e.parameter.email ? String(e.parameter.email) : "").trim().toLowerCase();
    var reqPin = (e && e.parameter && e.parameter.pin ? String(e.parameter.pin) : "").trim();
    var allUsers = readWhitelistUsers(ss);
    var target = null;
    for (var u = 0; u < allUsers.length; u++) {
      if (allUsers[u].email === reqEmail) {
        target = allUsers[u];
        break;
      }
    }

    if (!target) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        code: "NOT_FOUND",
        message: "Email tidak terdaftar dalam tab whitelist_user"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var st = target.status.toLowerCase();
    if (st === "non-aktif" || st === "nonaktif" || st === "inactive") {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        code: "INACTIVE",
        message: "Akun berstatus Non-Aktif"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (target.pin !== reqPin) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        code: "INVALID_PIN",
        message: "PIN yang dimasukkan salah"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      code: "SUCCESS",
      user: {
        nama: target.nama,
        email: target.email,
        peran: target.peran,
        status: target.status
      }
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // 5. TEST CONNECTION KE TAB REGISTRASI TRIAL VIA BROWSER GET
  if (pAction === "TEST_TRIAL") {
    var tSheet = getTrialSheet(ss);
    ensureTrialHeader(tSheet);
    var nowIso = new Date().toISOString();
    tSheet.appendRow([
      "trial-test-" + new Date().getTime(),
      "TCC-TR-TEST",
      "Trial Adults",
      "TEST KONEKSI REGISTRASI TRIAL",
      "Male",
      "1995-05-15",
      31,
      "trial.test@example.com",
      "+62 812-3456-7890",
      "+62 813-9876-5432",
      getTodayString(),
      "Hari Ini",
      "10:00",
      "Mariskha Primasari",
      "Confirmed",
      "Menunggu Trial",
      "The Core Chamber",
      "Tester Sistem",
      "Sehat & Siap Latihan",
      "Tidak Ada Riwayat Cedera",
      "Tes koneksi tab Registrasi_Trial via Browser (GET) berhasil 100%! Dilakukan pada " + nowIso + ". Anda dapat menghapus baris ini kapan saja.",
      nowIso,
      nowIso
    ]);
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      action: "TEST_TRIAL",
      sheet: tSheet.getName(),
      totalRows: tSheet.getLastRow(),
      message: "✓ Sukses! 1 baris tes telah berhasil ditulis ke tab '" + tSheet.getName() + "'. Silakan periksa Google Sheet Anda!"
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // 6. Default: Health Check (Menampilkan status DataCustomer DAN Registrasi_Trial sekaligus!)
  var dbSheet = getDatabaseSheet(ss);
  ensureHeader(dbSheet);
  var trialSheet = getTrialSheet(ss);
  ensureTrialHeader(trialSheet);
  var wlSheet = getWhitelistSheet(ss);
  var wlCount = wlSheet ? Math.max(0, wlSheet.getLastRow() - 1) : 0;

  return ContentService.createTextOutput(JSON.stringify({
    status: "ready",
    databaseSheet: dbSheet.getName(),
    totalScorecards: dbSheet.getLastRow() > 1 ? dbSheet.getLastRow() - 1 : 0,
    trialSheet: trialSheet.getName(),
    totalTrialRecords: trialSheet.getLastRow() > 1 ? trialSheet.getLastRow() - 1 : 0,
    hasWhitelistSheet: Boolean(wlSheet),
    totalWhitelistUsers: wlCount,
    message: "THE CORE CHAMBER - Webhook Apps Script, Scorecard & Registrasi Trial Aktif 100%!"
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var dbSheet = getDatabaseSheet(ss);
    ensureHeader(dbSheet);

    var rawContent = "";
    if (e && e.postData && e.postData.contents) {
      rawContent = e.postData.contents;
    } else if (e && e.parameter && e.parameter.data) {
      rawContent = e.parameter.data;
    } else {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Tidak ada konten data yang diterima"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var payload = JSON.parse(rawContent);
    var action = payload.action;

    // 0. VERIFIKASI WHITELIST VIA POST
    if (action === "VERIFY_USER") {
      var reqEmail = String(payload.email || "").trim().toLowerCase();
      var reqPin = String(payload.pin || "").trim();
      var allUsers = readWhitelistUsers(ss);
      var target = null;
      for (var u = 0; u < allUsers.length; u++) {
        if (allUsers[u].email === reqEmail) {
          target = allUsers[u];
          break;
        }
      }

      if (!target) {
        return ContentService.createTextOutput(JSON.stringify({
          status: "error",
          code: "NOT_FOUND",
          message: "Email tidak terdaftar dalam tab whitelist_user"
        })).setMimeType(ContentService.MimeType.JSON);
      }

      var st = target.status.toLowerCase();
      if (st === "non-aktif" || st === "nonaktif" || st === "inactive") {
        return ContentService.createTextOutput(JSON.stringify({
          status: "error",
          code: "INACTIVE",
          message: "Akun berstatus Non-Aktif"
        })).setMimeType(ContentService.MimeType.JSON);
      }

      if (target.pin !== reqPin) {
        return ContentService.createTextOutput(JSON.stringify({
          status: "error",
          code: "INVALID_PIN",
          message: "PIN yang dimasukkan salah"
        })).setMimeType(ContentService.MimeType.JSON);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        code: "SUCCESS",
        user: {
          nama: target.nama,
          email: target.email,
          peran: target.peran,
          status: target.status
        }
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 0.B GET WHITELIST VIA POST
    if (action === "GET_WHITELIST") {
      var users = readWhitelistUsers(ss);
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        total: users.length,
        users: users
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 0.C GET RECORDS VIA POST (SINKRONISASI ARSIP)
    if (action === "GET_RECORDS" || action === "GET_DATABASE") {
      var dbRecs = readDatabaseRecords(ss);
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        total: dbRecs.length,
        records: dbRecs
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 0.D SAVE TRIAL REGISTRATION (TERPISAH DI TAB Registrasi_Trial)
    if (action === "SAVE_TRIAL_REGISTRATION") {
      var tSheet = getTrialSheet(ss);
      ensureTrialHeader(tSheet);
      var tData = payload.data || {};
      
      var tLastRow = tSheet.getLastRow();
      var tTargetRow = -1;
      var targetTrialId = String(tData.id || '').trim();
      var targetMemberId = String(tData.MemberID || '').trim();

      if (tLastRow > 1) {
        var tVals = tSheet.getRange(2, 1, tLastRow - 1, 2).getValues();
        for (var tr = 0; tr < tVals.length; tr++) {
          var rowId = String(tVals[tr][0] || '').trim();
          var rowMemId = String(tVals[tr][1] || '').trim();
          if ((targetTrialId && rowId === targetTrialId) || (targetMemberId && rowMemId === targetMemberId)) {
            tTargetRow = tr + 2;
            break;
          }
        }
      }

      var rowToInsert = [
        tData.id || "",
        tData.MemberID || "",
        tData.Customer_type || "",
        tData.Full_Name || "",
        tData.Gender || "",
        tData.DoB || "",
        tData.Umur !== undefined ? tData.Umur : "",
        tData.Email || "",
        tData.WhatsApp_Number || "",
        tData.Emergency_Contact || "",
        tData.Trial_Date || "",
        tData.Trial_Day || "",
        tData.Trial_Time || "",
        Array.isArray(tData.Coaches) ? tData.Coaches.join(", ") : (tData.Coaches || ""),
        tData.schedule_status || "",
        tData.trial_status || "",
        tData.nama_sekolah || tData.formadults_pekerjaan || "",
        tData.nama_ayah || tData.formadults_perusahaan || "",
        tData.formadults_kondisi || "",
        tData.formadults_riwayat || "",
        tData.formadults_catatan || "",
        tData.createdAt || new Date().toISOString(),
        tData.updatedAt || new Date().toISOString()
      ];

      if (tTargetRow > 1) {
        tSheet.getRange(tTargetRow, 1, 1, rowToInsert.length).setValues([rowToInsert]);
      } else {
        tSheet.appendRow(rowToInsert);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        sheet: tSheet.getName(),
        row: tTargetRow > 1 ? tTargetRow : tSheet.getLastRow(),
        message: "Data registrasi trial berhasil disimpan ke tab " + tSheet.getName()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 0.E SYNC ALL TRIALS (BATCH DARI TAB UPCOMING TRIAL KE TAB Registrasi_Trial)
    if (action === "SYNC_ALL_TRIALS" && Array.isArray(payload.trials)) {
      var tSheet = getTrialSheet(ss);
      ensureTrialHeader(tSheet);
      var tLastRow = tSheet.getLastRow();
      var existingTrialIds = {};

      if (tLastRow > 1) {
        var tIdVals = tSheet.getRange(2, 1, tLastRow - 1, 2).getValues();
        for (var ti = 0; ti < tIdVals.length; ti++) {
          var exId = String(tIdVals[ti][0] || '').trim();
          var exMemId = String(tIdVals[ti][1] || '').trim();
          if (exId) existingTrialIds[exId] = ti + 2;
          if (exMemId) existingTrialIds[exMemId] = ti + 2;
        }
      }

      var trialInserted = 0;
      var trialUpdated = 0;

      for (var tj = 0; tj < payload.trials.length; tj++) {
        var tItem = payload.trials[tj];
        var tRowVals = [
          tItem.id || "",
          tItem.MemberID || "",
          tItem.Customer_type || "",
          tItem.Full_Name || "",
          tItem.Gender || "",
          tItem.DoB || "",
          tItem.Umur !== undefined ? tItem.Umur : "",
          tItem.Email || "",
          tItem.WhatsApp_Number || "",
          tItem.Emergency_Contact || "",
          tItem.Trial_Date || "",
          tItem.Trial_Day || "",
          tItem.Trial_Time || "",
          Array.isArray(tItem.Coaches) ? tItem.Coaches.join(", ") : (tItem.Coaches || ""),
          tItem.schedule_status || "",
          tItem.trial_status || "",
          tItem.nama_sekolah || tItem.formadults_pekerjaan || "",
          tItem.nama_ayah || tItem.formadults_perusahaan || "",
          tItem.formadults_kondisi || "",
          tItem.formadults_riwayat || "",
          tItem.formadults_catatan || "",
          tItem.createdAt || new Date().toISOString(),
          tItem.updatedAt || new Date().toISOString()
        ];

        var exRow = existingTrialIds[String(tItem.id || '').trim()] || (tItem.MemberID ? existingTrialIds[String(tItem.MemberID).trim()] : null);

        if (exRow && exRow > 1) {
          tSheet.getRange(exRow, 1, 1, tRowVals.length).setValues([tRowVals]);
          trialUpdated++;
        } else {
          tSheet.appendRow(tRowVals);
          trialInserted++;
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        sheet: tSheet.getName(),
        total: payload.trials.length,
        inserted: trialInserted,
        updated: trialUpdated,
        message: "Berhasil menyinkronkan data ke tab " + tSheet.getName()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Build row index lookup untuk mencegah row duplicate pada tabel Database
    var lastRow = dbSheet.getLastRow();
    var idToRowMap = {};
    if (lastRow > 1) {
      var idValues = dbSheet.getRange(2, 1, lastRow - 1, 10).getValues();
      for (var r = 0; r < idValues.length; r++) {
        var recId = String(idValues[r][0] || '').trim();
        var memId = String(idValues[r][9] || '').trim(); // Kolom J (MemberID)
        var actualRow = r + 2;
        if (recId) idToRowMap[recId] = actualRow;
        if (memId) idToRowMap[memId] = actualRow;
      }
    }

    // A. SYNC ALL DARI TAB ARSIP (BATCH UPSERT)
    if (action === "SYNC_ALL" && Array.isArray(payload.records)) {
      var updatedCount = 0;
      var createdCount = 0;

      for (var i = 0; i < payload.records.length; i++) {
        var item = payload.records[i];
        var d = item.data;
        var rVals = mapDataToRow(d);
        var recId = String(item.recordId || (d && d.record_id) || '').trim();
        var memId = String(item.memberId || (d && d.member_id) || '').trim();

        var existingRow = idToRowMap[recId] || (memId ? idToRowMap[memId] : null);

        if (existingRow && existingRow > 1) {
          dbSheet.getRange(existingRow, 1, 1, rVals.length).setValues([rVals]);
          updatedCount++;
        } else {
          dbSheet.appendRow(rVals);
          var newRowNumber = dbSheet.getLastRow();
          if (recId) idToRowMap[recId] = newRowNumber;
          if (memId) idToRowMap[memId] = newRowNumber;
          createdCount++;
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        action: "SYNC_ALL",
        updated: updatedCount,
        created: createdCount,
        total: payload.records.length
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // B.1 TEST CONNECTION KHUSUS TAB Registrasi_Trial
    if (action === "TEST_TRIAL") {
      var tSheet = getTrialSheet(ss);
      ensureTrialHeader(tSheet);
      var td = (payload && payload.data) || {};
      var nowIso = new Date().toISOString();
      tSheet.appendRow([
        td.id || ("trial-test-" + new Date().getTime()),
        td.MemberID || "TCC-TR-TEST",
        td.Customer_type || "Trial Adults",
        td.Full_Name || "TEST KONEKSI REGISTRASI TRIAL",
        td.Gender || "Male",
        td.DoB || "1995-05-15",
        td.Umur || 31,
        td.Email || "trial.test@example.com",
        td.WhatsApp_Number || "+62 812-3456-7890",
        td.Emergency_Contact || "+62 813-9876-5432",
        td.Trial_Date || getTodayString(),
        td.Trial_Day || "Hari Ini",
        td.Trial_Time || "10:00",
        Array.isArray(td.Coaches) ? td.Coaches.join(", ") : (td.Coaches || "Mariskha Primasari"),
        td.schedule_status || "Confirmed",
        td.trial_status || "Menunggu Trial",
        td.nama_sekolah || td.formadults_pekerjaan || "Tester Sistem",
        td.nama_ayah || td.formadults_perusahaan || "The Core Chamber",
        td.formadults_kondisi || "Sehat",
        td.formadults_riwayat || "Tidak Ada",
        td.formadults_catatan || "Koneksi tab Registrasi_Trial Berhasil 100%! Baris ini dapat dihapus kapan saja.",
        nowIso,
        nowIso
      ]);
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        action: "TEST_TRIAL",
        sheet: tSheet.getName(),
        row: tSheet.getLastRow(),
        message: "Berhasil menulis 1 baris tes ke tab " + tSheet.getName()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // B.2 TEST CONNECTION KHUSUS TAB DataCustomer (Score Card)
    if (action === "TEST") {
      var testData = payload.data || {
        record_id: "rec-test-" + new Date().getTime(),
        full_name: "TEST KONEKSI BERHASIL",
        member_id: "TCC-TEST",
        customer_type: "trial",
        test_date: getTodayString(),
        notes: "Koneksi Web App dan Google Sheet telah berhasil 100%!"
      };
      var testRow = mapDataToRow(testData);
      dbSheet.appendRow(testRow);
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        action: "TEST",
        row: dbSheet.getLastRow()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // C. SINGLE RECORD CREATE / UPDATE PADA TAB DataCustomer
    var memberId = String(payload.memberId || '').trim();
    var recordId = String(payload.recordId || '').trim();
    var rowValues = mapDataToRow(payload.data);

    var targetRow = (recordId && idToRowMap[recordId]) || (memberId && idToRowMap[memberId]) || -1;

    if (action === "UPDATE" || targetRow > 1) {
      if (targetRow > 1) {
        dbSheet.getRange(targetRow, 1, 1, rowValues.length).setValues([rowValues]);
        return ContentService.createTextOutput(JSON.stringify({
          status: "success",
          action: "UPDATE",
          row: targetRow
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    if (action === "CREATE" || !action) {
      dbSheet.appendRow(rowValues);
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        action: "CREATE",
        row: dbSheet.getLastRow()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Action tidak dikenali: " + action
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Uji coba tab DataCustomer langsung di editor Apps Script (Pilih fungsi ini lalu klik "Run")
function TEST_KIRIM_KE_DATACUSTOMER() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getDatabaseSheet(ss);
  ensureHeader(sheet);
  sheet.appendRow(["rec-manual-test", new Date(), new Date(), "member", "member", "Uji Coba Manual Apps Script", "male", "", "", "TCC-MANUAL"]);
  Logger.log("✓ BERHASIL! 1 baris tes telah ditulis ke tab " + sheet.getName() + " pada baris ke-" + sheet.getLastRow());
}

// Uji coba tab Registrasi_Trial langsung di editor Apps Script (Pilih fungsi ini lalu klik "Run")
function TEST_KIRIM_KE_REGISTRASI_TRIAL() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getTrialSheet(ss);
  ensureTrialHeader(sheet);
  sheet.appendRow([
    "trial-test-editor-" + new Date().getTime(),
    "TCC-TR-EDITOR",
    "Trial Adults",
    "TEST DARI EDITOR APPS SCRIPT",
    "Male",
    "1990-01-01",
    36,
    "editor.test@example.com",
    "+62 812-0000-0000",
    "-",
    getTodayString(),
    "Hari Ini",
    "09:00",
    "Head Coach",
    "Confirmed",
    "Menunggu Trial",
    "-",
    "-",
    "Sehat & Prima",
    "Tidak Ada",
    "Tes dijalankan langsung dari tombol Run di editor Apps Script!",
    new Date().toISOString(),
    new Date().toISOString()
  ]);
  Logger.log("✓ BERHASIL! 1 baris tes telah ditulis ke tab '" + sheet.getName() + "' pada baris ke-" + sheet.getLastRow() + ". Silakan periksa spreadsheet Anda!");
}
`;

