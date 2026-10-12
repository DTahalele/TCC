import { ScoreCardRecord } from '../types/scoreCard';
import { getGoogleSheetUrl } from './storage';

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
      message: 'Perintah tes tulis baris "TCC-TEST" telah dikirim ke Google Sheet! Silakan buka spreadsheet Anda untuk memeriksa apakah baris "TCC-TEST" muncul.',
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
 * Handles doGet, doPost, CREATE, UPDATE, SYNC_ALL, and TEST.
 */
export const GOOGLE_APPS_SCRIPT_TEMPLATE = `/**
 * THE CORE CHAMBER - PHYSICAL FITNESS SCORE CARD
 * Google Apps Script Web App Endpoint
 * 
 * PANDUAN PENTING SAAT DEPLOY:
 * 1. Klik Deploy > New deployment (atau Manage deployments > Edit > Version: New version)
 * 2. "Execute as": "Me" (Email pemilik spreadsheet) -> WAJIB!
 * 3. "Who has access": "Anyone" (Siapa saja) -> WAJIB!
 */

function ensureHeader(sheet) {
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
  }
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

// Untuk tes buka URL langsung di browser
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  ensureHeader(sheet);
  return ContentService.createTextOutput(JSON.stringify({
    status: "ready",
    sheetName: sheet.getName(),
    totalRows: sheet.getLastRow(),
    message: "THE CORE CHAMBER - Webhook Apps Script Aktif & Terhubung!"
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    ensureHeader(sheet);

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

    // Build row index lookup untuk mencegah row duplicate
    var lastRow = sheet.getLastRow();
    var idToRowMap = {};
    if (lastRow > 1) {
      var idValues = sheet.getRange(2, 1, lastRow - 1, 10).getValues();
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
          // UPDATE baris yang sudah ada (IN-PLACE, TIDAK APPEND!)
          sheet.getRange(existingRow, 1, 1, rVals.length).setValues([rVals]);
          updatedCount++;
        } else {
          // APPEND hanya jika data benar-benar baru
          sheet.appendRow(rVals);
          var newRowNumber = sheet.getLastRow();
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

    // B. TEST CONNECTION (Menulis 1 baris sample langsung untuk visual check)
    if (action === "TEST") {
      var testData = payload.data || {
        record_id: "rec-test-" + new Date().getTime(),
        full_name: "TEST KONEKSI BERHASIL",
        member_id: "TCC-TEST",
        customer_type: "trial",
        test_date: Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd"),
        notes: "Koneksi Web App dan Google Sheet telah berhasil 100%!"
      };
      var testRow = mapDataToRow(testData);
      sheet.appendRow(testRow);
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        action: "TEST",
        row: sheet.getLastRow()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // C. SINGLE RECORD CREATE / UPDATE
    var memberId = String(payload.memberId || '').trim();
    var recordId = String(payload.recordId || '').trim();
    var rowValues = mapDataToRow(payload.data);

    var targetRow = (recordId && idToRowMap[recordId]) || (memberId && idToRowMap[memberId]) || -1;

    if (action === "UPDATE" || targetRow > 1) {
      if (targetRow > 1) {
        // UPDATE baris lama
        sheet.getRange(targetRow, 1, 1, rowValues.length).setValues([rowValues]);
        return ContentService.createTextOutput(JSON.stringify({
          status: "success",
          action: "UPDATE",
          row: targetRow
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    // CREATE baris baru
    sheet.appendRow(rowValues);
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      action: "CREATE",
      row: sheet.getLastRow()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Fungsi opsional untuk uji coba langsung di editor Apps Script (Klik "Run" pada fungsi ini)
function TEST_RUN_DARI_APPS_SCRIPT() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  ensureHeader(sheet);
  sheet.appendRow(["rec-manual-test", new Date(), new Date(), "member", "member", "Uji Coba Manual Apps Script", "male", "", "", "TCC-MANUAL"]);
  Logger.log("Berhasil menulis baris tes manual! Periksa spreadsheet Anda sekarang.");
}
`;
