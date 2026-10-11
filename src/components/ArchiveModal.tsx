import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Trash2,
  Edit3,
  Printer,
  X,
  Calendar,
  User,
  RefreshCw,
  Database,
  ShieldCheck,
  CheckCircle2,
  Scale,
  Award,
  Activity,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { ScoreCardRecord } from '../types/scoreCard';
import { exportRecordsToCSV } from '../utils/storage';
import { getBMIBadgeStyle } from '../utils/calculations';

interface ArchiveModalProps {
  records: ScoreCardRecord[];
  isOpen: boolean;
  isFullPage?: boolean;
  onClose: () => void;
  onLoadForEdit: (record: ScoreCardRecord) => void;
  onPrintRecord: (record: ScoreCardRecord) => void;
  onDeleteRecord: (id: string) => void;
  onSyncToDatabase: () => Promise<void>;
  isSyncing: boolean;
  isSheetConnected: boolean;
  onOpenGoogleSheetModal: () => void;
}

export const ArchiveModal: React.FC<ArchiveModalProps> = ({
  records,
  isOpen,
  isFullPage = false,
  onClose,
  onLoadForEdit,
  onPrintRecord,
  onDeleteRecord,
  onSyncToDatabase,
  isSyncing,
  isSheetConnected,
  onOpenGoogleSheetModal,
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'member' | 'trial'>('all');

  const memberCount = useMemo(() => records.filter((r) => r.Customer_type === 'member').length, [records]);
  const trialCount = useMemo(() => records.filter((r) => r.Customer_type === 'trial').length, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const q = search.toLowerCase();
      const matchSearch =
        (r.Full_Name || '').toLowerCase().includes(q) ||
        (r.MemberID || '').toLowerCase().includes(q) ||
        (r.Coaches || '').toLowerCase().includes(q);

      const matchType = filterType === 'all' ? true : r.Customer_type === filterType;
      return matchSearch && matchType;
    });
  }, [records, search, filterType]);

  if (!isOpen && !isFullPage) return null;

  const content = (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs flex flex-col ${
      isFullPage ? 'w-full' : 'w-full max-w-5xl max-h-[90vh] shadow-2xl'
    }`}>
      {/* 1. Header Section */}
      <div className="p-6 sm:p-7 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">
              ARSIP SCORE CARD THE CORE CHAMBER
            </h2>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {records.length} Total Data
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Database riwayat hasil assessment kebugaran fisik peserta & sinkronisasi Google Sheet
          </p>
        </div>

        {!isFullPage && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 2. Stat Overview Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 p-5 sm:px-7 bg-slate-50/50 dark:bg-slate-850/50 border-b border-slate-100 dark:border-slate-800">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Record</span>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5 block">
            {records.length}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">Member TCC</span>
          <span className="text-xl sm:text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 font-mono mt-0.5 block">
            {memberCount}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">Customer Trial</span>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-700 dark:text-slate-200 font-mono mt-0.5 block">
            {trialCount}
          </span>
        </div>
      </div>

      {/* 3. Action Toolbar: Spacious Search & Filters */}
      <div className="p-5 sm:px-7 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
        {/* Search Field with roomy height */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama peserta, nomor Member ID (TCC-xxxx), atau nama coach..."
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-3 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter and Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Segmented Filter */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                filterType === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Semua ({records.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('member')}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                filterType === 'member'
                  ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Member ({memberCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('trial')}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                filterType === 'trial'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Trial ({trialCount})
            </button>
          </div>

          {/* Sync to Database Button (Direct sync without modal redirect) */}
          <button
            type="button"
            onClick={onSyncToDatabase}
            disabled={isSyncing}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer ${
              isSyncing
                ? 'bg-emerald-700 text-white opacity-85 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white ring-2 ring-emerald-500/20'
            }`}
            title="Kirim dan sinkronkan seluruh data Arsip langsung ke database sheet tanpa duplikasi data"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Menyinkronkan ke Database...' : 'Sync to Database'}</span>
          </button>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={() => exportRecordsToCSV(records)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shrink-0 shadow-2xs"
            title="Download seluruh data dalam format CSV"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4. Spacious Records List with Legible Typography */}
      <div className={`p-5 sm:p-7 space-y-4 overflow-y-auto ${isFullPage ? '' : 'max-h-[58vh]'}`}>
        {filteredRecords.length === 0 ? (
          <div className="text-center py-16 text-slate-400 space-y-2">
            <User className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
              Tidak ditemukan record yang sesuai dengan kata kunci pencarian.
            </p>
            <p className="text-xs text-slate-400">
              Coba gunakan kata kunci nama lain atau klik tombol filter "Semua".
            </p>
          </div>
        ) : (
          filteredRecords.map((r) => {
            const bmiStyle = getBMIBadgeStyle(r.cat_bmi);

            return (
              <div
                key={r.id}
                className="group p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-emerald-300 dark:hover:border-emerald-800 hover:shadow-md transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* A. Left Identity & Member Info (Roomy & High Contrast) */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Participant Full Name */}
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                      {r.Full_Name || 'Tanpa Nama'}
                    </h3>

                    {/* Member ID Badge */}
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                      {r.MemberID || 'TCC-????'}
                    </span>

                    {/* Customer Category Badge */}
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md ${
                        r.Customer_type === 'member'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {r.Customer_type === 'member' ? 'Member TCC' : 'Trial User'}
                    </span>
                  </div>

                  {/* Metadata line: Test date, coach, age, gender */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Tanggal Tes: <strong className="text-slate-700 dark:text-slate-200">{r.Test_Date || '-'}</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5 font-medium">
                      Coach: <strong className="text-slate-700 dark:text-slate-200">{r.Coaches || '-'}</strong>
                    </span>
                    <span>•</span>
                    <span>Gender: <strong className="capitalize text-slate-700 dark:text-slate-200">{r.Gender || '-'}</strong></span>
                    {r.Umur !== null && (
                      <>
                        <span>•</span>
                        <span>Usia: <strong className="text-slate-700 dark:text-slate-200">{r.Umur} Tahun</strong></span>
                      </>
                    )}
                  </div>
                </div>

                {/* B. Middle Metrics Badges (Clear Physical Overview) */}
                <div className="flex flex-wrap items-center gap-3 py-2 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-750 text-xs shrink-0">
                  {/* Tinggi & Berat */}
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Tinggi / Berat</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                      {r.height ? `${r.height} cm` : '-'} / {r.weight ? `${r.weight} kg` : '-'}
                    </span>
                  </div>

                  <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

                  {/* BMI & Category */}
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">BMI & Klasifikasi</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {r.BMI !== null ? r.BMI : '-'}
                      </span>
                      {r.cat_bmi && (
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded border ${bmiStyle.bg} ${bmiStyle.text}`}>
                          {r.cat_bmi}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

                  {/* Avg Skill */}
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Skill Avg</span>
                    <span className="font-mono font-extrabold text-purple-700 dark:text-purple-300">
                      {r.avg_skill !== null ? `${r.avg_skill.toFixed(1)} / 4.0` : '-'}
                    </span>
                  </div>
                </div>

                {/* C. Right Actions: Large, Touch-Friendly Buttons */}
                <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                  {/* Edit Data */}
                  <button
                    type="button"
                    onClick={() => {
                      onLoadForEdit(r);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900 transition-colors shadow-2xs"
                    title="Buka data peserta ini ke formulir untuk di-update"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Data</span>
                  </button>

                  {/* Cetak PDF */}
                  <button
                    type="button"
                    onClick={() => onPrintRecord(r)}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-2xs"
                    title="Cetak PDF Score Card peserta ini"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">Cetak</span>
                  </button>

                  {/* Hapus Record */}
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Yakin ingin menghapus record data "${r.Full_Name}" (${r.MemberID})?`)) {
                        onDeleteRecord(r.id);
                      }
                    }}
                    className="p-2.5 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                    title="Hapus record dari penyimpanan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. Footer Information */}
      <div className="p-5 sm:px-7 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>Menampilkan <strong>{filteredRecords.length}</strong> dari <strong>{records.length}</strong> total data terarsip.</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onSyncToDatabase}
            disabled={isSyncing}
            className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Menyinkronkan ke Database...' : 'Sync Semua ke Database'}</span>
          </button>

          {!isFullPage && (
            <button
              type="button"
              onClick={onClose}
              className="font-bold text-slate-700 dark:text-slate-300 hover:underline"
            >
              Tutup
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (isFullPage) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-xs">
      {content}
    </div>
  );
};
