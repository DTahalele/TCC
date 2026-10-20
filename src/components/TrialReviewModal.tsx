import React from 'react';
import { TrialRegistrationRecord } from '../types/trialRegistration';
import { formatDisplayDate } from '../utils/dateFormatter';
import {
  Play,
  Printer,
  Edit3,
  X,
  Calendar,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Heart,
  User,
  Building,
  GraduationCap,
  CheckCircle,
  UserCheck,
  Award,
} from 'lucide-react';

interface TrialReviewModalProps {
  trial: TrialRegistrationRecord;
  isOpen: boolean;
  onClose: () => void;
  onStartTrialSession: (trial: TrialRegistrationRecord) => void;
  onPrintConfirmation: (trial: TrialRegistrationRecord) => void;
  onEditTrial: (trial: TrialRegistrationRecord) => void;
  onConvertToMember?: (trial: TrialRegistrationRecord) => void;
}

export const TrialReviewModal: React.FC<TrialReviewModalProps> = ({
  trial,
  isOpen,
  onClose,
  onStartTrialSession,
  onPrintConfirmation,
  onEditTrial,
  onConvertToMember,
}) => {
  if (!isOpen) return null;

  const hasHealthAlert =
    trial.formadults_kondisi === 'Ada Kondisi Khusus' ||
    trial.formadults_riwayat === 'Ada' ||
    trial.formadults_cideraOperasi === 'Ada' ||
    trial.formadults_medisKhusus === 'Ada';

  const hasPhysicalAssessment = Boolean(
    trial.lower_body ||
    trial.core ||
    trial.upper_body ||
    trial.body_control ||
    trial.flexibility ||
    trial.agility ||
    trial.speed ||
    trial.integrity ||
    trial.principled ||
    trial.perseverance ||
    trial.believe_god ||
    trial.kekuatan_utama ||
    trial.rekomendasi_program
  );

  const isAssessmentCompleted = Boolean(
    hasPhysicalAssessment || trial.trial_status === 'Selesai Trial' || trial.trial_status === 'Member TCC'
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-sm">
              TR
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
                  Review Profil & Riwayat Medis Calon Member
                </h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  trial.Customer_type === 'Trial Kids'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                }`}>
                  {trial.Customer_type}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dokumen ID: <span className="font-mono font-semibold">{trial.MemberID}</span> · Disimpan pada {formatDisplayDate(trial.createdAt)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Main Action Callout for Coach: Mulai Asesmen Fisik Trial (Hanya ditampilkan jika BELUM selesai asesmen fisik) */}
          {!isAssessmentCompleted && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide flex items-center justify-center sm:justify-start gap-1.5">
                  <Play className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                  Asesmen Fisik Khusus Peserta Trial
                </span>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  Calon member ini belum melengkapi proses asesmen fisik. Klik tombol di samping untuk langsung memulai penilaian fisik & rekomendasi program latihan.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onStartTrialSession(trial)}
                className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-sm shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Mulai Asesmen Fisik</span>
              </button>
            </div>
          )}

          {/* Sesi & Jadwal Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase block mb-1">
                Hari & Tanggal Sesi
              </span>
              <div className="flex items-center gap-2 font-bold text-sm">
                <Calendar className="w-4 h-4 text-rose-500" />
                <span>{trial.Trial_Day || '-'}, {trial.Trial_Date ? formatDisplayDate(trial.Trial_Date) : 'Belum Dijadwalkan'}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase block mb-1">
                Waktu Sesi
              </span>
              <div className="flex items-center gap-2 font-bold text-sm">
                <Clock className="w-4 h-4 text-emerald-500" />
                <span>{trial.Trial_Time ? `${trial.Trial_Time} WIB` : 'Belum Ditentukan'}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase block mb-1">
                Pelatih Bertugas
              </span>
              <div className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">
                {trial.Coaches && trial.Coaches.length > 0 ? trial.Coaches.join(', ') : 'Belum Ditugaskan'}
              </div>
            </div>
          </div>

          {/* CRITICAL MEDICAL ALERT / SAFETY SCREENING */}
          <div className={`p-4 rounded-xl border ${
            hasHealthAlert
              ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
              : 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              {hasHealthAlert ? (
                <>
                  <AlertTriangle className="w-5 h-5 text-rose-600 animate-pulse" />
                  <h3 className="text-sm font-extrabold uppercase tracking-wide text-rose-900 dark:text-rose-200">
                    PERHATIAN MEDIS / RIWAYAT CEDERA (Wajib Diperhatikan Coach)
                  </h3>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-extrabold uppercase tracking-wide text-emerald-900 dark:text-emerald-200">
                    Riwayat Kesehatan Bersih (Tanpa Keluhan Khusus)
                  </h3>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                <span className="font-bold text-slate-500 dark:text-slate-400 block">Kondisi Kesehatan Saat Ini:</span>
                <span className={`font-semibold ${trial.formadults_kondisi === 'Ada Kondisi Khusus' ? 'text-rose-600 font-bold' : ''}`}>
                  {trial.formadults_kondisi}
                  {trial.formadults_kondisi_detail && ` — "${trial.formadults_kondisi_detail}"`}
                </span>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                <span className="font-bold text-slate-500 dark:text-slate-400 block">Riwayat Cedera:</span>
                <span className={`font-semibold ${trial.formadults_riwayat === 'Ada' ? 'text-rose-600 font-bold' : ''}`}>
                  {trial.formadults_riwayat}
                  {trial.formadults_riwayat_detail && ` — "${trial.formadults_riwayat_detail}"`}
                </span>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                <span className="font-bold text-slate-500 dark:text-slate-400 block">Operasi 12 Bulan Terakhir:</span>
                <span className={`font-semibold ${trial.formadults_cideraOperasi === 'Ada' ? 'text-rose-600 font-bold' : ''}`}>
                  {trial.formadults_cideraOperasi}
                  {trial.formadults_cideraOperasi_detail && ` — "${trial.formadults_cideraOperasi_detail}"`}
                </span>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                <span className="font-bold text-slate-500 dark:text-slate-400 block">Kondisi Medis Khusus / Alergi:</span>
                <span className={`font-semibold ${trial.formadults_medisKhusus === 'Ada' ? 'text-rose-600 font-bold' : ''}`}>
                  {trial.formadults_medisKhusus}
                  {trial.formadults_medisKhusus_detail && ` — "${trial.formadults_medisKhusus_detail}"`}
                </span>
              </div>

              {trial.formadults_catatan && (
                <div className="md:col-span-2 bg-white/90 dark:bg-slate-900/90 p-3 rounded-lg border border-amber-200 dark:border-amber-900/50 text-slate-800 dark:text-slate-200">
                  <span className="font-bold text-amber-700 dark:text-amber-400 block mb-0.5">Catatan Khusus Tambahan:</span>
                  <p className="italic">"{trial.formadults_catatan}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Identitas Calon Member & Kontak */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <h4 className="font-extrabold uppercase text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                Data Diri & Kontak
              </h4>
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama:</span>
                  <span className="font-bold">{trial.Full_Name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Gender / Umur:</span>
                  <span>{trial.Gender || '-'} · {trial.Umur !== null ? `${trial.Umur} th` : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tanggal Lahir:</span>
                  <span>{formatDisplayDate(trial.DoB)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">WhatsApp:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{trial.WhatsApp_Number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kontak Darurat:</span>
                  <span className="font-semibold text-rose-600">{trial.Emergency_Contact}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="truncate max-w-[180px]">{trial.Email || '-'}</span>
                </div>
              </div>
            </div>

            {/* Background Data */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <h4 className="font-extrabold uppercase text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 pb-1 flex items-center gap-1.5">
                {trial.Customer_type === 'Trial Kids' ? (
                  <>
                    <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
                    Pendidikan & Orang Tua / Wali
                  </>
                ) : (
                  <>
                    <Building className="w-3.5 h-3.5 text-indigo-500" />
                    Pekerjaan & Riwayat Olahraga
                  </>
                )}
              </h4>
              <div className="space-y-1.5 pt-1">
                {trial.Customer_type === 'Trial Kids' ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sekolah:</span>
                      <span className="font-semibold">{trial.nama_sekolah || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Kelas / Grade:</span>
                      <span>{trial.kelas_grade || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Ayah / No WA:</span>
                      <span>{trial.nama_ayah || '-'} ({trial.no_whatsapp_ayah || '-'})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Ibu / No WA:</span>
                      <span>{trial.nama_ibu || '-'} ({trial.no_whatsapp_ibu || '-'})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Klub Olahraga:</span>
                      <span>{trial.formakids_tergabung_dalamClub === 'YA' ? `Ya (${trial.formakids_cabang_olahraga})` : 'Tidak'}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pekerjaan:</span>
                      <span className="font-semibold">{trial.formadults_pekerjaan || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Perusahaan:</span>
                      <span>{trial.formadults_perusahaan || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Alamat Kantor:</span>
                      <span className="truncate max-w-[180px]">{trial.formadults_alamatKantor || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Komunitas Olahraga:</span>
                      <span>{trial.formadults_tergabung_dalamKlub === 'YA' ? `Ya (${trial.formadults_cabang_olahraga})` : 'Tidak'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Frekuensi Olahraga:</span>
                      <span>{trial.formadults_frek_Latihan || '-'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 4: ASESMEN FISIK & REKOMENDASI PROGRAM PELATIH */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  4
                </span>
                <h4 className="font-extrabold uppercase text-xs sm:text-sm tracking-wide text-slate-900 dark:text-white">
                  Hasil Asesmen Fisik Trial & Rekomendasi Program Pelatih
                </h4>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isAssessmentCompleted
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                {isAssessmentCompleted ? '✓ Selesai Dinilai' : 'Menunggu Sesi Coach'}
              </span>
            </div>

            {hasPhysicalAssessment ? (
              <div className="space-y-4 text-xs">
                {/* 1. Strength */}
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[11px]">
                      1. Strength Assessment (Skor 1 - 5)
                    </span>
                    <span className="font-mono font-bold text-emerald-600">
                      Rata-rata: {trial.avg_strength ?? '-'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-center">
                      <span className="text-[10px] text-slate-500 block">Lower Body</span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">{trial.lower_body ?? '-'}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-center">
                      <span className="text-[10px] text-slate-500 block">Core</span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">{trial.core ?? '-'}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-center">
                      <span className="text-[10px] text-slate-500 block">Upper Body</span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">{trial.upper_body ?? '-'}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Skills */}
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[11px]">
                      2. Skills Related Fitness - Running Lane (Skor 1 - 5)
                    </span>
                    <span className="font-mono font-bold text-sky-600">
                      Rata-rata: {trial.avg_skill ?? '-'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-center">
                      <span className="text-[10px] text-slate-500 block">Body Control</span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">{trial.body_control ?? '-'}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-center">
                      <span className="text-[10px] text-slate-500 block">Flexibility</span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">{trial.flexibility ?? '-'}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-center">
                      <span className="text-[10px] text-slate-500 block">Agility</span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">{trial.agility ?? '-'}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-center">
                      <span className="text-[10px] text-slate-500 block">Speed</span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">{trial.speed ?? '-'}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Evaluasi Karakter, Sikap & Etos Latihan */}
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[11px]">
                      3. Evaluasi Karakter, Sikap & Etos Latihan (Skor 1 - 5)
                    </span>
                    <span className="font-mono font-bold text-indigo-600">
                      Rata-rata: {trial.avg_character !== null && trial.avg_character !== undefined ? Number(trial.avg_character).toFixed(2) : '-'} / 5.00
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-center">
                      <span className="text-[10px] text-slate-500 block">Integritas</span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">{trial.integrity ?? '-'}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-center">
                      <span className="text-[10px] text-slate-500 block">Berprinsip</span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">{trial.principled ?? '-'}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-center">
                      <span className="text-[10px] text-slate-500 block">Daya Juang</span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">{trial.perseverance ?? '-'}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-center">
                      <span className="text-[10px] text-slate-500 block">Rasa Syukur</span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">{trial.believe_god ?? '-'}</span>
                    </div>
                  </div>
                </div>

                {/* DEDICATED SUMMARY BOX: TOTAL AVERAGE OVERALL (STRENGTH & SKILL RELATED FITNESS) */}
                {(() => {
                  const validAvgs = [trial.avg_strength, trial.avg_skill].filter(
                    (n): n is number => typeof n === 'number' && n > 0
                  );
                  const overallPhysicalAvg =
                    validAvgs.length > 0
                      ? Number((validAvgs.reduce((a, b) => a + b, 0) / validAvgs.length).toFixed(2))
                      : null;

                  const getOverallGrade = (avg: number | null) => {
                    if (avg === null) return 'Menunggu Sesi Asesmen';
                    if (avg >= 4.0) return 'EXCELLENT (SANGAT BAIK)';
                    if (avg >= 3.25) return 'GOOD (SOLID FOUNDATION)';
                    if (avg >= 2.5) return 'FAIR (NEED DEVELOPMENT)';
                    return 'BASIC FUNDAMENTAL LEVEL';
                  };

                  return (
                    <div className="bg-slate-950 text-white rounded-xl p-4 border border-slate-800 shadow-md">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-400 shrink-0" />
                            <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                              TOTAL AVERAGE OVERALL / SUMMARY (STRENGTH & SKILL)
                            </h4>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Kalkulasi performa gabungan dari sesi 1 (Strength) dan sesi 2 (Skills Running Lane) calon member.
                          </p>
                        </div>

                        <div className="text-left sm:text-right shrink-0">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">TOTAL OVERALL SCORE</span>
                          <span className="text-2xl font-black font-mono text-emerald-400 leading-none">
                            {overallPhysicalAvg !== null ? `${overallPhysicalAvg.toFixed(2)}` : '-.--'}
                            <span className="text-xs text-slate-400 font-normal"> / 5.00</span>
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                        <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                          <span className="text-[11px] text-slate-300 font-semibold">1. Summary Strength:</span>
                          <span className="font-bold font-mono text-emerald-400 text-xs">
                            {trial.avg_strength !== null && trial.avg_strength !== undefined ? `${trial.avg_strength.toFixed(2)}` : '-'} / 5.00
                          </span>
                        </div>

                        <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                          <span className="text-[11px] text-slate-300 font-semibold">2. Summary Skill:</span>
                          <span className="font-bold font-mono text-sky-400 text-xs">
                            {trial.avg_skill !== null && trial.avg_skill !== undefined ? `${trial.avg_skill.toFixed(2)}` : '-'} / 5.00
                          </span>
                        </div>

                        <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                          <span className="text-[11px] text-slate-300 font-semibold">Predikat Fisik:</span>
                          <span className="font-extrabold text-amber-300 text-[11px] truncate max-w-[150px]">
                            {getOverallGrade(overallPhysicalAvg)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 4. Rekomendasi Program Pelatih */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <span className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[11px] block border-b pb-1">
                    4. Catatan & Rekomendasi Program Pelatih
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] text-slate-500 block font-semibold">Kekuatan Utama:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{trial.kekuatan_utama || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block font-semibold">Area Perlu Dikembangkan:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{trial.perlu_develop || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block font-semibold">Kategori Performa:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{trial.cat_performance || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block font-semibold">Rekomendasi Program:</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{trial.rekomendasi_program || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : isAssessmentCompleted ? (
              <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-300">
                <p className="font-bold mb-0.5 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Asesmen Fisik Sesi Trial Telah Selesai
                </p>
                <p className="text-[11px] text-emerald-800/80 dark:text-emerald-400">
                  Seluruh tahapan trial peserta ini telah selesai diverifikasi oleh tim coach. Tidak diperlukan pengambilan data asesmen fisik ulang.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-300 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <p className="font-bold mb-0.5">Asesmen Fisik & Rekomendasi Program Belum Diisi</p>
                  <p className="text-[11px] text-amber-800/80 dark:text-amber-400">
                    Bagian ini diisi oleh Coach saat atau sesudah sesi trial berlangsung. Admin telah selesai melengkapi data Bagian 1 s/d 3.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onStartTrialSession(trial)}
                  className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Mulai Asesmen Fisik</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPrintConfirmation(trial)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Review Lengkap (PDF)</span>
            </button>

            <button
              type="button"
              onClick={() => onEditTrial(trial)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors shadow-2xs cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-sky-600" />
              <span>Edit Data Registrasi</span>
            </button>

            {onConvertToMember && trial.trial_status !== 'Member TCC' && (
              <button
                type="button"
                onClick={() => onConvertToMember(trial)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
                title="Customer memutuskan bergabung, upgrade menjadi MEMBER TCC"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Upgrade ke MEMBER TCC</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
