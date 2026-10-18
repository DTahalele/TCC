import React, { useState } from 'react';
import { TrialRegistrationRecord } from '../types/trialRegistration';
import { TCCLogo } from './TCCLogo';
import { PrintFooter } from './PrintFooter';
import {
  Printer,
  X,
  Copy,
  Check,
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  Award,
  CheckCircle2,
  User,
} from 'lucide-react';

interface TrialConfirmationPrintViewProps {
  trial: TrialRegistrationRecord;
  onClose: () => void;
}

export const TrialConfirmationPrintView: React.FC<TrialConfirmationPrintViewProps> = ({
  trial,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handlePrint = () => {
    window.print();
  };

  const generateWhatsAppMessage = () => {
    const coachNames = trial.Coaches && trial.Coaches.length > 0 ? trial.Coaches.join(', ') : '-';
    const timeStr = trial.Trial_Time ? `${trial.Trial_Time} WIB` : '-';
    return `*INITIAL ASSESSMENT - THE CORE CHAMBER* 🏋️‍♂️

Halo Kak *${trial.Full_Name || '-'}*,
Terima kasih telah mengikuti sesi Trial di The Core Chamber! Berikut kami lampirkan hasil initial assessment sesi trial Anda:

📌 *ID Peserta:* ${trial.MemberID}
📅 *Hari, Tanggal:* ${trial.Trial_Day || '-'}, ${trial.Trial_Date || '-'}
⏰ *Waktu/Jam:* ${timeStr}
👥 *Kategori:* ${trial.Customer_type}
🏋️ *Coach Bertugas:* ${coachNames}

📍 *Lokasi:* The Core Chamber Studio

Jika ada pertanyaan lanjutan, silakan hubungi tim kami via nomor ini. Sampai jumpa di sesi latihan! 💪

_The Core Chamber Team_`;
  };

  const handleCopyWhatsApp = () => {
    navigator.clipboard.writeText(generateWhatsAppMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:static print:bg-white print:overflow-visible print:block print-container">
      <div className="relative bg-white text-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto print:border-none print:shadow-none print:max-w-none print:w-full print:rounded-none">
        {/* Floating Screen Controls (Hidden during print) */}
        <div className="sticky top-0 z-20 bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-sm">Lembar Konfirmasi Sesi & Registrasi Trial</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
              title="Salin Pesan Teks untuk WhatsApp"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin Pesan WA'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold transition-all shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-800" />
              <span>Cetak / Simpan PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-10 space-y-6 text-slate-900 font-sans print:p-8">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-slate-950 p-1.5 flex items-center justify-center shrink-0">
                <TCCLogo className="w-full h-full text-white" variant="full" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase">
                  THE <span className="text-rose-600">CORE</span> CHAMBER
                </h1>
                <p className="text-xs font-bold tracking-widest text-slate-600 uppercase">
                  TRIAL SESSION CONFIRMATION & REGISTRATION RECORD
                </p>
                <p className="text-[10px] text-slate-500">
                  Document ID: {trial.MemberID} · Generated on {new Date().toLocaleDateString('id-ID')}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-300">
                {trial.Customer_type}
              </span>
            </div>
          </div>

          {/* SECTION 1: JADWAL & IDENTITAS PESERTA */}
          <div className="bg-slate-50 border-2 border-slate-900 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-2">
              <Calendar className="w-4 h-4 text-rose-600 shrink-0" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                1. IDENTITAS PESERTA & JADWAL SESI TRIAL
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="block text-[10px] font-bold text-slate-500 uppercase">Hari & Tanggal</span>
                <span className="font-extrabold text-sm text-slate-900">
                  {trial.Trial_Day || '-'}, {trial.Trial_Date || 'Belum Ditentukan'}
                </span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="block text-[10px] font-bold text-slate-500 uppercase">Waktu / Jam</span>
                <span className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  {trial.Trial_Time ? `${trial.Trial_Time} WIB` : 'Belum Ditentukan'}
                </span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="block text-[10px] font-bold text-slate-500 uppercase">Coach / Instruktur</span>
                <span className="font-extrabold text-sm text-slate-900">
                  {trial.Coaches && trial.Coaches.length > 0 ? trial.Coaches.join(', ') : 'Belum Ditugaskan'}
                </span>
              </div>
            </div>

            {/* Identitas Personal Peserta */}
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="block text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100 pb-1 mb-2">
                Data Diri Calon Member
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Nama Lengkap:</span>
                  <span className="font-bold text-slate-900">{trial.Full_Name || '-'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Gender / Umur:</span>
                  <span className="font-semibold text-slate-800">
                    {trial.Gender || '-'} · {trial.Umur !== null && trial.Umur !== undefined ? `${trial.Umur} Tahun` : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">WhatsApp:</span>
                  <span className="font-semibold text-emerald-700">{trial.WhatsApp_Number || '-'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Kontak Darurat:</span>
                  <span className="font-semibold text-rose-700">{trial.Emergency_Contact || '-'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: LATAR BELAKANG SEKOLAH / PEKERJAAN & AKTIVITAS OLAHRAGA */}
          <div className="bg-slate-50 border-2 border-slate-900 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-2">
              <User className="w-4 h-4 text-indigo-600 shrink-0" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                {trial.Customer_type === 'Trial Kids'
                  ? '2. LATAR BELAKANG SEKOLAH, ORANG TUA & AKTIVITAS OLAHRAGA'
                  : '2. PEKERJAAN, PERUSAHAAN & RIWAYAT AKTIVITAS OLAHRAGA'}
              </h2>
            </div>

            <div className="text-xs">
              {trial.Customer_type === 'Trial Kids' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Sekolah / Grade:</span>
                    <span className="font-semibold text-slate-900">
                      {trial.nama_sekolah || '-'} ({trial.kelas_grade || '-'})
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Nama Ayah / WA:</span>
                    <span className="font-semibold text-slate-800">
                      {trial.nama_ayah || '-'} {trial.no_whatsapp_ayah ? `(${trial.no_whatsapp_ayah})` : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Nama Ibu / WA:</span>
                    <span className="font-semibold text-slate-800">
                      {trial.nama_ibu || '-'} {trial.no_whatsapp_ibu ? `(${trial.no_whatsapp_ibu})` : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Klub / Frekuensi:</span>
                    <span className="text-slate-800">
                      {trial.formakids_tergabung_dalamClub === 'YA'
                        ? `${trial.formakids_cabang_olahraga || 'Klub'} (${trial.formakids_frek_Latihan || '-'})`
                        : 'Belum Ada'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Pekerjaan:</span>
                    <span className="font-bold text-slate-900">{trial.formadults_pekerjaan || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Perusahaan:</span>
                    <span className="text-slate-800">{trial.formadults_perusahaan || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Klub / Cabang Olahraga:</span>
                    <span className="text-slate-800">
                      {trial.formadults_tergabung_dalamKlub === 'YA'
                        ? `Ya, ${trial.formadults_cabang_olahraga || ''}`
                        : 'Tidak Tergabung'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Frekuensi Latihan:</span>
                    <span className="font-semibold text-slate-800">{trial.formadults_frek_Latihan || '-'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: SKRINING RIWAYAT KESEHATAN, CEDERA & MEDIS */}
          <div className="bg-slate-50 border-2 border-slate-900 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                3. SKRINING RIWAYAT KESEHATAN, CEDERA & MEDIS (SCREENING)
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Kondisi Kesehatan Saat Ini:</span>
                <span className={`font-semibold text-slate-900 ${trial.formadults_kondisi === 'Ada Kondisi Khusus' ? 'text-rose-600 font-bold' : ''}`}>
                  {trial.formadults_kondisi || 'Sehat'}
                  {trial.formadults_kondisi_detail && ` — "${trial.formadults_kondisi_detail}"`}
                </span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Riwayat Cedera:</span>
                <span className={`font-semibold text-slate-900 ${trial.formadults_riwayat === 'Ada' ? 'text-rose-600 font-bold' : ''}`}>
                  {trial.formadults_riwayat || 'Tidak Ada'}
                  {trial.formadults_riwayat_detail && ` — "${trial.formadults_riwayat_detail}"`}
                </span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Operasi / Rawat Inap (12 Bulan):</span>
                <span className={`font-semibold text-slate-900 ${trial.formadults_cideraOperasi === 'Ada' ? 'text-rose-600 font-bold' : ''}`}>
                  {trial.formadults_cideraOperasi || 'Tidak Ada'}
                  {trial.formadults_cideraOperasi_detail && ` — "${trial.formadults_cideraOperasi_detail}"`}
                </span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Kondisi Medis Khusus / Alergi:</span>
                <span className={`font-semibold text-slate-900 ${trial.formadults_medisKhusus === 'Ada' ? 'text-rose-600 font-bold' : ''}`}>
                  {trial.formadults_medisKhusus || 'Tidak Ada'}
                  {trial.formadults_medisKhusus_detail && ` — "${trial.formadults_medisKhusus_detail}"`}
                </span>
              </div>

              {trial.formadults_catatan && (
                <div className="md:col-span-2 bg-amber-50/80 p-3 rounded-lg border border-amber-200 text-slate-800">
                  <span className="text-[10px] uppercase font-bold text-amber-900 block mb-0.5">Catatan Khusus untuk Pelatih:</span>
                  <p className="italic font-medium text-xs">"{trial.formadults_catatan}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Physical Assessment & Coach Recommendations */}
          <div className="rounded-xl border-2 border-slate-900 p-4 space-y-3 bg-slate-50/50">
            <div className="border-b-2 border-slate-900 pb-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                4. HASIL ASESMEN FISIK TRIAL & PROGRAM REKOMENDASI PELATIH
              </h2>
            </div>

            {/* Assessment Scores Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* 1. Strength */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                  <span className="font-extrabold text-[11px] text-slate-900 uppercase">1. STRENGTH ASSESSMENT (1 - 5)</span>
                  <span className="font-mono font-bold text-xs bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                    Summary Avg: {trial.avg_strength !== null && trial.avg_strength !== undefined ? `${trial.avg_strength.toFixed(2)}` : '-'} / 5.00
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="p-2 bg-slate-50 rounded border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">Lower Body</span>
                    <span className="text-sm font-bold text-slate-900">{trial.lower_body ?? '-'}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">Core</span>
                    <span className="text-sm font-bold text-slate-900">{trial.core ?? '-'}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">Upper Body</span>
                    <span className="text-sm font-bold text-slate-900">{trial.upper_body ?? '-'}</span>
                  </div>
                </div>
              </div>

              {/* 2. Skills Running Lane */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                  <span className="font-extrabold text-[11px] text-slate-900 uppercase">2. SKILLS RELATED FITNESS (1 - 5)</span>
                  <span className="font-mono font-bold text-xs bg-sky-50 text-sky-800 px-2 py-0.5 rounded border border-sky-200">
                    Summary Avg: {trial.avg_skill !== null && trial.avg_skill !== undefined ? `${trial.avg_skill.toFixed(2)}` : '-'} / 5.00
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 text-center text-[11px]">
                  <div className="p-1.5 bg-slate-50 rounded border border-slate-100">
                    <span className="text-[9px] text-slate-500 block truncate">Body Control</span>
                    <span className="text-sm font-bold text-slate-900">{trial.body_control ?? '-'}</span>
                  </div>
                  <div className="p-1.5 bg-slate-50 rounded border border-slate-100">
                    <span className="text-[9px] text-slate-500 block truncate">Flexibility</span>
                    <span className="text-sm font-bold text-slate-900">{trial.flexibility ?? '-'}</span>
                  </div>
                  <div className="p-1.5 bg-slate-50 rounded border border-slate-100">
                    <span className="text-[9px] text-slate-500 block truncate">Agility</span>
                    <span className="text-sm font-bold text-slate-900">{trial.agility ?? '-'}</span>
                  </div>
                  <div className="p-1.5 bg-slate-50 rounded border border-slate-100">
                    <span className="text-[9px] text-slate-500 block truncate">Speed</span>
                    <span className="text-sm font-bold text-slate-900">{trial.speed ?? '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Evaluasi Sikap & Karakter */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                <span className="font-extrabold text-[11px] text-slate-900 uppercase">3. EVALUASI SIKAP & KARAKTER (1 - 5)</span>
                <span className="font-mono font-bold text-xs bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded border border-indigo-200">
                  Summary Avg: {trial.avg_character !== null && trial.avg_character !== undefined ? `${trial.avg_character.toFixed(2)}` : '-'} / 5.00
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                <div className="p-2 bg-slate-50 rounded border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">Integritas</span>
                  <span className="text-sm font-bold text-slate-900">{trial.integrity ?? '-'}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">Berprinsip</span>
                  <span className="text-sm font-bold text-slate-900">{trial.principled ?? '-'}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">Daya Juang</span>
                  <span className="text-sm font-bold text-slate-900">{trial.perseverance ?? '-'}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">Rasa Syukur</span>
                  <span className="text-sm font-bold text-slate-900">{trial.believe_god ?? '-'}</span>
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
                <div className="bg-slate-950 text-white rounded-xl p-4 border-2 border-slate-900 shadow-xs print:bg-slate-950 print:text-white">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-400 shrink-0" />
                        <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                          TOTAL AVERAGE OVERALL / SUMMARY (STRENGTH & SKILL RELATED FITNESS)
                        </h3>
                      </div>
                      <p className="text-[10px] text-slate-300 mt-0.5">
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

            {/* Coach Recommendations Box */}
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 text-xs space-y-2">
              <span className="font-bold text-slate-900 uppercase text-[11px] block border-b border-slate-200 pb-1">
                4. REKOMENDASI PROGRAM & KESIMPULAN PELATIH
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="font-semibold text-slate-500 text-[10px] uppercase block">Kekuatan Utama Peserta:</span>
                  <span className="font-bold text-slate-900 text-xs">{trial.kekuatan_utama || '-'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 text-[10px] uppercase block">Area Perlu Dikembangkan:</span>
                  <span className="font-bold text-slate-900 text-xs">{trial.perlu_develop || '-'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 text-[10px] uppercase block">Kategori Performa:</span>
                  <span className="font-extrabold text-emerald-700 text-xs">{trial.cat_performance || '-'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 text-[10px] uppercase block">Rekomendasi Program Latihan:</span>
                  <span className="font-extrabold text-indigo-700 text-xs">{trial.rekomendasi_program || '-'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Signature Area */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold mb-10">Coach / Instruktur 1</p>
              <div className="border-t border-slate-300 pt-1 font-bold text-slate-800">
                {trial.Coaches && trial.Coaches[0] ? trial.Coaches[0] : '( ........................ )'}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold mb-10">Coach / Instruktur 2</p>
              <div className="border-t border-slate-300 pt-1 font-bold text-slate-800">
                {trial.Coaches && trial.Coaches[1] ? trial.Coaches[1] : '( ........................ )'}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold mb-10">TCC Coordinator</p>
              <div className="border-t border-slate-300 pt-1 font-bold text-slate-800">
                {trial.signature_coordinator || '( Coordinator )'}
              </div>
            </div>
          </div>

          {/* Centered Brand, Logo & Contact Footer */}
          <PrintFooter />
        </div>
      </div>
    </div>
  );
};
