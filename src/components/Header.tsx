import React, { useState, useRef, useEffect } from 'react';
import {
  Database,
  FileText,
  Moon,
  Sun,
  Settings,
  LogOut,
  CalendarCheck,
  ShieldCheck,
  UserCheck,
  RefreshCw,
  Cloud,
  MoreVertical,
} from 'lucide-react';
import { TCCLogo } from './TCCLogo';
import { WhitelistUser } from '../types/auth';

interface HeaderProps {
  currentTab: 'form' | 'archive' | 'upcoming_trial';
  setCurrentTab: (tab: 'form' | 'archive' | 'upcoming_trial') => void;
  archiveCount: number;
  upcomingTrialCount?: number;
  upcomingTodayCount?: number;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenGoogleSheetModal: () => void;
  onPrint?: () => void;
  isSheetConnected?: boolean;
  hasSheetUrl?: boolean;
  onToggleConnection?: () => void;
  currentUser?: WhitelistUser | null;
  onLogout?: () => void;
  isAutoSyncing?: boolean;
  onManualSync?: () => void;
  lastSyncTime?: Date | null;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  archiveCount,
  upcomingTrialCount = 0,
  upcomingTodayCount = 0,
  darkMode,
  setDarkMode,
  onOpenGoogleSheetModal,
  currentUser,
  onLogout,
  isAutoSyncing = false,
  onManualSync,
  lastSyncTime,
}) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setCurrentTab('form')}
          title="Ke Halaman Utama Formulir"
        >
          {/* Official TCC Logo */}
          <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-800 p-1 border border-slate-200/90 dark:border-slate-700 shadow-xs flex items-center justify-center overflow-hidden shrink-0">
            <TCCLogo className="w-full h-full text-slate-950 dark:text-white" variant="full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-950 dark:text-white uppercase font-sans">
                <span>THE </span>
                <span className="text-rose-600 dark:text-rose-500">CORE</span>
                <span> CHAMBER</span>
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                PRO
              </span>
            </div>
            <p className="text-[11px] sm:text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              FORM - PHYSICAL FITNESS SCORE CARD & DATA MEMBER
            </p>
          </div>
        </div>

        {/* Right Header: Navigation Tabs + Modern 3-Dots Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 text-sm">
          {/* 1. Score Card (Member Only) Tab */}
          <button
            type="button"
            onClick={() => setCurrentTab('form')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'form'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Score Card (Member Only)</span>
          </button>

          {/* 2. Arsip Tab */}
          <button
            type="button"
            onClick={() => setCurrentTab('archive')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'archive'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Arsip Member TCC</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
              {archiveCount}
            </span>
          </button>

          {/* 3. Upcoming Trial Tab */}
          <button
            type="button"
            onClick={() => setCurrentTab('upcoming_trial')}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'upcoming_trial'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5 text-rose-500" />
            <span>Upcoming Trial</span>
            {upcomingTrialCount > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                  upcomingTodayCount > 0
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                }`}
              >
                {upcomingTodayCount > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                )}
                <span>{upcomingTrialCount}</span>
              </span>
            )}
          </button>

          {/* Divider between Tabs and Menu */}
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-0.5 sm:mx-1" />

          {/* Modern 3-Dots Menu Container */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-expanded={isMenuOpen}
              aria-label="Menu Pengaturan & Akun"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer shadow-2xs ${
                isMenuOpen
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white ring-2 ring-emerald-500/20'
                  : 'bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
              }`}
              title="Buka Menu, Profil Akun & Pengaturan"
            >
              {currentUser && (
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                  {currentUser.nama ? currentUser.nama.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown Menu Modal */}
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* 1. Header Profil Pengguna */}
                {currentUser ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 mb-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-extrabold text-sm shadow-xs shrink-0">
                      {currentUser.nama ? currentUser.nama.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                          {currentUser.nama}
                        </span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                        {currentUser.peran || 'Coach / Instruktur'}
                      </div>
                      {currentUser.email && (
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {currentUser.email}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 mb-2 text-center text-xs text-slate-500">
                    Sesi Pengguna Internal TCC
                  </div>
                )}

                {/* 2. Menu Action Items */}
                <div className="space-y-1">
                  {/* Status Sinkronisasi Real-Time */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-1.5 mb-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sinkronisasi Cloud</span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Aktif Otomatis
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Semua data tersinkron otomatis antar Android, iOS & Browser saat buka aplikasi.
                    </p>
                    {onManualSync && (
                      <button
                        type="button"
                        onClick={() => {
                          onManualSync();
                          setIsMenuOpen(false);
                        }}
                        disabled={isAutoSyncing}
                        className="w-full mt-1 py-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RefreshCw className={`w-3 h-3 ${isAutoSyncing ? 'animate-spin' : ''}`} />
                        <span>{isAutoSyncing ? 'Sedang Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
                      </button>
                    )}
                  </div>

                  {/* Pengaturan Database (Ikon Gear) */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenGoogleSheetModal();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 group-hover:scale-105 transition-transform">
                        <Settings className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <span className="block font-bold text-slate-900 dark:text-white">
                          Pengaturan Database
                        </span>
                        <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                          Google Sheet Backend URL
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Mode Tampilan (Dark / Light Mode) */}
                  <button
                    type="button"
                    onClick={() => {
                      setDarkMode(!darkMode);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                        {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      </div>
                      <div className="text-left">
                        <span className="block font-bold text-slate-900 dark:text-white">
                          Mode Tampilan
                        </span>
                        <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                          {darkMode ? 'Aktif: Tema Gelap' : 'Aktif: Tema Terang'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                      {darkMode ? 'Gelap' : 'Terang'}
                    </span>
                  </button>
                </div>

                {/* 3. Divider & Logout Button */}
                {onLogout && (
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setShowLogoutConfirm(true);
                      }}
                      className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer group"
                    >
                      <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform">
                        <LogOut className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <span>Keluar / Logout Akun</span>
                        <span className="block text-[10px] text-rose-500/80 font-normal">
                          Akhiri sesi login coach ini
                        </span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal Logout */}
      {showLogoutConfirm && onLogout && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Konfirmasi Keluar (Logout)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Apakah Anda yakin ingin keluar dari sesi formulir ini? Anda perlu memasukkan email & PIN
              kembali untuk mengakses formulir.
            </p>
            <div className="flex items-center justify-end gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout();
                }}
                className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 shadow-xs"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
