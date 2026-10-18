import React, { useState, useMemo } from 'react';
import {
  TrialRegistrationRecord,
  TrialCustomerType,
} from '../types/trialRegistration';
import { isTestTrialRecord } from '../utils/trialStorage';
import {
  Calendar,
  Clock,
  UserPlus,
  Search,
  Filter,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Phone,
  Sparkles,
  Users,
  ChevronRight,
  ShieldAlert,
  UploadCloud,
  Loader2,
  RotateCcw,
} from 'lucide-react';

interface UpcomingTrialTabProps {
  trials: TrialRegistrationRecord[];
  onAddNewTrial: (type: TrialCustomerType) => void;
  onReviewTrial: (trial: TrialRegistrationRecord) => void;
  onStartTrialSession: (trial: TrialRegistrationRecord) => void;
  onPrintConfirmation: (trial: TrialRegistrationRecord) => void;
  onEditTrial: (trial: TrialRegistrationRecord) => void;
  onDeleteTrial: (id: string) => void;
  onConvertToMember: (trial: TrialRegistrationRecord) => void;
  onRevertFromMember?: (trial: TrialRegistrationRecord) => void;
  onSyncAllTrialsToDatabase?: () => Promise<void>;
  isSyncingTrials?: boolean;
}

export const UpcomingTrialTab: React.FC<UpcomingTrialTabProps> = ({
  trials,
  onAddNewTrial,
  onReviewTrial,
  onStartTrialSession,
  onPrintConfirmation,
  onEditTrial,
  onDeleteTrial,
  onConvertToMember,
  onRevertFromMember,
  onSyncAllTrialsToDatabase,
  isSyncingTrials = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'today' | 'confirmed' | 'pending' | 'completed' | 'converted'>('all');
  const [revertingTrial, setRevertingTrial] = useState<TrialRegistrationRecord | null>(null);

  // Compute date diff in days for each trial relative to today
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const getDayDiff = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      const target = new Date(dateStr);
      target.setHours(0, 0, 0, 0);
      const oneDay = 24 * 60 * 60 * 1000;
      return Math.round((target.getTime() - today.getTime()) / oneDay);
    } catch {
      return null;
    }
  };

  // Always exclude any test-connection records from displaying
  const cleanTrials = useMemo(() => {
    return trials.filter((t) => !isTestTrialRecord(t));
  }, [trials]);

  // Metrics for Coordinator Agenda Banner
  const stats = useMemo(() => {
    let todayCount = 0;
    let h3Count = 0;
    let h7Count = 0;
    let pendingCount = 0;
    let completedCount = 0;
    let convertedCount = 0;

    cleanTrials.forEach((t) => {
      if (t.trial_status === 'Member TCC') {
        convertedCount++;
        return;
      }
      if (t.trial_status === 'Selesai Trial') {
        completedCount++;
      }
      if (t.schedule_status === 'Pending' || !t.Trial_Date) {
        pendingCount++;
        return;
      }

      const diff = getDayDiff(t.Trial_Date);
      if (diff !== null) {
        if (diff === 0) todayCount++;
        else if (diff > 0 && diff <= 3) h3Count++;
        else if (diff > 3 && diff <= 7) h7Count++;
      }
    });

    return {
      todayCount,
      h3Count,
      h7Count,
      pendingCount,
      completedCount,
      convertedCount,
      totalActive: cleanTrials.filter((t) => t.schedule_status === 'Confirmed' && t.trial_status !== 'Member TCC').length,
    };
  }, [cleanTrials, today]);

  // Filtered & Sorted Trials
  const filteredTrials = useMemo(() => {
    return cleanTrials
      .filter((t) => {
        // Search
        const query = searchQuery.toLowerCase().trim();
        if (query) {
          const matchName = t.Full_Name?.toLowerCase().includes(query);
          const matchId = t.MemberID?.toLowerCase().includes(query);
          const matchCoach = t.Coaches?.some((c) => c.toLowerCase().includes(query));
          const matchSchool = t.nama_sekolah?.toLowerCase().includes(query);
          const matchWork = t.formadults_pekerjaan?.toLowerCase().includes(query);
          if (!matchName && !matchId && !matchCoach && !matchSchool && !matchWork) {
            return false;
          }
        }

        // Tab Filter
        if (filterTab === 'today') {
          return t.schedule_status === 'Confirmed' && getDayDiff(t.Trial_Date) === 0;
        }
        if (filterTab === 'confirmed') {
          return t.schedule_status === 'Confirmed' && t.trial_status !== 'Member TCC';
        }
        if (filterTab === 'pending') {
          return t.schedule_status === 'Pending' || !t.Trial_Date;
        }
        if (filterTab === 'completed') {
          return t.trial_status === 'Selesai Trial';
        }
        if (filterTab === 'converted') {
          return t.trial_status === 'Member TCC';
        }

        return true;
      })
      .sort((a, b) => {
        // Sort priority: Confirmed upcoming dates closest to today first, then pending, then completed
        const diffA = getDayDiff(a.Trial_Date);
        const diffB = getDayDiff(b.Trial_Date);

        if (diffA !== null && diffB !== null) {
          return diffA - diffB;
        }
        if (diffA !== null) return -1;
        if (diffB !== null) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [trials, searchQuery, filterTab, today]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Buttons */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-tight text-slate-950 dark:text-white">
              UPCOMING TRIAL
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
              Pusat Komando Operasional
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Pencatatan form registrasi calon customer baru (Kids & Adults), skrining riwayat cedera untuk Coach, dan pelacakan jadwal sesi trial terdekat.
          </p>
        </div>

        {/* Action Buttons for Admin to add registration & sync to Google Sheet */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {onSyncAllTrialsToDatabase && (
            <button
              type="button"
              onClick={onSyncAllTrialsToDatabase}
              disabled={isSyncingTrials}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                isSyncingTrials
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 border-transparent cursor-not-allowed'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 shadow-2xs cursor-pointer'
              }`}
              title="Kirim dan sinkronkan seluruh data trial yang ada ke tab Registrasi_Trial di Google Sheet"
            >
              {isSyncingTrials ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Menyinkronkan...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Kirim Semua ke Database</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => onAddNewTrial('Trial Adults')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-extrabold shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-indigo-400 dark:text-indigo-600" />
            <span>+ Add New User (Trial Adults)</span>
          </button>

          <button
            type="button"
            onClick={() => onAddNewTrial('Trial Kids')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-slate-950" />
            <span>+ Add New User (Trial Kids)</span>
          </button>
        </div>
      </div>

      {/* AGENDA KOORDINASI 7 HARI KE DEPAN (H-7 & H-3 & HARI INI) */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white border border-slate-800 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
              Agenda Koordinasi Pelatih & Jadwal Terdekat
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Window Notifikasi Terjadwal: <strong className="text-emerald-400">{stats.totalActive} Sesi</strong> dalam 7 hari ke depan
          </span>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Hari Ini */}
          <div
            onClick={() => setFilterTab('today')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              filterTab === 'today'
                ? 'bg-rose-500/20 border-rose-500 ring-2 ring-rose-500/30'
                : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-400 uppercase">HARI INI (H-0)</span>
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            </div>
            <div className="text-2xl font-black mt-1 text-white">{stats.todayCount}</div>
            <p className="text-[10px] text-slate-400 mt-0.5">Sesi harus siap dilayani</p>
          </div>

          {/* H-3 */}
          <div
            onClick={() => setFilterTab('confirmed')}
            className="p-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-400 uppercase">H-3 (3 Hari Lagi)</span>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            </div>
            <div className="text-2xl font-black mt-1 text-white">{stats.h3Count}</div>
            <p className="text-[10px] text-slate-400 mt-0.5">Konfirmasi WA & materi tes</p>
          </div>

          {/* H-7 */}
          <div
            onClick={() => setFilterTab('confirmed')}
            className="p-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-sky-400 uppercase">H-7 (7 Hari Lagi)</span>
              <span className="w-2 h-2 rounded-full bg-sky-500" />
            </div>
            <div className="text-2xl font-black mt-1 text-white">{stats.h7Count}</div>
            <p className="text-[10px] text-slate-400 mt-0.5">Penugasan pelatih / roster</p>
          </div>

          {/* Pending Schedule */}
          <div
            onClick={() => setFilterTab('pending')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              filterTab === 'pending'
                ? 'bg-amber-500/20 border-amber-500 ring-2 ring-amber-500/30'
                : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300 uppercase">Belum Dijadwal</span>
              <span className="w-2 h-2 rounded-full bg-slate-500" />
            </div>
            <div className="text-2xl font-black mt-1 text-white">{stats.pendingCount}</div>
            <p className="text-[10px] text-slate-400 mt-0.5">Follow-up booking jam</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Quick Filter Tabs */}
        <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
              filterTab === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Semua ({cleanTrials.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('today')}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
              filterTab === 'today'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-600 dark:text-rose-400 hover:text-rose-700'
            }`}
          >
            🔴 Hari Ini ({stats.todayCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('confirmed')}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
              filterTab === 'confirmed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Terkonfirmasi ({stats.totalActive})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('pending')}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
              filterTab === 'pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Pending Jadwal ({stats.pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('completed')}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
              filterTab === 'completed'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Selesai Trial ({stats.completedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('converted')}
            className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
              filterTab === 'converted'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-emerald-700 dark:text-emerald-400 hover:text-emerald-800'
            }`}
          >
            Member TCC ({stats.convertedCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, ID, coach, atau sekolah..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Calon Member & ID</th>
                <th className="py-3 px-3">Tipe</th>
                <th className="py-3 px-3">Jadwal Sesi & Urgensi</th>
                <th className="py-3 px-3">Coach Bertugas</th>
                <th className="py-3 px-3">Kondisi Medis / Cedera</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Aksi Operasional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
              {filteredTrials.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <p className="font-semibold text-sm">Tidak ada data trial yang cocok dengan kriteria filter.</p>
                    <p className="text-xs mt-1">Gunakan tombol di atas untuk menambahkan calon peserta trial baru.</p>
                  </td>
                </tr>
              ) : (
                filteredTrials.map((t) => {
                  const diff = getDayDiff(t.Trial_Date);
                  const isToday = t.schedule_status === 'Confirmed' && diff === 0;
                  const isH3 = t.schedule_status === 'Confirmed' && diff !== null && diff > 0 && diff <= 3;
                  const isH7 = t.schedule_status === 'Confirmed' && diff !== null && diff > 3 && diff <= 7;

                  const hasMedicalWarning =
                    t.formadults_kondisi === 'Ada Kondisi Khusus' ||
                    t.formadults_riwayat === 'Ada' ||
                    t.formadults_cideraOperasi === 'Ada' ||
                    t.formadults_medisKhusus === 'Ada';

                  return (
                    <tr
                      key={t.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isToday ? 'bg-rose-50/40 dark:bg-rose-950/20' : ''
                      }`}
                    >
                      {/* Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          {t.Full_Name}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <span className="font-mono font-semibold">{t.MemberID}</span>
                          <span>·</span>
                          <span>{t.Gender || '-'}</span>
                          <span>·</span>
                          <span>{t.Umur !== null ? `${t.Umur} th` : '-'}</span>
                        </div>
                      </td>

                      {/* Type: Kids vs Adults */}
                      <td className="py-3.5 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.Customer_type === 'Trial Kids'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                        }`}>
                          {t.Customer_type === 'Trial Kids' ? 'KIDS 🧒' : 'ADULTS 🧑'}
                        </span>
                        {t.Customer_type === 'Trial Kids' && t.nama_sekolah && (
                          <span className="block text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[120px] mt-0.5">
                            {t.nama_sekolah}
                          </span>
                        )}
                        {t.Customer_type === 'Trial Adults' && t.formadults_pekerjaan && (
                          <span className="block text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[120px] mt-0.5">
                            {t.formadults_pekerjaan}
                          </span>
                        )}
                      </td>

                      {/* Schedule & Urgency */}
                      <td className="py-3.5 px-3">
                        {t.schedule_status === 'Confirmed' && t.Trial_Date ? (
                          <div>
                            <div className="font-bold text-slate-800 dark:text-slate-200">
                              {t.Trial_Day}, {t.Trial_Date}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-emerald-500" />
                              <span>{t.Trial_Time ? `${t.Trial_Time} WIB` : '-'}</span>
                              {isToday && (
                                <span className="ml-1 px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-rose-600 text-white animate-pulse">
                                  HARI INI
                                </span>
                              )}
                              {isH3 && (
                                <span className="ml-1 px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-500 text-slate-950">
                                  H-{diff}
                                </span>
                              )}
                              {isH7 && (
                                <span className="ml-1 px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-sky-500 text-white">
                                  H-{diff}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/50">
                            Belum Ada Jadwal
                          </span>
                        )}
                      </td>

                      {/* Coaches */}
                      <td className="py-3.5 px-3">
                        {t.Coaches && t.Coaches.length > 0 ? (
                          <div className="font-semibold text-slate-800 dark:text-slate-200 max-w-[140px] truncate" title={t.Coaches.join(', ')}>
                            {t.Coaches.join(', ')}
                          </div>
                        ) : (
                          <span className="text-[10px] font-semibold text-rose-500 dark:text-rose-400 italic">
                            Belum Ditugaskan
                          </span>
                        )}
                      </td>

                      {/* Medical Check */}
                      <td className="py-3.5 px-3">
                        {hasMedicalWarning ? (
                          <div
                            onClick={() => onReviewTrial(t)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 font-bold text-[10px] cursor-pointer hover:bg-rose-200"
                            title="Klik untuk melihat detail catatan medis"
                          >
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>Ada Catatan Cedera</span>
                          </div>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                            ✓ Sehat / Normal
                          </span>
                        )}
                      </td>

                      {/* Status: Penjadwalan & Sesi */}
                      <td className="py-3.5 px-3">
                        <div>
                          {t.schedule_status === 'Confirmed' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Terkonfirmasi
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800" title="Hari, Tanggal, Jam, atau Coach belum lengkap (Butuh Alokasi Coordinator)">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              Pending Jadwal
                            </span>
                          )}
                        </div>

                        <div className="mt-1">
                          {t.trial_status === 'Member TCC' ? (
                            <div>
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-600 text-white shadow-2xs">
                                MEMBER TCC
                              </span>
                              {t.converted_member_id && (
                                <span className="block text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-300 mt-0.5">
                                  {t.converted_member_id}
                                </span>
                              )}
                            </div>
                          ) : t.trial_status === 'Selesai Trial' ? (
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                              Selesai Asesmen
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] text-slate-500 dark:text-slate-400">
                              Menunggu Trial
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1. Review Medis & Profil */}
                          <button
                            type="button"
                            onClick={() => onReviewTrial(t)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors shadow-2xs cursor-pointer"
                            title="Review Seluruh Profil, Catatan Medis & Asesmen Fisik Peserta"
                          >
                            Review
                          </button>

                          {/* 4. Edit / Reschedule */}
                          <button
                            type="button"
                            onClick={() => onEditTrial(t)}
                            className="p-1 rounded-lg text-sky-600 hover:text-sky-800 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors cursor-pointer"
                            title="Edit Data / Penjadwalan Sesi (Admin / Coordinator)"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* 5. Convert to Member TCC / Reset ke Trial */}
                          {t.trial_status !== 'Member TCC' ? (
                            <button
                              type="button"
                              onClick={() => onConvertToMember(t)}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors shadow-2xs cursor-pointer"
                              title="Customer memutuskan bergabung: Upgrade menjadi MEMBER TCC (Otomatis generate Member ID resmi)"
                            >
                              <UserCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                              <span className="hidden xl:inline">Upgrade Member</span>
                            </button>
                          ) : (
                            onRevertFromMember && (
                              <button
                                type="button"
                                onClick={() => setRevertingTrial(t)}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 transition-colors shadow-2xs cursor-pointer"
                                title="Customer batal/tunda bergabung: Kembalikan status ke Trial Customer & cabut Member ID resmi"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                <span className="hidden xl:inline">Reset ke Trial</span>
                              </button>
                            )
                          )}

                          {/* 6. Hapus */}
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Hapus data trial untuk ${t.Full_Name}?`)) {
                                onDeleteTrial(t.id);
                              }
                            }}
                            className="p-1 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Hapus Data Trial"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Modal Konfirmasi Batalkan Status Member (Reset ke Trial) */}
      {revertingTrial && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Batalkan Status Member TCC?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Kembalikan calon member ke status <strong>"Selesai Trial"</strong> jika customer menunda atau batal bergabung.
                </p>
              </div>
            </div>

            <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Nama Customer:</span>
                <span className="font-bold text-slate-900 dark:text-white">{revertingTrial.Full_Name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Member ID Resmi:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  {revertingTrial.converted_member_id || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Ref ID Trial:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{revertingTrial.MemberID}</span>
              </div>
            </div>

            <p className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/60 mt-3.5 leading-relaxed">
              ⚠️ Member ID resmi di atas akan dinonaktifkan, profil kartu member di database utama akan diselaraskan kembali, dan tombol <strong>"Upgrade Member"</strong> akan muncul kembali jika customer memutuskan bergabung di lain waktu.
            </p>

            <div className="flex items-center justify-end gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setRevertingTrial(null)}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onRevertFromMember && revertingTrial) {
                    onRevertFromMember(revertingTrial);
                  }
                  setRevertingTrial(null);
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                Ya, Kembalikan ke Trial
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
