import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Sparkles,
  KeyRound,
  Users,
} from 'lucide-react';
import { TCCLogo } from './TCCLogo';
import { authenticateUser, SEED_WHITELIST_USERS } from '../utils/auth';
import { WhitelistUser } from '../types/auth';

interface AuthGateProps {
  onAuthenticated: (user: WhitelistUser) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenGoogleSheetModal?: () => void;
}

export const AuthGate: React.FC<AuthGateProps> = ({
  onAuthenticated,
  darkMode,
  setDarkMode,
  onOpenGoogleSheetModal,
}) => {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showHelperInfo, setShowHelperInfo] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim()) {
      setErrorMsg('Silakan masukkan alamat email yang sudah terdaftar.');
      return;
    }
    if (!pin.trim()) {
      setErrorMsg('Silakan masukkan kode PIN akses Anda.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authenticateUser(email, pin, rememberMe);
      if (result.success && result.user) {
        setSuccessMsg(result.message);
        setTimeout(() => {
          onAuthenticated(result.user!);
        }, 600);
      } else {
        setErrorMsg(result.message || 'Verifikasi gagal. Periksa kembali email dan PIN Anda.');
      }
    } catch (err) {
      setErrorMsg('Terjadi kesalahan saat memproses verifikasi. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (seedUser: WhitelistUser) => {
    if (!seedUser.email) {
      setErrorMsg(`Akun "${seedUser.nama}" tidak memiliki email dan berstatus Non-Aktif.`);
      return;
    }
    setEmail(seedUser.email);
    setPin(seedUser.pin);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between p-4 sm:p-6 transition-colors font-sans">
      {/* Top utility bar */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between text-xs py-2">
        <span className="font-semibold tracking-wider text-slate-400 uppercase text-[11px] flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          Akses Terproteksi Whitelist
        </span>

        {/* Dark/Light mode toggle */}
        <button
          type="button"
          onClick={() => setDarkMode(!darkMode)}
          className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium transition-colors"
        >
          {darkMode ? '🌙 Dark' : '☀️ Light'}
        </button>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-auto py-6">
        <div className="bg-slate-850 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
          {/* Brand Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-3.5 rounded-2xl bg-slate-800 p-2.5 border border-slate-700 shadow-md flex items-center justify-center">
              <TCCLogo className="w-full h-full text-white" variant="full" />
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase font-sans">
              <span>THE </span>
              <span className="text-rose-500">CORE</span>
              <span> CHAMBER</span>
            </h1>
            <p className="text-xs font-bold tracking-widest text-emerald-400 uppercase mt-0.5">
              PHYSICAL FITNESS SCORE CARD
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Verifikasi Otorisasi Pengguna (Email & PIN)
            </p>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{successMsg}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Alamat Email Terdaftar
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@airzone.id atau email@gmail.com"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck="false"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Mendukung email Google Workspace, email kantor, dan publik (Gmail, dll).
              </p>
            </div>

            {/* PIN Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Kode PIN Rahasia
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Masukkan 4 digit PIN Anda"
                  autoComplete="current-password"
                  required
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-mono tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                  tabIndex={-1}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember device checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                />
                <span>Ingat login di perangkat ini</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memverifikasi Akses...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Masuk ke Formulir</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Tester Assist for Admin / Evaluation */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowHelperInfo(!showHelperInfo)}
              className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition-colors py-1"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                Daftar Akun Whitelist (Uji Coba Cepat)
              </span>
              {showHelperInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showHelperInfo && (
              <div className="mt-3 space-y-2 text-xs animate-in fade-in duration-200">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Klik salah satu akun terdaftar di bawah untuk mengisi form login secara instan:
                </p>
                <div className="space-y-1.5 pt-1">
                  {SEED_WHITELIST_USERS.map((u, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleQuickFill(u)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        u.status === 'Aktif'
                          ? 'bg-slate-800/80 border-slate-700/80 hover:bg-slate-800 hover:border-emerald-500/50'
                          : 'bg-rose-950/20 border-rose-800/40 opacity-70 cursor-not-allowed'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-white flex items-center gap-2">
                          <span>{u.nama}</span>
                          {u.peran && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 font-normal">
                              {u.peran}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {u.email || '(Tanpa Email)'}
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            u.status === 'Aktif'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {u.status}
                        </span>
                        {u.status === 'Aktif' && (
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            PIN: {u.pin}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-[11px] text-slate-400 leading-relaxed">
                  💡 <strong>Catatan Pengelolaan:</strong> Daftar email dan PIN dibaca dari Tab{' '}
                  <code className="text-emerald-300 bg-slate-900 px-1 py-0.5 rounded">whitelist_user</code> di Google Spreadsheet Anda. Jika sebuah email dihapus dari tabel atau diubah ke <em>Non-Aktif</em>, akses user tersebut otomatis terkunci secara <em>real-time</em>!
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-500 mt-5">
          The Core Chamber • Internal Assessment System • Hak Akses Terproteksi
        </div>
      </div>
    </div>
  );
};
