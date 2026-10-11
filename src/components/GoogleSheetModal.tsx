import React, { useState } from 'react';
import { X, Check, Copy, ExternalLink, ShieldCheck, Database, Sparkles, AlertCircle, Send, CheckCircle2, RefreshCw } from 'lucide-react';
import { getGoogleSheetUrl, setGoogleSheetUrl } from '../utils/storage';
import { GOOGLE_APPS_SCRIPT_TEMPLATE, sendTestRowToGoogleSheet } from '../utils/googleSheets';

interface GoogleSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUrlUpdated: () => void;
}

export const GoogleSheetModal: React.FC<GoogleSheetModalProps> = ({
  isOpen,
  onClose,
  onUrlUpdated,
}) => {
  const [url, setUrl] = useState(getGoogleSheetUrl());
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ text: string; success: boolean } | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    setGoogleSheetUrl(url);
    onUrlUpdated();
    setTestResult({ text: 'URL Google Sheet berhasil disimpan!', success: true });
    setTimeout(() => {
      onClose();
    }, 1000);
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
      // Simpan URL terlebih dahulu jika baru diedit
      setGoogleSheetUrl(url);
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
                Penyelesaian kendala sinkronisasi & verifikasi penulisan data ke Spreadsheet
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
          {/* Diagnostic Alert Box: Akun Berbeda & 3 Syarat Wajib */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs leading-relaxed space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-sm text-amber-800 dark:text-amber-300">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Penyebab Data Belum Masuk (Khusus Jika Akun Gmail Berbeda):</span>
            </div>
            <p>
              Karena Anda menggunakan <strong>akun Gmail yang berbeda</strong> dengan akun pembuat sheet, Google Apps Script secara bawaan akan <strong>memblokir</strong> pengiriman data kecuali 2 opsi ini disetel dengan benar:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1 font-semibold">
              <li>
                <strong>"Execute as"</strong> WAJIB disetel: <span className="underline">Me (email pemilik sheet)</span>. <em>(Jangan pilih "User accessing the web app")</em>.
              </li>
              <li>
                <strong>"Who has access"</strong> WAJIB disetel: <span className="underline">Anyone (Siapa saja)</span>. <em>(Jika dipilih "Only myself", data tidak bisa masuk sama sekali!)</em>
              </li>
              <li>
                <strong>Deploy Versi Baru:</strong> Setiap kali kode diperbarui, klik <strong>Deploy &gt; Manage deployments &gt; Edit (ikon pensil) &gt; Version: New version &gt; Deploy</strong>.
              </li>
            </ul>
          </div>

          {/* Webhook Input & Interactive Test Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Google Apps Script Web App URL:
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />

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

          {/* Tutorial Step-by-Step */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Langkah Cepat Memperbaiki Google Apps Script:
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
                Hapus semua kode lama di file <code>Code.gs</code>, lalu <strong>Paste kode script terbaru</strong> yang sudah diperbarui dengan fungsi anti-duplikasi dan fitur tes.
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
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
          >
            Simpan Pengaturan
          </button>
        </div>
      </div>
    </div>
  );
};
