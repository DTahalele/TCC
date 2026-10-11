import React from 'react';
import { Database, FileText, Moon, Sun, Printer, Settings } from 'lucide-react';
import { TCCLogo } from './TCCLogo';

interface HeaderProps {
  currentTab: 'form' | 'archive';
  setCurrentTab: (tab: 'form' | 'archive') => void;
  archiveCount: number;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenGoogleSheetModal: () => void;
  isSheetConnected: boolean;
  onToggleConnection?: () => void;
  onPrint: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  archiveCount,
  darkMode,
  setDarkMode,
  onOpenGoogleSheetModal,
  isSheetConnected,
  onToggleConnection,
  onPrint,
}) => {
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
              FORM - PHYSICAL FITNESS SCORE CARD
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

          {/* Status Indikator Database (ON Hijau / OFF Merah) */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onToggleConnection}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                isSheetConnected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 hover:bg-emerald-100/70'
                  : 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 hover:bg-rose-100/70'
              }`}
              title={
                isSheetConnected
                  ? 'Status Database: ON (Tersambung). Klik untuk beralih ke OFF.'
                  : 'Status Database: OFF (Terputus). Klik untuk menyambungkan kembali (ON).'
              }
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isSheetConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span className="hidden sm:inline font-medium">Google Sheet</span>
              <span
                className={`text-[11px] font-extrabold tracking-wide ${
                  isSheetConnected
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {isSheetConnected ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Tombol Pengaturan URL Apps Script (untuk mengubah template / URL di masa depan) */}
            <button
              type="button"
              onClick={onOpenGoogleSheetModal}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="Pengaturan URL Google Apps Script & Template Database"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Cetak PDF */}
          <button
            type="button"
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Cetak PDF</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={darkMode ? 'Ubah ke Mode Terang' : 'Ubah ke Dark Mode'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>
      </div>
    </header>
  );
};
