import React, { useState } from 'react';
import {
  X,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Database,
  Send,
  CheckCircle2,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  Activity,
  Terminal,
  Wifi,
} from 'lucide-react';
import { getGoogleSheetUrl, setGoogleSheetUrl, verifyAdminPassword, setAdminPassword } from '../utils/storage';
import {
  GOOGLE_APPS_SCRIPT_TEMPLATE,
  sendTestRowToGoogleSheet,
  runGoogleSheetDiagnostics,
  GoogleAppsScriptDiagnosticReport,
} from '../utils/googleSheets';

interface GoogleSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUrlUpdated: () => void;
  isSheetConnected?: boolean;
  hasSheetUrl?: boolean;
  onToggleConnection?: () => void;
}

export const GoogleSheetModal: React.FC<GoogleSheetModalProps> = ({
  isOpen,
  onClose,
  onUrlUpdated,
  isSheetConnected = false,
  hasSheetUrl = false,
  onToggleConnection,
}) => {
  const [url, setUrl] = useState(getGoogleSheetUrl());
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ text: string; success: boolean } | null>(null);

  // Diagnostic tool state
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);
  const [diagnosticReport, setDiagnosticReport] = useState<GoogleAppsScriptDiagnosticReport | null>(null);
  const [copiedLog, setCopiedLog] = useState(false);

  // Sync state whenever modal opens
  React.useEffect(() => {
    if (isOpen) {
      setUrl(getGoogleSheetUrl());
      setTestResult(null);
      setDiagnosticReport(null);
      setAuthError('');
      setNewPasswordInput('');
    }
  }, [isOpen]);

  // Password authorization state for saving changes
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Optional: change password accordion state
  const [showChangePass, setShowChangePass] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  if (!isOpen) return null;

  // Click Simpan Pengaturan triggers password verification
  const handleInitiateSave = () => {
    if (!url.trim()) {
      setTestResult({
        text: 'Silakan masukkan / tempelkan URL Web App Google Apps Script terlebih dahulu di kolom input di bawah.',
        success: false,
      });
      return;
    }
    const currentStoredUrl = getGoogleSheetUrl();
    // If no changes were made and url is identical, inform and close
    if (url.trim() === currentStoredUrl.trim() && !newPasswordInput.trim()) {
      setTestResult({
        text: '✓ Pengaturan URL sudah aktif dan tersimpan di perangkat ini.',
        success: true,
      });
      setTimeout(() => {
        onClose();
      }, 1000);
      return;
    }
    setAuthError('');
    setAdminPasswordInput('');
    setIsAuthModalOpen(true);
  };

  const handleConfirmAuthorizedSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyAdminPassword(adminPasswordInput)) {
      setAuthError('Password Admin salah! Otorisasi gagal.');
      return;
    }

    // Password valid -> execute save
    setGoogleSheetUrl(url);
    if (newPasswordInput.trim()) {
      setAdminPassword(newPasswordInput.trim());
    }
    onUrlUpdated();
    setIsAuthModalOpen(false);
    setTestResult({ text: '✓ Pengaturan Google Sheet berhasil diotorisasi & disimpan!', success: true });
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendTestRow = async () => {
    if (!url.trim()) {
      setTestResult({
        text: 'Silakan masukkan URL Web App Google Apps Script terlebih dahulu.',
        success: false,
      });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      setGoogleSheetUrl(url);
      onUrlUpdated();
      const res = await sendTestRowToGoogleSheet();
      setTestResult({
        text: res.message,
        success: res.success,
      });
    } catch (err) {
      setTestResult({
        text: `Error saat pengujian: ${(err as Error).message}`,
        success: false,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleRunDiagnostic = async () => {
    if (!url.trim()) {
      setTestResult({
        text: 'Silakan masukkan / tempelkan URL Web App Google Apps Script terlebih dahulu untuk diuji.',
        success: false,
      });
      return;
    }
    setIsRunningDiagnostic(true);
    setDiagnosticReport(null);
    setTestResult(null);
    try {
      const report = await runGoogleSheetDiagnostics(url.trim());
      setDiagnosticReport(report);
    } catch (err) {
      console.error('Diagnostic error:', err);
    } finally {
      setIsRunningDiagnostic(false);
    }
  };

  const handleCopyDiagnosticLog = () => {
    if (!diagnosticReport) return;
    navigator.clipboard.writeText(JSON.stringify(diagnosticReport, null, 2));
    setCopiedLog(true);
    setTimeout(() => setCopiedLog(false), 2000);
  };

  const handleOpenWebhookInNewTab = () => {
    if (!url.trim()) return;
    window.open(url.trim(), '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">
                PANDUAN & PENGATURAN GOOGLE SHEET DATABASE
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Area Khusus Admin — Terkunci Otorisasi Password
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Penjelasan jika belum terhubung di perangkat ini (Misal HP Android) */}
          {!hasSheetUrl && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <p className="font-bold">
                  Status di HP ini "BELUM TERHUBUNG" padahal di Laptop sudah Tersambung?
                </p>
                <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                  URL database tersimpan di penyimpanan browser (localStorage) masing-masing perangkat. Agar HP ini ikut tersambung, cukup <strong>tempelkan URL Google Apps Script</strong> Anda di kotak input di bawah lalu klik <strong>"Simpan Pengaturan"</strong> (Password: <code className="font-mono font-bold">admin</code>).
                </p>
              </div>
            </div>
          )}

          {/* Webhook Input & Interactive Test Buttons */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>Google Apps Script Web App URL:</span>
              </label>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                Perubahan memerlukan verifikasi Password
              </span>
            </div>
            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="w-full px-3.5 py-2.5 pr-20 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
              {/* Tombol Cepat Salin / Tempel */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {url ? (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(url);
                      setTestResult({ text: '✓ URL Webhook berhasil disalin! Kirim ke HP/perangkat lain untuk dihubungkan.', success: true });
                    }}
                    title="Salin URL ini untuk dikirim ke HP"
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 text-[10px] font-bold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span className="hidden sm:inline">Salin</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const clipText = await navigator.clipboard.readText();
                        if (clipText) setUrl(clipText.trim());
                      } catch {
                        // ignore
                      }
                    }}
                    title="Tempel dari Clipboard"
                    className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1"
                  >
                    <span>Paste</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={handleSendTestRow}
                disabled={testing || isRunningDiagnostic}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                <Send className={`w-3.5 h-3.5 ${testing ? 'animate-pulse' : ''}`} />
                <span>{testing ? 'Mengirim Tes...' : 'Kirim 1 Baris Tes ("TCC-TEST") ke Sheet'}</span>
              </button>

              <button
                type="button"
                onClick={handleRunDiagnostic}
                disabled={isRunningDiagnostic || testing}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Activity className={`w-3.5 h-3.5 ${isRunningDiagnostic ? 'animate-spin' : ''}`} />
                <span>{isRunningDiagnostic ? 'Mendiagnosa HTTP & CORS...' : 'Diagnosa Respon HTTP & CORS'}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenWebhookInNewTab}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-700"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                <span>Cek Respon Webhook di Browser</span>
              </button>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs font-medium flex items-start gap-2 mt-2 ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{testResult.text}</span>
              </div>
            )}

            {/* Diagnostic Report Panel */}
            {diagnosticReport && (
              <div className="mt-3 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-slate-800/80 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400">
                      <Terminal className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                        Hasil Diagnostik HTTP Status & CORS
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Perangkat: {diagnosticReport.isAndroid ? 'Android Mobile' : diagnosticReport.isMobile ? 'Mobile Device' : 'Desktop'} | Status Jaringan: {diagnosticReport.isOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyDiagnosticLog}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                  >
                    {copiedLog ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedLog ? 'Tersalin!' : 'Salin Log'}</span>
                  </button>
                </div>

                {/* Status Ringkasan */}
                <div
                  className={`p-3 rounded-xl border text-xs font-medium ${
                    diagnosticReport.detectedIssue === 'NONE'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                      : diagnosticReport.detectedIssue === 'CORS_OR_AUTH_RESTRICTED'
                      ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                      : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                  }`}
                >
                  <p className="font-bold">{diagnosticReport.summaryMessage}</p>
                  <p className="text-[11px] mt-1 opacity-90">{diagnosticReport.recommendedAction}</p>
                </div>

                {/* Probe Breakdown List */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Rincian Respons Probe Jaringan & Status Kode HTTP:
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {diagnosticReport.probes.map((probe, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 text-xs space-y-1.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {probe.probeName}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                              probe.httpStatus && probe.httpStatus >= 200 && probe.httpStatus < 400
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : probe.corsBlocked
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : probe.timeout
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {probe.httpStatus !== undefined
                              ? `HTTP ${probe.httpStatus} ${probe.httpStatusText || ''}`
                              : probe.corsBlocked
                              ? 'BLOCKED (CORS / AUTH)'
                              : probe.timeout
                              ? 'TIMEOUT (>10s)'
                              : 'GAGAL'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                          <span>
                            Waktu Respon: <strong className="font-mono text-slate-700 dark:text-slate-300">{probe.durationMs}ms</strong>
                          </span>
                          <span>
                            Metode: <strong className="font-mono">{probe.method}</strong> ({probe.mode})
                          </span>
                        </div>
                        {probe.responseTextSnippet && (
                          <div className="pt-1">
                            <span className="text-[10px] text-slate-400 block font-medium">Cuplikan Respons Teks Server:</span>
                            <pre className="p-2 rounded-lg bg-slate-900 text-emerald-400 font-mono text-[10px] overflow-x-auto select-all max-h-24 whitespace-pre-wrap">
                              {probe.responseTextSnippet}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Optional: Ubah Password Admin Section */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowChangePass(!showChangePass)}
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{showChangePass ? 'Sembunyikan Pengaturan Password' : 'Ganti Password Admin (Opsional)'}</span>
            </button>

            {showChangePass && (
              <div className="mt-2.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
                  Password Admin Baru (Default: <code>admin</code>):
                </label>
                <input
                  type="text"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Masukkan password admin baru..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  Password baru akan aktif setelah Anda klik "Simpan Pengaturan" dan memverifikasi dengan password saat ini.
                </p>
              </div>
            )}
          </div>


          {/* Tutorial Step-by-Step Header & Tombol Salin */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between py-1">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Langkah Cepat Memperbarui Google Apps Script:
              </h4>
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Kode Tersalin!' : 'Salin Kode Script Terbaru'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Dilindungi Otorisasi Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleInitiateSave}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </div>

        {/* Pop-up Modal Otorisasi Password Admin */}
        {isAuthModalOpen && (
          <div className="absolute inset-0 z-60 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Verifikasi Password Admin
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Masukkan password admin untuk menyimpan perubahan database (Password bawaan: <strong className="text-emerald-700 dark:text-emerald-400 font-mono">admin</strong>).
                  </p>
                </div>
              </div>

              <form onSubmit={handleConfirmAuthorizedSave} className="space-y-3">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminPasswordInput}
                    onChange={(e) => {
                      setAdminPasswordInput(e.target.value);
                      setAuthError('');
                    }}
                    autoFocus
                    placeholder="Masukkan Password Admin (Default: admin)"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {authError && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                    <span>✕</span> {authError}
                  </p>
                )}

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Otorisasi & Simpan</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
