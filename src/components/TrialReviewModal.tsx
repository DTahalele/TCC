import React from 'react';
import { TrialRegistrationRecord } from '../types/trialRegistration';
import { Play, Printer, Edit3, X, Calendar, Clock, AlertTriangle, ShieldCheck, Heart, User, Building, GraduationCap, CheckCircle } from 'lucide-react';

interface TrialReviewModalProps {
  trial: TrialRegistrationRecord;
  isOpen: boolean;
  onClose: () => void;
  onStartTrialSession: (trial: TrialRegistrationRecord) => void;
  onPrintConfirmation: (trial: TrialRegistrationRecord) => void;
  onEditTrial: (trial: TrialRegistrationRecord) => void;
}

export const TrialReviewModal: React.FC<TrialReviewModalProps> = ({
  trial,
  isOpen,
  onClose,
  onStartTrialSession,
  onPrintConfirmation,
  onEditTrial,
}) => {
  if (!isOpen) return null;

  const hasHealthAlert =
    trial.formadults_kondisi === 'Ada Kondisi Khusus' ||
    trial.formadults_riwayat === 'Ada' ||
    trial.formadults_cideraOperasi === 'Ada' ||
    trial.formadults_medisKhusus === 'Ada';

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
                Dokumen ID: <span className="font-mono font-semibold">{trial.MemberID}</span> · Disimpan pada {new Date(trial.createdAt).toLocaleDateString('id-ID')}
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
          {/* Main Action Callout for Coach: Mulai Sesi Trial */}
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide flex items-center justify-center sm:justify-start gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Siap untuk Asesmen Fisik?
              </span>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Klik tombol di samping untuk langsung membuka form <strong>Physical Fitness Score Card</strong>. Nama, DoB, Gender, dan Kategori Trial akan otomatis terisi!
              </p>
            </div>

            <button
              type="button"
              onClick={() => onStartTrialSession(trial)}
              className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-sm shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Mulai Sesi Trial</span>
            </button>
          </div>

          {/* Sesi & Jadwal Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase block mb-1">
                Hari & Tanggal Sesi
              </span>
              <div className="flex items-center gap-2 font-bold text-sm">
                <Calendar className="w-4 h-4 text-rose-500" />
                <span>{trial.Trial_Day || '-'}, {trial.Trial_Date || 'Belum Dijadwalkan'}</span>
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
                  <span>{trial.DoB || '-'}</span>
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
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPrintConfirmation(trial)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Konfirmasi (PDF)</span>
            </button>

            <button
              type="button"
              onClick={() => onEditTrial(trial)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors shadow-2xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-sky-600" />
              <span>Edit Data / Jadwal</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
