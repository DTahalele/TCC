import React, { useState } from 'react';
import { X, Check, Copy, ExternalLink, ShieldCheck, Database, Send, CheckCircle2, Lock, KeyRound, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { getGoogleSheetUrl, setGoogleSheetUrl, verifyAdminPassword, setAdminPassword } from '../utils/storage';
import { GOOGLE_APPS_SCRIPT_TEMPLATE, sendTestRowToGoogleSheet } from '../utils/googleSheets';

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

  // Sync state whenever modal opens
  React.useEffect(() => {
    if (isOpen) {
      setUrl(getGoogleSheetUrl());
      setTestResult(null);
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
          {/* Status Indikator Database (Dipindahkan dari Header Halaman Utama) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span>Status Sambungan Database Google Sheet:</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Klik tombol di samping untuk beralih antara ON (aktif) atau OFF (terputus).
              </p>
            </div>

            {/* Tombol Component yang dipindahkan dari Header */}
            <button
              type="button"
              onClick={onToggleConnection}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shrink-0 shadow-2xs ${
                !hasSheetUrl
                  ? 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700 hover:bg-amber-100/80 animate-pulse'
                  : isSheetConnected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 hover:bg-emerald-100/70'
                  : 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 hover:bg-rose-100/70'
              }`}
              title={
                !hasSheetUrl
                  ? 'Database Google Sheet belum dikonfigurasi. Masukkan URL Webhook di bawah.'
                  : isSheetConnected
                  ? 'Status Database: ON (Tersambung). Klik untuk beralih ke OFF.'
                  : 'Status Database: OFF (Terputus). Klik untuk menyambungkan kembali (ON).'
              }
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  !hasSheetUrl
                    ? 'bg-amber-500'
                    : isSheetConnected
                    ? 'bg-emerald-500 animate-pulse'
                    : 'bg-rose-500'
                }`}
              />
              <span className="font-medium">Google Sheet</span>
              <span
                className={`text-[11px] font-extrabold tracking-wide ${
                  !hasSheetUrl
                    ? 'text-amber-700 dark:text-amber-400'
                    : isSheetConnected
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {!hasSheetUrl ? 'BELUM TERHUBUNG' : isSheetConnected ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>

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
                disabled={testing}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                <Send className={`w-3.5 h-3.5 ${testing ? 'animate-pulse' : ''}`} />
                <span>{testing ? 'Mengirim Tes...' : 'Kirim 1 Baris Tes ("TCC-TEST") ke Sheet'}</span>
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

          {/* Tutorial Step-by-Step */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Langkah Cepat Memperbarui Google Apps Script:
              </h4>
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Kode Tersalin!' : 'Salin Kode Script Terbaru'}</span>
              </button>
            </div>

            <ol className="list-decimal list-inside space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
              <li>
                Buka Google Sheet database Anda, klik <strong>Extensions &gt; Apps Script</strong>.
              </li>
              <li>
                Hapus semua kode lama di file <code>Code.gs</code>, lalu <strong>Paste kode script terbaru</strong> yang sudah dilengkapi fungsi anti-duplikasi dan fitur tes.
              </li>
              <li>
                Klik tombol <strong>Save (ikon disket)</strong>.
              </li>
              <li>
                Klik tombol <strong>Deploy (Terapkan) &gt; Manage deployments (Kelola penerapan)</strong>.
              </li>
              <li>
                Klik ikon <strong>Pensil (Edit)</strong> pada Web App yang sudah ada.
              </li>
              <li>
                Pada dropdown <strong>Version</strong>, pilih <strong>New version (Versi baru)</strong>.
              </li>
              <li>
                Pastikan <strong>"Execute as" = Me</strong> dan <strong>"Who has access" = Anyone</strong>. Lalu klik <strong>Deploy</strong>.
              </li>
              <li>
                Klik tombol <em>"Kirim 1 Baris Tes ("TCC-TEST") ke Sheet"</em> di atas untuk memverifikasi baris muncul langsung di spreadsheet Anda!
              </li>
            </ol>
          </div>

          {/* Snippet Code Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>Kode Google Apps Script Lengkap (Update v1.2):</span>
              <span className="font-mono text-[10px]">doGet + doPost + Batch Upsert</span>
            </div>
            <pre className="max-h-44 overflow-y-auto p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] leading-relaxed select-all">
              {GOOGLE_APPS_SCRIPT_TEMPLATE}
            </pre>
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
