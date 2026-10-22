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
  UserCheck,
  Eye,
} from 'lucide-react';
import { ScoreCardRecord } from '../types/scoreCard';
import { exportRecordsToCSV, isTestRecord } from '../utils/storage';
import { getBMIBadgeStyle } from '../utils/calculations';
import { formatDisplayDate } from '../utils/dateFormatter';

interface ArchiveModalProps {
  records: ScoreCardRecord[];
  isOpen: boolean;
  isFullPage?: boolean;
  onClose: () => void;
  onLoadForEdit: (record: ScoreCardRecord) => void;
  onPrintRecord: (record: ScoreCardRecord) => void;
  onDeleteRecord: (id: string) => void;
  onSyncToDatabase: () => Promise<void>;
  onRefreshFromDatabase?: () => Promise<void>;
  isRefreshing?: boolean;
  isSyncing: boolean;
  isSheetConnected: boolean;
  hasSheetUrl: boolean;
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
  onRefreshFromDatabase,
  isRefreshing = false,
  isSyncing,
  isSheetConnected,
  hasSheetUrl,
  onOpenGoogleSheetModal,
}) => {
  const [search, setSearch] = useState('');
  const [filterGender, setFilterGender] = useState<'all' | 'male' | 'female'>('all');
  const [selectedRecordForReview, setSelectedRecordForReview] = useState<ScoreCardRecord | null>(null);

  // Helper to safely extract customer full name with fallbacks
  const getRecordName = (r: ScoreCardRecord): string => {
    const raw = (
      r.Full_Name ||
      (r as any).fullName ||
      (r as any).full_name ||
      (r as any).Nama ||
      (r as any).nama ||
      (r as any).Name ||
      (r as any).name ||
      (r as any).member_name ||
      (r as any).memberName ||
      (r as any).customer_name ||
      (r as any).customerName ||
      ''
    ).toString().trim();

    if (raw) return raw;
    if (r.MemberID && r.MemberID !== 'TCC-????') return `Member ${r.MemberID}`;
    return 'Tanpa Nama';
  };

  // Helper to safely extract test date with comprehensive fallbacks formatted as "19 Oct 2026"
  const getRecordTestDate = (r: ScoreCardRecord): string => {
    const raw =
      r.Test_Date ||
      (r as any).test_date ||
      (r as any).testDate ||
      (r as any).TestDate ||
      (r as any).Tanggal_Tes ||
      (r as any).tanggal_tes ||
      (r as any).Trial_Date ||
      (r as any).trial_date ||
      (r as any).date ||
      r.createdAt ||
      r.updatedAt;

    const formatted = formatDisplayDate(raw);
    if (formatted && formatted !== '-') return formatted;
    return formatDisplayDate(new Date());
  };

  // Helper to safely extract coaches with array handling and fallbacks
  const getRecordCoach = (r: ScoreCardRecord): string => {
    const raw =
      r.Coaches !== undefined && r.Coaches !== null && r.Coaches !== ''
        ? r.Coaches
        : (r as any).coaches ||
          (r as any).coach ||
          (r as any).Coach ||
          (r as any).nama_coach ||
          (r as any).coach_name ||
          (r as any).signature_coach1 ||
          (r as any).signature_coach;

    if (Array.isArray(raw)) {
      const valid = raw.filter(Boolean);
      if (valid.length > 0) return valid.join(', ');
    } else if (raw && typeof raw === 'string') {
      const trimmed = raw.trim();
      if (trimmed && trimmed !== '-' && trimmed !== '[]' && trimmed !== '[""]') {
        return trimmed;
      }
    }
    return 'Mariskha Primasari';
  };

  // Helper to safely extract age or calculate from DoB
  const getRecordAge = (r: ScoreCardRecord): number => {
    const raw =
      (r as any).Umur !== undefined && (r as any).Umur !== null && (r as any).Umur !== ''
        ? (r as any).Umur
        : (r as any).umur !== undefined && (r as any).umur !== null && (r as any).umur !== ''
        ? (r as any).umur
        : (r as any).Age !== undefined && (r as any).Age !== null && (r as any).Age !== ''
        ? (r as any).Age
        : (r as any).age;

    if (raw !== undefined && raw !== null && raw !== '') {
      const n = Number(raw);
      if (!isNaN(n) && n > 0) return n;
    }

    const dob = r.DoB || (r as any).dob || (r as any).date_of_birth;
    if (dob) {
      try {
        const birth = new Date(dob);
        if (!isNaN(birth.getTime())) {
          const today = new Date();
          let age = today.getFullYear() - birth.getFullYear();
          const m = today.getMonth() - birth.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
          }
          if (age > 0) return age;
        }
      } catch (e) {}
    }
    return 25;
  };

  // Hanya data customer yang sudah terkonfirmasi menjadi Member TCC
  const cleanRecords = useMemo(() => {
    return records.filter((r) => {
      if (isTestRecord(r)) return false;
      const cType = String(r.Customer_type || '').toLowerCase();
      const eType = String(r.entry_type || '').toLowerCase();
      return cType === 'member' || cType === 'member tcc' || eType === 'member';
    });
  }, [records]);

  const maleCount = useMemo(
    () => cleanRecords.filter((r) => String(r.Gender || '').toLowerCase() === 'male').length,
    [cleanRecords]
  );
  const femaleCount = useMemo(
    () => cleanRecords.filter((r) => String(r.Gender || '').toLowerCase() === 'female').length,
    [cleanRecords]
  );

  const filteredRecords = useMemo(() => {
    return cleanRecords.filter((r) => {
      const q = search.toLowerCase();
      const customerName = getRecordName(r);
      const testDate = getRecordTestDate(r);
      const coach = getRecordCoach(r);
      const matchSearch =
        customerName.toLowerCase().includes(q) ||
        (r.Full_Name || '').toLowerCase().includes(q) ||
        (r.MemberID || '').toLowerCase().includes(q) ||
        coach.toLowerCase().includes(q) ||
        testDate.toLowerCase().includes(q);

      const gender = String(r.Gender || '').toLowerCase();
      const matchGender = filterGender === 'all' ? true : gender === filterGender;
      return matchSearch && matchGender;
    });
  }, [cleanRecords, search, filterGender]);

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
              ARSIP MEMBER TCC
            </h2>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
              {cleanRecords.length} Member Terkonfirmasi
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Database resmi riwayat hasil assessment kebugaran fisik & rekam data khusus Member TCC
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
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Member TCC</span>
          <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
            {cleanRecords.length}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Member Pria (Male)</span>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5 block">
            {maleCount}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Member Wanita (Female)</span>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5 block">
            {femaleCount}
          </span>
        </div>
      </div>

      {/* Database Connection Notice Banner (jika belum tersambung ke Google Sheet) */}
      {!hasSheetUrl && (
        <div className="mx-5 sm:mx-7 mt-4 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200 animate-in fade-in duration-200">
          <div className="flex items-start sm:items-center gap-2.5">
            <Database className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span className="font-bold block sm:inline">Google Sheet Belum Terhubung di Browser Ini: </span>
              <span className="text-amber-800 dark:text-amber-300">
                Data Anda tersimpan aman di Arsip lokal ini. Hubungkan URL Google Apps Script agar dapat menyinkronkan data langsung ke spreadsheet Google.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenGoogleSheetModal}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 transition-colors shadow-xs"
          >
            Hubungkan Sekarang
          </button>
        </div>
      )}

      {/* 3. Action Toolbar: Spacious Search & Filters */}
      <div className="p-5 sm:px-7 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
        {/* Search Field with roomy height */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama member, nomor Member ID (TCC-xxxx), atau nama coach..."
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
          {/* Segmented Filter (Member TCC Only) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilterGender('all')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                filterGender === 'all'
                  ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Semua Member ({cleanRecords.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterGender('male')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                filterGender === 'male'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Pria ({maleCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterGender('female')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                filterGender === 'female'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Wanita ({femaleCount})
            </button>
          </div>

          {/* Refresh / Tarik Data Terbaru dari Database Google Sheet */}
          {hasSheetUrl && onRefreshFromDatabase && (
            <button
              type="button"
              onClick={onRefreshFromDatabase}
              disabled={isRefreshing || isSyncing}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer ${
                isRefreshing
                  ? 'bg-sky-700 text-white opacity-85 cursor-not-allowed'
                  : 'bg-sky-600 hover:bg-sky-700 active:scale-98 text-white ring-2 ring-sky-500/20'
              }`}
              title="Ambil dan sinkronkan data arsip terbaru yang telah di-input oleh pengguna atau pelatih lain langsung dari database Google Sheet"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Memuat Data Terbaru...' : 'Refresh dari Database'}</span>
            </button>
          )}

          {/* Sync to Database Button (Direct sync without modal redirect) */}
          <button
            type="button"
            onClick={onSyncToDatabase}
            disabled={isSyncing || isRefreshing}
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors shrink-0 shadow-2xs"
            title="Download seluruh data dalam format CSV"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4. Structured Records Table with Alternating Rows and Thin Borders */}
      <div className={`p-4 sm:p-6 overflow-y-auto ${isFullPage ? '' : 'max-h-[62vh]'}`}>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/90 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3.5 border-r border-slate-200 dark:border-slate-700">Nama Member & ID</th>
                  <th className="py-3 px-3 border-r border-slate-200 dark:border-slate-700">Kategori</th>
                  <th className="py-3 px-3 border-r border-slate-200 dark:border-slate-700">Tanggal Tes & Coach</th>
                  <th className="py-3 px-3 border-r border-slate-200 dark:border-slate-700">Fisik & Komposisi</th>
                  <th className="py-3 px-3 border-r border-slate-200 dark:border-slate-700">BMI & Kategori</th>
                  <th className="py-3 px-3 border-r border-slate-200 dark:border-slate-700">Skill Score</th>
                  <th className="py-3 px-3.5 text-right">Aksi Operasional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-sans">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400 dark:text-slate-500">
                      <User className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                        Tidak ditemukan record yang sesuai dengan kata kunci pencarian.
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Coba gunakan kata kunci nama lain atau klik tombol filter "Semua".
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r) => {
                    const bmiStyle = getBMIBadgeStyle(r.cat_bmi);
                    const testDate = getRecordTestDate(r);
                    const coachName = getRecordCoach(r);
                    const recordAge = getRecordAge(r);
                    const memberName = getRecordName(r);

                    return (
                      <tr
                        key={r.id}
                        className="border-b border-slate-200 dark:border-slate-800 transition-colors even:bg-slate-50/50 dark:even:bg-slate-850/40 hover:bg-emerald-50/30 dark:hover:bg-slate-800/60"
                      >
                        {/* 1. Nama Member & ID */}
                        <td className="py-3.5 px-3.5 border-r border-slate-200 dark:border-slate-800">
                          <div className="font-extrabold text-sm text-slate-900 dark:text-white break-words whitespace-normal leading-snug">
                            {memberName}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded border border-slate-200 dark:border-slate-700">
                              {r.MemberID || 'TCC-????'}
                            </span>
                            <span>·</span>
                            <span className="capitalize">{r.Gender || (r as any).gender || 'Male'}</span>
                            <span>·</span>
                            <span>{recordAge} th</span>
                          </div>
                        </td>

                        {/* 2. Kategori */}
                        <td className="py-3.5 px-3 border-r border-slate-200 dark:border-slate-800">
                          <span className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-400 dark:border-emerald-700 shadow-2xs">
                            Member TCC
                          </span>
                        </td>

                        {/* 3. Tanggal Tes & Coach */}
                        <td className="py-3.5 px-3 border-r border-slate-200 dark:border-slate-800">
                          <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                            <span>{testDate}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <UserCheck className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            <span className="font-medium text-slate-700 dark:text-slate-300 break-words whitespace-normal leading-tight max-w-[200px]">{coachName}</span>
                          </div>
                        </td>

                        {/* 4. Fisik & Komposisi */}
                        <td className="py-3.5 px-3 border-r border-slate-200 dark:border-slate-800">
                          <div className="font-bold text-slate-900 dark:text-slate-100 font-mono text-xs">
                            {r.height ? `${r.height} cm` : '-'} / {r.weight ? `${r.weight} kg` : '-'}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Fat: <span className="font-semibold text-slate-700 dark:text-slate-300">{r.body_fat !== null ? `${r.body_fat}%` : '-'}</span>
                            {r.muscle_mass !== null && (
                              <span> · Otot: <span className="font-semibold text-slate-700 dark:text-slate-300">{r.muscle_mass}%</span></span>
                            )}
                          </div>
                        </td>

                        {/* 5. BMI & Kategori */}
                        <td className="py-3.5 px-3 border-r border-slate-200 dark:border-slate-800">
                          <div className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                            {r.BMI !== null ? r.BMI : '-'}
                          </div>
                          {r.cat_bmi && (
                            <span className={`inline-block mt-0.5 text-[9px] font-extrabold px-1.5 py-0.2 rounded border ${bmiStyle.bg} ${bmiStyle.text}`}>
                              {r.cat_bmi}
                            </span>
                          )}
                        </td>

                        {/* 6. Skill Score */}
                        <td className="py-3.5 px-3 border-r border-slate-200 dark:border-slate-800">
                          <span className="font-mono font-extrabold text-xs text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800 inline-block">
                            {r.avg_skill !== null ? `${r.avg_skill.toFixed(1)} / 4.0` : '-'}
                          </span>
                        </td>

                        {/* 7. Aksi Operasional */}
                        <td className="py-3.5 px-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Review Hasil Asesmen */}
                            <button
                              type="button"
                              onClick={() => setSelectedRecordForReview(r)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors shadow-2xs cursor-pointer"
                              title="Review detail hasil lengkap asesmen member ini"
                            >
                              <Eye className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                              <span className="hidden xl:inline">Review</span>
                            </button>

                            {/* Edit Data */}
                            <button
                              type="button"
                              onClick={() => {
                                onLoadForEdit(r);
                                onClose();
                              }}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900 transition-colors shadow-2xs cursor-pointer"
                              title="Buka data peserta ini ke formulir untuk di-update"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span className="hidden xl:inline">Edit Data</span>
                            </button>

                            {/* Cetak PDF */}
                            <button
                              type="button"
                              onClick={() => onPrintRecord(r)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200/70 dark:hover:bg-slate-750 transition-colors shadow-2xs cursor-pointer"
                              title={`Cetak lembar PDF Score Card resmi hanya khusus untuk ${memberName}`}
                            >
                              <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                              <span className="hidden xl:inline">Cetak PDF</span>
                            </button>

                            {/* Hapus */}
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Yakin ingin menghapus record data "${r.Full_Name}" (${r.MemberID})?`)) {
                                  onDeleteRecord(r.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                              title="Hapus record dari penyimpanan"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
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

  return (
    <>
      {isFullPage ? (
        content
      ) : (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-xs">
          {content}
        </div>
      )}

      {/* Modal Review Hasil Asesmen Lengkap Member TCC */}
      {selectedRecordForReview && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
            {/* 1. Header Review Modal */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/70 dark:bg-slate-850/60">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-400">
                    MEMBER TCC
                  </span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                    {selectedRecordForReview.MemberID || 'TCC-????'}
                  </span>
                  <span className="text-xs text-slate-500 capitalize">
                    {selectedRecordForReview.Gender || 'Male'} · {getRecordAge(selectedRecordForReview)} th
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {getRecordName(selectedRecordForReview)}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    Tanggal Tes: <strong>{getRecordTestDate(selectedRecordForReview)}</strong>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                    Coach: <strong>{getRecordCoach(selectedRecordForReview)}</strong>
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRecordForReview(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2. Scrollable Body Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
              {/* Section A: Komposisi Tubuh & Antropometri */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/40 dark:bg-slate-850/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-tight text-xs flex items-center gap-2">
                    <Scale className="w-4 h-4 text-emerald-600" />
                    1. Komposisi Tubuh & Antropometri
                  </h4>
                  {selectedRecordForReview.cat_bmi && (
                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-black border ${getBMIBadgeStyle(selectedRecordForReview.cat_bmi).bg} ${getBMIBadgeStyle(selectedRecordForReview.cat_bmi).text}`}>
                      BMI {selectedRecordForReview.BMI} ({selectedRecordForReview.cat_bmi})
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Tinggi / Berat</span>
                    <span className="font-mono font-extrabold text-slate-800 dark:text-slate-100">
                      {selectedRecordForReview.height || '-'} cm / {selectedRecordForReview.weight || '-'} kg
                    </span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Body Fat %</span>
                    <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                      {selectedRecordForReview.body_fat !== null ? `${selectedRecordForReview.body_fat}%` : '-'}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Muscle Mass %</span>
                    <span className="font-mono font-extrabold text-sky-600 dark:text-sky-400">
                      {selectedRecordForReview.muscle_mass !== null ? `${selectedRecordForReview.muscle_mass}%` : '-'}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Wing Span</span>
                    <span className="font-mono font-extrabold text-slate-800 dark:text-slate-100">
                      {selectedRecordForReview.wing_span ? `${selectedRecordForReview.wing_span} cm` : '-'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <div className="p-2 rounded-lg bg-slate-100/70 dark:bg-slate-800/60">Dada: <strong>{selectedRecordForReview.chest || '-'} cm</strong></div>
                  <div className="p-2 rounded-lg bg-slate-100/70 dark:bg-slate-800/60">Pinggang: <strong>{selectedRecordForReview.waist || '-'} cm</strong></div>
                  <div className="p-2 rounded-lg bg-slate-100/70 dark:bg-slate-800/60">Pinggul: <strong>{selectedRecordForReview.hips || '-'} cm</strong></div>
                  <div className="p-2 rounded-lg bg-slate-100/70 dark:bg-slate-800/60">Lengan (Ki/Ka): <strong>{selectedRecordForReview.left_arm || '-'}/{selectedRecordForReview.right_arm || '-'}</strong></div>
                  <div className="p-2 rounded-lg bg-slate-100/70 dark:bg-slate-800/60">Paha (Ki/Ka): <strong>{selectedRecordForReview.left_thigh || '-'}/{selectedRecordForReview.right_tight || '-'}</strong></div>
                  <div className="p-2 rounded-lg bg-slate-100/70 dark:bg-slate-800/60">Betis (Ki/Ka): <strong>{selectedRecordForReview.left_calf || '-'}/{selectedRecordForReview.right_calf || '-'}</strong></div>
                </div>
              </div>

              {/* Section B: Functional Assessment */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/40 dark:bg-slate-850/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-tight text-xs flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-600" />
                    2. Functional Assessment
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Rata-rata:</span>
                    <span className="font-mono font-black text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800">
                      {selectedRecordForReview.avg_functional !== null ? `${selectedRecordForReview.avg_functional.toFixed(1)} / 4.0` : '-'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {[
                    { label: 'Deep Squat', score: selectedRecordForReview.score_deepSquat, cat: selectedRecordForReview.cat_deepSquat },
                    { label: 'Hurdle Step', score: selectedRecordForReview.score_hurdleStep, cat: selectedRecordForReview.cat_hurdleStep },
                    { label: 'Inline Lunge', score: selectedRecordForReview.score_inlineLunge, cat: selectedRecordForReview.cat_inlineLunge },
                    { label: 'Balance Test', score: selectedRecordForReview.score_balance, cat: selectedRecordForReview.cat_balance },
                    { label: 'Landing Error', score: selectedRecordForReview.score_landing, cat: selectedRecordForReview.cat_landing },
                  ].map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 font-bold block break-words whitespace-normal leading-tight">{item.label}</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="font-mono font-black text-base text-slate-900 dark:text-white">
                          {item.score !== null ? item.score : '-'}
                        </span>
                        <span className="text-[10px] text-slate-400">/4</span>
                      </div>
                      <span className="block text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 break-words whitespace-normal leading-tight">
                        {item.cat || '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section C: Strength Assessment */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/40 dark:bg-slate-850/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-tight text-xs flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    3. Strength Assessment
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Rata-rata:</span>
                    <span className="font-mono font-black text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                      {selectedRecordForReview.avg_strength !== null ? `${selectedRecordForReview.avg_strength.toFixed(1)} / 4.0` : '-'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  {[
                    { label: 'Lower Body', score: selectedRecordForReview.score_lowerbody, cat: selectedRecordForReview.cat_lowerbody },
                    { label: 'Unilateral', score: selectedRecordForReview.score_unilateralStrenght, cat: selectedRecordForReview.cat_unilateralStrenght },
                    { label: 'Posterior', score: selectedRecordForReview.score_posteriorChain, cat: selectedRecordForReview.cat_posteriorChain },
                    { label: 'Upper Body', score: selectedRecordForReview.score_upperBody, cat: selectedRecordForReview.cat_upperBody },
                    { label: 'Core Stability', score: selectedRecordForReview.score_core, cat: selectedRecordForReview.cat_core },
                    { label: 'Conditioning', score: selectedRecordForReview.score_conditioning, cat: selectedRecordForReview.cat_conditioning },
                  ].map((item, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 font-bold block break-words whitespace-normal leading-tight">{item.label}</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                          {item.score !== null ? item.score : '-'}
                        </span>
                        <span className="text-[10px] text-slate-400">/4</span>
                      </div>
                      <span className="block text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 break-words whitespace-normal leading-tight">
                        {item.cat || '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section D: Skill Related Fitness */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/40 dark:bg-slate-850/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-tight text-xs flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    4. Skill Related Fitness
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Rata-rata:</span>
                    <span className="font-mono font-black text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800">
                      {selectedRecordForReview.avg_skill !== null ? `${selectedRecordForReview.avg_skill.toFixed(1)} / 4.0` : '-'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {[
                    { label: 'Power', score: selectedRecordForReview.score_power, cat: selectedRecordForReview.cat_power },
                    { label: 'Speed', score: selectedRecordForReview.score_speed, cat: selectedRecordForReview.cat_speed },
                    { label: 'Agility', score: selectedRecordForReview.score_agility, cat: selectedRecordForReview.cat_agility },
                    { label: 'Flexibility', score: selectedRecordForReview.score_flexibility, cat: selectedRecordForReview.cat_flexibility },
                    { label: 'Coordination', score: selectedRecordForReview.score_coordination, cat: selectedRecordForReview.cat_coordination },
                  ].map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 font-bold block break-words whitespace-normal leading-tight">{item.label}</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="font-mono font-black text-base text-slate-900 dark:text-white">
                          {item.score !== null ? item.score : '-'}
                        </span>
                        <span className="text-[10px] text-slate-400">/4</span>
                      </div>
                      <span className="block text-[10px] font-semibold text-purple-600 dark:text-purple-400 break-words whitespace-normal leading-tight">
                        {item.cat || '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section E: Catatan Khusus Coach */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/40 dark:bg-slate-850/30 space-y-1.5">
                <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-tight text-xs">
                  5. Catatan Evaluasi Coach / Instruktur
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 whitespace-pre-line">
                  {selectedRecordForReview.notes?.trim() || 'Tidak ada catatan tambahan khusus dari coach.'}
                </p>
              </div>
            </div>

            {/* 3. Footer Action Buttons */}
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/60 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedRecordForReview(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Tutup
              </button>

              <div className="flex items-center gap-2">
                {/* Cetak PDF Button */}
                <button
                  type="button"
                  onClick={() => {
                    const rec = selectedRecordForReview;
                    setSelectedRecordForReview(null);
                    onPrintRecord(rec);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak PDF</span>
                </button>

                {/* Edit Data Button */}
                <button
                  type="button"
                  onClick={() => {
                    const rec = selectedRecordForReview;
                    setSelectedRecordForReview(null);
                    onLoadForEdit(rec);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white transition-colors cursor-pointer shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Data di Form</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
