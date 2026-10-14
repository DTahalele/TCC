import React from 'react';
import { TrialRegistrationRecord } from '../types/trialRegistration';
import { TCCLogo } from './TCCLogo';
import { Printer, X, Copy, Check, Calendar, Clock, MapPin, AlertCircle, Phone, Mail } from 'lucide-react';

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
    return `*KONFIRMASI JADWAL SESI TRIAL - THE CORE CHAMBER* 🏋️‍♂️

Halo Kak *${trial.Full_Name}*,
Terima kasih telah mendaftar sesi Trial di The Core Chamber! Berikut adalah detail jadwal sesi Anda:

📌 *ID Peserta:* ${trial.MemberID}
📅 *Hari, Tanggal:* ${trial.Trial_Day || '-'}, ${trial.Trial_Date || '-'}
⏰ *Waktu/Jam:* ${trial.Trial_Time || '-'} WIB
👥 *Kategori:* ${trial.Customer_type}
${trial.Coaches && trial.Coaches.length > 0 ? `🏋️ *Coach Bertugas:* ${trial.Coaches.join(', ')}\n` : ''}
📍 *Lokasi:* The Core Chamber Studio

*Persiapan Sebelum Sesi:*
1. Mohon hadir 10-15 menit sebelum sesi dimulai untuk registrasi & persiapan.
2. Mengenakan pakaian & sepatu olahraga yang nyaman.
3. Membawa botol minum pribadi dan handuk kecil.

Jika ada perubahan jadwal, silakan hubungi tim kami via nomor ini. Sampai jumpa di sesi latihan! 💪

_The Core Chamber Team_`;
  };

  const handleCopyWhatsApp = () => {
    navigator.clipboard.writeText(generateWhatsAppMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative bg-white text-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
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
              <div className="inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                {trial.schedule_status === 'Confirmed' ? 'CONFIRMED' : 'PENDING SCHEDULE'}
              </div>
              <p className="text-xs font-bold text-slate-700 mt-1">{trial.Customer_type}</p>
            </div>
          </div>

          {/* Session Highlight Box */}
          <div className="bg-slate-50 border-2 border-slate-900 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-rose-600" />
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-900">
                Jadwal & Waktu Sesi Trial
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="block text-[11px] font-semibold text-slate-500 uppercase">Hari & Tanggal</span>
                <span className="font-bold text-base text-slate-900">
                  {trial.Trial_Day || '-'}, {trial.Trial_Date || 'Belum Ditentukan'}
                </span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="block text-[11px] font-semibold text-slate-500 uppercase">Waktu / Jam</span>
                <span className="font-bold text-base text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  {trial.Trial_Time ? `${trial.Trial_Time} WIB` : 'Belum Ditentukan'}
                </span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="block text-[11px] font-semibold text-slate-500 uppercase">Coach / Instruktur</span>
                <span className="font-bold text-sm text-slate-900">
                  {trial.Coaches && trial.Coaches.length > 0 ? trial.Coaches.join(', ') : 'Belum Ditugaskan'}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Profile & Emergency Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Details */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-1">
                Data Peserta
              </h3>
              <div className="text-xs space-y-1.5">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Nama Lengkap:</span>
                  <span className="font-bold text-slate-900">{trial.Full_Name || '-'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Gender / Umur:</span>
                  <span className="font-semibold text-slate-800">
                    {trial.Gender || '-'} · {trial.Umur !== null ? `${trial.Umur} Tahun` : '-'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">WhatsApp:</span>
                  <span className="font-semibold text-slate-800">{trial.WhatsApp_Number || '-'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Email:</span>
                  <span className="text-slate-800">{trial.Email || '-'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Kontak Darurat:</span>
                  <span className="font-semibold text-rose-700">{trial.Emergency_Contact || '-'}</span>
                </div>
              </div>
            </div>

            {/* School / Work / Parents Background */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-1">
                {trial.Customer_type === 'Trial Kids' ? 'Data Sekolah & Orang Tua' : 'Pekerjaan & Riwayat Olahraga'}
              </h3>
              <div className="text-xs space-y-1.5">
                {trial.Customer_type === 'Trial Kids' ? (
                  <>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Sekolah / Grade:</span>
                      <span className="font-semibold text-slate-800">
                        {trial.nama_sekolah || '-'} ({trial.kelas_grade || '-'})
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Nama Ayah / No WA:</span>
                      <span className="font-semibold text-slate-800">
                        {trial.nama_ayah || '-'} ({trial.no_whatsapp_ayah || '-'})
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Nama Ibu / No WA:</span>
                      <span className="font-semibold text-slate-800">
                        {trial.nama_ibu || '-'} ({trial.no_whatsapp_ibu || '-'})
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Klub Olahraga:</span>
                      <span className="text-slate-800">
                        {trial.formakids_tergabung_dalamClub === 'YA'
                          ? `Ya, ${trial.formakids_cabang_olahraga || ''}`
                          : 'Tidak'}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Pekerjaan:</span>
                      <span className="font-semibold text-slate-800">{trial.formadults_pekerjaan || '-'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Perusahaan:</span>
                      <span className="text-slate-800">{trial.formadults_perusahaan || '-'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Komunitas / Klub:</span>
                      <span className="text-slate-800">
                        {trial.formadults_tergabung_dalamKlub === 'YA'
                          ? `Ya, ${trial.formadults_cabang_olahraga || ''}`
                          : 'Tidak'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Frekuensi Latihan:</span>
                      <span className="text-slate-800">{trial.formadults_frek_Latihan || '-'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Medical & Safety Notes Box */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
            <div className="flex items-center gap-2 mb-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Ringkasan Riwayat Kesehatan / Catatan Pelatih</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-amber-950">
              <div>
                <span className="font-semibold">Kondisi Kesehatan: </span>
                {trial.formadults_kondisi === 'Ada Kondisi Khusus' ? trial.formadults_kondisi_detail || 'Ada' : 'Sehat'}
              </div>
              <div>
                <span className="font-semibold">Riwayat Cedera: </span>
                {trial.formadults_riwayat === 'Ada' ? trial.formadults_riwayat_detail || 'Ada' : 'Tidak Ada'}
              </div>
              {trial.formadults_catatan && (
                <div className="sm:col-span-2 text-[11px] italic bg-white/70 p-2 rounded border border-amber-200/60">
                  <span className="font-bold">Catatan Khusus: </span>
                  "{trial.formadults_catatan}"
                </div>
              )}
            </div>
          </div>

          {/* Preparation Instructions */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1.5 text-slate-700">
            <span className="font-bold text-slate-900 uppercase block mb-1">
              Petunjuk Kehadiran Sesi:
            </span>
            <ul className="list-disc list-inside space-y-1 text-[11px]">
              <li>Hadir 10-15 menit lebih awal sebelum sesi untuk pemanasan mandiri & persiapan.</li>
              <li>Wajib mengenakan pakaian olahraga yang nyaman dan sepatu olahraga tertutup.</li>
              <li>Membawa botol air minum pribadi dan handuk olahraga kecil.</li>
            </ul>
          </div>

          {/* Signature Area */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs">
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
              <p className="text-[10px] text-slate-400 uppercase font-semibold mb-10">Admin Pendaftar</p>
              <div className="border-t border-slate-300 pt-1 font-bold text-slate-800">
                {trial.signature_admin || '( Admin TCC )'}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold mb-10">TCC Coordinator</p>
              <div className="border-t border-slate-300 pt-1 font-bold text-slate-800">
                {trial.signature_coordinator || '( Coordinator )'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
