import React, { useState } from 'react';
import { Database, FileText, Moon, Sun, Settings, User, LogOut } from 'lucide-react';
import { TCCLogo } from './TCCLogo';
import { WhitelistUser } from '../types/auth';

interface HeaderProps {
  currentTab: 'form' | 'archive';
  setCurrentTab: (tab: 'form' | 'archive') => void;
  archiveCount: number;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenGoogleSheetModal: () => void;
  onPrint?: () => void;
  isSheetConnected?: boolean;
  hasSheetUrl?: boolean;
  onToggleConnection?: () => void;
  currentUser?: WhitelistUser | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  archiveCount,
  darkMode,
  setDarkMode,
  onOpenGoogleSheetModal,
  onPrint,
  currentUser,
  onLogout,
}) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('form')}>
          {/* Official TCC Logo */}
          <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-800 p-1 border border-slate-200/90 dark:border-slate-700 shadow-xs flex items-center justify-center overflow-hidden shrink-0">
            <TCCLogo className="w-full h-full text-slate-950 dark:text-white" variant="full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-950 dark:text-white uppercase font-sans">
                <span>THE </span><span className="text-rose-600 dark:text-rose-500">CORE</span><span> CHAMBER</span>
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                PRO
              </span>
            </div>
            <p className="text-[11px] sm:text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              FORM - PHYSICAL FITNESS SCOR CARD & DATA MEMBER
            </p>
          </div>
        </div>

        {/* Right Header Navigation & Actions */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-2.5 text-sm">
          {/* Formulir Tab */}
          <button
            type="button"
            onClick={() => setCurrentTab('form')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentTab === 'form'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Formulir</span>
          </button>

          {/* Arsip Tab */}
          <button
            type="button"
            onClick={() => setCurrentTab('archive')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentTab === 'archive'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Arsip</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
              {archiveCount}
            </span>
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            aria-pressed={darkMode}
            aria-label={darkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
              darkMode
                ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700 hover:border-slate-600'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200/70 hover:border-slate-300'
            }`}
            title={darkMode ? 'Beralih ke Mode Terang (Light Mode)' : 'Beralih ke Mode Gelap (Dark Mode)'}
          >
            {darkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 animate-in spin-in-180 duration-300" />
                <span className="hidden sm:inline text-slate-200">Terang</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600 animate-in spin-in-180 duration-300" />
                <span className="hidden sm:inline text-slate-700">Gelap</span>
              </>
            )}
          </button>

          {/* Current User Badge & Logout */}
          {currentUser && (
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200 dark:border-slate-700">
              <div
                className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs"
                title={`Login sebagai: ${currentUser.nama} (${currentUser.email})`}
              >
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                  {currentUser.nama ? currentUser.nama.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="font-bold text-[11px] leading-tight truncate max-w-[120px]">
                    {currentUser.nama}
                  </span>
                  {currentUser.peran && (
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 leading-tight">
                      {currentUser.peran}
                    </span>
                  )}
                </div>
              </div>

              {/* Logout / Sign Out Button */}
              {onLogout && (
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(true)}
                  className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-800/50 transition-colors cursor-pointer"
                  title="Keluar / Logout Akun"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Tombol Pengaturan Database (Ikon Gear) di Paling Kanan dengan Jarak Ideal */}
          <div className="pl-1.5 sm:pl-2 ml-0.5 sm:ml-1 border-l border-slate-200 dark:border-slate-700 flex items-center">
            <button
              type="button"
              onClick={onOpenGoogleSheetModal}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-2xs"
              title="Pengaturan Database & Status Google Sheet"
            >
              <Settings className="w-4 h-4" />
            </button>
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
              Apakah Anda yakin ingin keluar dari sesi formulir ini? Anda perlu memasukkan email & PIN kembali untuk mengakses formulir.
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
