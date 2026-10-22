import React, { useState, useMemo, useEffect } from 'react';
import jsPDF from 'jspdf';
import { TrialRegistrationRecord } from '../types/trialRegistration';
import { TCCLogo } from './TCCLogo';
import { PrintFooter } from './PrintFooter';
import { DisclaimerSection } from './DisclaimerSection';
import { formatDisplayDate } from '../utils/dateFormatter';
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
  Download,
  ExternalLink,
  Smartphone,
} from 'lucide-react';

interface TrialConfirmationPrintViewProps {
  trial: TrialRegistrationRecord;
  onClose: () => void;
}

interface DownloadNotificationState {
  isOpen: boolean;
  status: 'ready' | 'downloading' | 'success' | 'error';
  title: string;
  message: string;
  blobUrl?: string;
  fileName?: string;
}

export const TrialConfirmationPrintView: React.FC<TrialConfirmationPrintViewProps> = ({
  trial,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [hasJustDownloaded, setHasJustDownloaded] = useState(false);

  // Cached pre-generated PDF for 0-second instant downloads
  const [cachedPdf, setCachedPdf] = useState<{
    blob: Blob;
    url: string;
    fileName: string;
    pdfInstance: jsPDF;
  } | null>(null);

  // Mobile Notification Toast State
  const [notification, setNotification] = useState<DownloadNotificationState>({
    isOpen: false,
    status: 'ready',
    title: '',
    message: '',
  });

  const cleanMemberId = useMemo(() => {
    return (trial.MemberID || 'TCC-TRIAL').replace(/[^a-zA-Z0-9_-]/g, '_');
  }, [trial.MemberID]);

  const cleanName = useMemo(() => {
    return (trial.Full_Name || 'Peserta').replace(/[^a-zA-Z0-9_-]/g, '_');
  }, [trial.Full_Name]);

  const cleanType = useMemo(() => {
    return (trial.Customer_type || 'Trial').replace(/\s+/g, '_');
  }, [trial.Customer_type]);

  const defaultFileName = useMemo(() => {
    return `Konfirmasi_${cleanType}_${cleanMemberId}_${cleanName}.pdf`;
  }, [cleanType, cleanMemberId, cleanName]);

  // Ultra-fast vector A4 PDF Generator for Trial Adults and Trial Kids (< 25ms)
  const buildTrialPDF = (t: TrialRegistrationRecord): jsPDF => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const margin = 10;
    const pageWidth = 210;
    const contentWidth = pageWidth - margin * 2; // 190mm
    let y = 11;

    // Helper for page break
    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > 280) {
        pdf.addPage();
        y = 12;
      }
    };

    // --- 1. HEADER LEMBAR RESMI TRIAL ---
    pdf.setFillColor(15, 23, 42); // slate-900
    pdf.rect(margin, y, 11, 11, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TCC', margin + 2.5, y + 7.5);

    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('THE ', margin + 14, y + 5);
    pdf.setTextColor(220, 38, 38);
    pdf.text('CORE ', margin + 24.5, y + 5);
    pdf.setTextColor(15, 23, 42);
    pdf.text('CHAMBER', margin + 39, y + 5);

    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 41, 59);
    pdf.text('TRIAL SESSION CONFIRMATION & REGISTRATION RECORD', margin + 14, y + 9);

    pdf.setFontSize(6.5);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Document ID: ${t.MemberID} · Generated on ${formatDisplayDate(new Date())}`, margin + 14, y + 12);

    // Right Box: Customer Type Badge
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.4);
    pdf.setFillColor(248, 250, 252);
    pdf.rect(pageWidth - margin - 38, y, 38, 8, 'FD');
    pdf.setFontSize(8.5);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text(t.Customer_type || 'Trial', pageWidth - margin - 19, y + 5.5, { align: 'center' });

    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(5, 150, 105);
    pdf.text(`STATUS: ${t.schedule_status || 'Terkonfirmasi'}`, pageWidth - margin, y + 11.5, { align: 'right' });

    y += 16;
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.6);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 3;

    // --- 2. SECTION 1: IDENTITAS PESERTA & JADWAL SESI TRIAL ---
    pdf.setFillColor(30, 41, 59);
    pdf.rect(margin, y, contentWidth, 5, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'bold');
    pdf.text('1. IDENTITAS PESERTA & JADWAL SESI TRIAL', margin + 2.5, y + 3.5);
    y += 5;

    // Jadwal Box: 3 Cols (Hari & Tgl, Jam, Coach)
    const jColW = contentWidth / 3;
    pdf.setDrawColor(203, 213, 225);
    pdf.setFillColor(248, 250, 252);
    pdf.rect(margin, y, contentWidth, 8, 'FD');

    pdf.setTextColor(100, 116, 139);
    pdf.setFontSize(5.5);
    pdf.setFont('helvetica', 'bold');
    pdf.text('HARI & TANGGAL:', margin + 2.5, y + 3);
    pdf.text('WAKTU / JAM:', margin + jColW + 2.5, y + 3);
    pdf.text('COACH BERTUGAS:', margin + jColW * 2 + 2.5, y + 3);

    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${t.Trial_Day || '-'}, ${t.Trial_Date ? formatDisplayDate(t.Trial_Date) : 'Belum Ditentukan'}`, margin + 2.5, y + 6.5);
    pdf.text(t.Trial_Time ? `${t.Trial_Time} WIB` : 'Belum Ditentukan', margin + jColW + 2.5, y + 6.5);
    pdf.text(t.Coaches && t.Coaches.length > 0 ? t.Coaches.join(', ').slice(0, 28) : 'Belum Ditugaskan', margin + jColW * 2 + 2.5, y + 6.5);
    y += 9;

    // Data Diri Calon Member Box: 6 cols
    pdf.setDrawColor(203, 213, 225);
    pdf.setFillColor(255, 255, 255);
    pdf.rect(margin, y, contentWidth, 10, 'FD');

    const dColW = contentWidth / 6;
    pdf.setTextColor(100, 116, 139);
    pdf.setFontSize(5.5);
    pdf.setFont('helvetica', 'bold');
    pdf.text('NAMA LENGKAP:', margin + 2, y + 3.5);
    pdf.text('GENDER / UMUR:', margin + dColW + 2, y + 3.5);
    pdf.text('TANGGAL LAHIR:', margin + dColW * 2 + 2, y + 3.5);
    pdf.text('EMAIL:', margin + dColW * 3 + 2, y + 3.5);
    pdf.text('WHATSAPP:', margin + dColW * 4 + 2, y + 3.5);
    pdf.text('KONTAK DARURAT:', margin + dColW * 5 + 2, y + 3.5);

    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.text((t.Full_Name || '-').slice(0, 18), margin + 2, y + 7.5);
    pdf.text(`${t.Gender || '-'} · ${t.Umur !== null && t.Umur !== undefined ? `${t.Umur} th` : '-'}`, margin + dColW + 2, y + 7.5);
    pdf.text(t.DoB ? formatDisplayDate(t.DoB) : '-', margin + dColW * 2 + 2, y + 7.5);
    pdf.text((t.Email || '-').slice(0, 16), margin + dColW * 3 + 2, y + 7.5);
    pdf.setTextColor(5, 150, 105);
    pdf.text((t.WhatsApp_Number || '-').slice(0, 14), margin + dColW * 4 + 2, y + 7.5);
    pdf.setTextColor(220, 38, 38);
    pdf.text((t.Emergency_Contact || '-').slice(0, 14), margin + dColW * 5 + 2, y + 7.5);
    y += 12;

    // --- 3. SECTION 2: LATAR BELAKANG ---
    pdf.setFillColor(30, 41, 59);
    pdf.rect(margin, y, contentWidth, 5, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'bold');
    const sec2Title =
      t.Customer_type === 'Trial Kids'
        ? '2. LATAR BELAKANG SEKOLAH, ORANG TUA & AKTIVITAS OLAHRAGA'
        : '2. PEKERJAAN, PERUSAHAAN & RIWAYAT AKTIVITAS OLAHRAGA';
    pdf.text(sec2Title, margin + 2.5, y + 3.5);
    y += 5;

    pdf.setDrawColor(203, 213, 225);
    pdf.setFillColor(255, 255, 255);
    pdf.rect(margin, y, contentWidth, 10, 'FD');

    if (t.Customer_type === 'Trial Kids') {
      const kColW = contentWidth / 4;
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(5.5);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SEKOLAH & KELAS:', margin + 2, y + 3.5);
      pdf.text('NAMA AYAH / IBU:', margin + kColW + 2, y + 3.5);
      pdf.text('EMAIL ORANG TUA:', margin + kColW * 2 + 2, y + 3.5);
      pdf.text('KLUB & OLAHRAGA:', margin + kColW * 3 + 2, y + 3.5);

      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${t.nama_sekolah || '-'} (${t.kelas_grade || '-'})`.slice(0, 24), margin + 2, y + 7.5);
      pdf.text(`${t.nama_ayah || t.nama_ibu || '-'}`.slice(0, 22), margin + kColW + 2, y + 7.5);
      pdf.text((t.email_orangTua || '-').slice(0, 22), margin + kColW * 2 + 2, y + 7.5);
      pdf.text(
        t.formakids_tergabung_dalamClub === 'YA'
          ? `Ya, ${t.formakids_cabang_olahraga || 'Klub'}`.slice(0, 22)
          : 'Tidak Tergabung',
        margin + kColW * 3 + 2,
        y + 7.5
      );
    } else {
      const aColW = contentWidth / 4;
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(5.5);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PEKERJAAN & PERUSAHAAN:', margin + 2, y + 3.5);
      pdf.text('ALAMAT KANTOR:', margin + aColW + 2, y + 3.5);
      pdf.text('KLUB / CABANG OLAHRAGA:', margin + aColW * 2 + 2, y + 3.5);
      pdf.text('AKTIF & FREKUENSI:', margin + aColW * 3 + 2, y + 3.5);

      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${t.formadults_pekerjaan || '-'} (${t.formadults_perusahaan || '-'})`.slice(0, 24), margin + 2, y + 7.5);
      pdf.text((t.formadults_alamatKantor || '-').slice(0, 22), margin + aColW + 2, y + 7.5);
      pdf.text(
        t.formadults_tergabung_dalamKlub === 'YA'
          ? `Ya, ${t.formadults_cabang_olahraga || 'Klub'}`.slice(0, 22)
          : 'Tidak Tergabung',
        margin + aColW * 2 + 2,
        y + 7.5
      );
      pdf.text(`${t.formadults_aktif_olahraga || 'YA'} (${t.formadults_frek_Latihan || '-'})`.slice(0, 22), margin + aColW * 3 + 2, y + 7.5);
    }
    y += 12;

    // --- 4. SECTION 3: SKRINING KESEHATAN, CEDERA & MEDIS ---
    pdf.setFillColor(30, 41, 59);
    pdf.rect(margin, y, contentWidth, 5, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'bold');
    pdf.text('3. SKRINING RIWAYAT KESEHATAN, CEDERA & MEDIS (SCREENING)', margin + 2.5, y + 3.5);
    y += 5;

    pdf.setDrawColor(203, 213, 225);
    pdf.setFillColor(248, 250, 252);
    pdf.rect(margin, y, contentWidth, 12, 'FD');

    const sColW = contentWidth / 4;
    pdf.setTextColor(100, 116, 139);
    pdf.setFontSize(5.5);
    pdf.setFont('helvetica', 'bold');
    pdf.text('KONDISI KESEHATAN:', margin + 2, y + 3.5);
    pdf.text('RIWAYAT CEDERA:', margin + sColW + 2, y + 3.5);
    pdf.text('OPERASI / RAWAT INAP:', margin + sColW * 2 + 2, y + 3.5);
    pdf.text('MEDIS KHUSUS / ALERGI:', margin + sColW * 3 + 2, y + 3.5);

    pdf.setFontSize(6.5);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(t.formadults_kondisi === 'Ada Kondisi Khusus' ? 220 : 15, t.formadults_kondisi === 'Ada Kondisi Khusus' ? 38 : 23, t.formadults_kondisi === 'Ada Kondisi Khusus' ? 38 : 42);
    pdf.text((t.formadults_kondisi || 'Sehat').slice(0, 22), margin + 2, y + 7.5);

    pdf.setTextColor(t.formadults_riwayat === 'Ada' ? 220 : 15, t.formadults_riwayat === 'Ada' ? 38 : 23, t.formadults_riwayat === 'Ada' ? 38 : 42);
    pdf.text((t.formadults_riwayat || 'Tidak Ada').slice(0, 22), margin + sColW + 2, y + 7.5);

    pdf.setTextColor(t.formadults_cideraOperasi === 'Ada' ? 220 : 15, t.formadults_cideraOperasi === 'Ada' ? 38 : 23, t.formadults_cideraOperasi === 'Ada' ? 38 : 42);
    pdf.text((t.formadults_cideraOperasi || 'Tidak Ada').slice(0, 22), margin + sColW * 2 + 2, y + 7.5);

    pdf.setTextColor(t.formadults_medisKhusus === 'Ada' ? 220 : 15, t.formadults_medisKhusus === 'Ada' ? 38 : 23, t.formadults_medisKhusus === 'Ada' ? 38 : 42);
    pdf.text((t.formadults_medisKhusus || 'Tidak Ada').slice(0, 22), margin + sColW * 3 + 2, y + 7.5);

    if (t.formadults_catatan) {
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(5.5);
      pdf.setTextColor(146, 64, 14);
      pdf.text(`Catatan Medis: "${t.formadults_catatan.slice(0, 110)}"`, margin + 2, y + 10.5);
    }
    y += 14;

    // --- 5. SECTION 4: HASIL ASESMEN FISIK TRIAL & REKOMENDASI ---
    checkPageBreak(35);
    pdf.setFillColor(30, 41, 59);
    pdf.rect(margin, y, contentWidth, 5, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'bold');
    pdf.text('4. HASIL ASESMEN FISIK TRIAL & PROGRAM REKOMENDASI PELATIH', margin + 2.5, y + 3.5);
    y += 5;

    // Scores Summary 3 Boxes
    const scW = contentWidth / 3;
    pdf.setDrawColor(203, 213, 225);
    pdf.setFillColor(255, 255, 255);
    pdf.rect(margin, y, contentWidth, 11, 'FD');

    // 1. Strength Box
    pdf.setTextColor(100, 116, 139);
    pdf.setFontSize(5.5);
    pdf.setFont('helvetica', 'bold');
    pdf.text('1. STRENGTH ASSESSMENT:', margin + 2, y + 3.5);
    pdf.setTextColor(5, 150, 105);
    pdf.setFontSize(7.5);
    pdf.text(`Avg: ${t.avg_strength !== null && t.avg_strength !== undefined ? t.avg_strength.toFixed(2) : '-'} / 5.00`, margin + 2, y + 7);
    pdf.setFontSize(5.5);
    pdf.setTextColor(71, 85, 105);
    pdf.text(`Lower: ${t.lower_body ?? '-'} · Core: ${t.core ?? '-'} · Upper: ${t.upper_body ?? '-'}`, margin + 2, y + 9.5);

    // 2. Skill Box
    pdf.setTextColor(100, 116, 139);
    pdf.setFontSize(5.5);
    pdf.setFont('helvetica', 'bold');
    pdf.text('2. SKILLS RELATED FITNESS:', margin + scW + 2, y + 3.5);
    pdf.setTextColor(2, 132, 199);
    pdf.setFontSize(7.5);
    pdf.text(`Avg: ${t.avg_skill !== null && t.avg_skill !== undefined ? t.avg_skill.toFixed(2) : '-'} / 5.00`, margin + scW + 2, y + 7);
    pdf.setFontSize(5.5);
    pdf.setTextColor(71, 85, 105);
    pdf.text(`Control: ${t.body_control ?? '-'} · Flex: ${t.flexibility ?? '-'} · Agil: ${t.agility ?? '-'} · Speed: ${t.speed ?? '-'}`, margin + scW + 2, y + 9.5);

    // 3. Karakter Box
    pdf.setTextColor(100, 116, 139);
    pdf.setFontSize(5.5);
    pdf.setFont('helvetica', 'bold');
    pdf.text('3. SIKAP & KARAKTER:', margin + scW * 2 + 2, y + 3.5);
    pdf.setTextColor(124, 58, 237);
    pdf.setFontSize(7.5);
    pdf.text(`Avg: ${t.avg_character !== null && t.avg_character !== undefined ? t.avg_character.toFixed(2) : '-'} / 5.00`, margin + scW * 2 + 2, y + 7);
    pdf.setFontSize(5.5);
    pdf.setTextColor(71, 85, 105);
    pdf.text(`Integritas: ${t.integrity ?? '-'} · Prinsip: ${t.principled ?? '-'} · Juang: ${t.perseverance ?? '-'}`, margin + scW * 2 + 2, y + 9.5);
    y += 13;

    // Total Overall Score Banner
    const validAvgs = [t.avg_strength, t.avg_skill].filter(
      (n): n is number => typeof n === 'number' && n > 0
    );
    const overallPhysicalAvg =
      validAvgs.length > 0
        ? Number((validAvgs.reduce((a, b) => a + b, 0) / validAvgs.length).toFixed(2))
        : null;

    const getGrade = (avg: number | null) => {
      if (avg === null) return 'Menunggu Sesi Asesmen';
      if (avg >= 4.0) return 'EXCELLENT (SANGAT BAIK)';
      if (avg >= 3.25) return 'GOOD (SOLID FOUNDATION)';
      if (avg >= 2.5) return 'FAIR (NEED DEVELOPMENT)';
      return 'BASIC FUNDAMENTAL LEVEL';
    };

    pdf.setFillColor(15, 23, 42);
    pdf.rect(margin, y, contentWidth, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(6.5);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TOTAL AVERAGE OVERALL / SUMMARY:', margin + 3, y + 5);

    pdf.setTextColor(110, 231, 183);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text(
      overallPhysicalAvg !== null ? `${overallPhysicalAvg.toFixed(2)} / 5.00` : '-.-- / 5.00',
      margin + 75,
      y + 5.5
    );

    pdf.setTextColor(253, 224, 71); // amber-300
    pdf.setFontSize(7);
    pdf.text(`Predikat: ${getGrade(overallPhysicalAvg)}`, pageWidth - margin - 3, y + 5, { align: 'right' });
    y += 10;

    // Rekomendasi Program Box
    pdf.setDrawColor(203, 213, 225);
    pdf.setFillColor(248, 250, 252);
    pdf.rect(margin, y, contentWidth, 11, 'FD');

    const rColW = contentWidth / 4;
    pdf.setTextColor(100, 116, 139);
    pdf.setFontSize(5.5);
    pdf.setFont('helvetica', 'bold');
    pdf.text('KEKUATAN UTAMA:', margin + 2, y + 3.5);
    pdf.text('AREA PERLU DEVELOP:', margin + rColW + 2, y + 3.5);
    pdf.text('KATEGORI PERFORMA:', margin + rColW * 2 + 2, y + 3.5);
    pdf.text('REKOMENDASI PROGRAM:', margin + rColW * 3 + 2, y + 3.5);

    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(6.5);
    pdf.setFont('helvetica', 'bold');
    pdf.text((t.kekuatan_utama || '-').slice(0, 22), margin + 2, y + 7.5);
    pdf.text((t.perlu_develop || '-').slice(0, 22), margin + rColW + 2, y + 7.5);
    pdf.setTextColor(5, 150, 105);
    pdf.text((t.cat_performance || '-').slice(0, 22), margin + rColW * 2 + 2, y + 7.5);
    pdf.setTextColor(79, 70, 229);
    pdf.text((t.rekomendasi_program || '-').slice(0, 22), margin + rColW * 3 + 2, y + 7.5);
    y += 13;

    // --- 6. SIGNATURES (TANDA TANGAN) ---
    checkPageBreak(25);
    pdf.setDrawColor(203, 213, 225);
    pdf.setFillColor(255, 255, 255);
    pdf.rect(margin, y, contentWidth, 18, 'FD');

    pdf.setTextColor(71, 85, 105);
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'bold');
    pdf.text('LEMBAR PENGESAHAN & PERSETUJUAN SESI TRIAL', margin + contentWidth / 2, y + 3, { align: 'center' });

    const sW = contentWidth / 3;
    const sY = y + 4.5;
    const sigList = [
      { role: 'COACH / INSTRUKTUR 1', name: t.Coaches && t.Coaches[0] ? t.Coaches[0] : 'Coach 1' },
      { role: 'COACH / INSTRUKTUR 2', name: t.Coaches && t.Coaches[1] ? t.Coaches[1] : 'Coach 2' },
      { role: 'TCC COORDINATOR', name: t.signature_coordinator || 'Coordinator TCC' },
    ];

    sigList.forEach((s, idx) => {
      const sx = margin + idx * sW;
      pdf.setTextColor(71, 85, 105);
      pdf.setFontSize(5.5);
      pdf.setFont('helvetica', 'bold');
      pdf.text(s.role, sx + sW / 2, sY + 2.5, { align: 'center' });

      pdf.setDrawColor(15, 23, 42);
      pdf.setLineWidth(0.3);
      pdf.line(sx + 5, sY + 8.5, sx + sW - 5, sY + 8.5);

      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(6);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`( ${s.name.slice(0, 22)} )`, sx + sW / 2, sY + 11.5, { align: 'center' });
    });
    y += 20;

    // --- 7. DISCLAIMER & FOOTER ---
    checkPageBreak(22);
    pdf.setDrawColor(203, 213, 225);
    pdf.setFillColor(248, 250, 252);
    pdf.rect(margin, y, contentWidth, 12, 'FD');

    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(5.5);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DISCLAIMER (PERNYATAAN PELEPASAN TANGGUNG JAWAB) - THE CORE CHAMBER', margin + 2.5, y + 3);

    pdf.setTextColor(71, 85, 105);
    pdf.setFontSize(4.5);
    pdf.setFont('helvetica', 'normal');
    const disc =
      'Hasil evaluasi sesi trial ini digunakan sebagai acuan menyusun program latihan personal dan memantau kesiapan fisik calon peserta. Pelaksanaan latihan fisik wajib mengikuti instruksi coach bertugas demi keselamatan bersama.';
    pdf.text(pdf.splitTextToSize(disc, contentWidth - 5), margin + 2.5, y + 6.5);
    y += 14;

    pdf.setDrawColor(15, 23, 42);
    pdf.setLineWidth(0.4);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 3;

    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'bold');
    pdf.text('AIRZONE (@airzone_id)  |  THE CORE CHAMBER  |  Phone: 0811-2112-1117  |  Email: admin.ho@airzone.id', margin + contentWidth / 2, y, { align: 'center' });

    y += 2.5;
    pdf.setTextColor(148, 163, 184);
    pdf.setFontSize(5);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Waktu Cetak: ${new Date().toLocaleString('id-ID')} WIB  ·  Dokumen sah dan diverifikasi resmi oleh The Core Chamber.`, margin + contentWidth / 2, y, { align: 'center' });

    return pdf;
  };

  // Pre-generate PDF in the background instantly (< 25ms)
  useEffect(() => {
    try {
      const pdf = buildTrialPDF(trial);
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);

      setCachedPdf({
        blob,
        url,
        fileName: defaultFileName,
        pdfInstance: pdf,
      });

      return () => {
        URL.revokeObjectURL(url);
      };
    } catch (e) {
      console.warn('Pre-generating Trial PDF warning:', e);
    }
  }, [trial, defaultFileName]);

  // Instant Save / Download Function (0-second execution)
  const handleSaveAsPDF = () => {
    let pdfBlob: Blob;
    let blobUrl: string;
    let fileName = defaultFileName;

    if (cachedPdf) {
      pdfBlob = cachedPdf.blob;
      blobUrl = cachedPdf.url;
      fileName = cachedPdf.fileName;
    } else {
      const pdf = buildTrialPDF(trial);
      pdfBlob = pdf.output('blob');
      blobUrl = URL.createObjectURL(pdfBlob);
    }

    // Direct browser anchor download
    try {
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = fileName;
      downloadLink.target = '_blank';
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      setTimeout(() => {
        if (document.body.contains(downloadLink)) {
          document.body.removeChild(downloadLink);
        }
      }, 1200);
    } catch (e) {
      console.warn('Direct anchor download failed, attempting jsPDF fallback:', e);
      try {
        if (cachedPdf?.pdfInstance) {
          cachedPdf.pdfInstance.save(fileName);
        } else {
          const pdf = buildTrialPDF(trial);
          pdf.save(fileName);
        }
      } catch (err2) {
        console.warn('jsPDF save fallback warning:', err2);
      }
    }

    setHasJustDownloaded(true);

    // Immediately display the Mobile Notification Card
    setNotification({
      isOpen: true,
      status: 'success',
      title: '✓ File PDF Berhasil Disimpan & Diunduh!',
      message: `Berkas "${fileName}" telah disimpan ke folder Unduhan (Downloads) perangkat Anda.`,
      blobUrl,
      fileName,
    });
  };

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
📅 *Hari, Tanggal:* ${trial.Trial_Day || '-'}, ${trial.Trial_Date ? formatDisplayDate(trial.Trial_Date) : '-'}
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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-5 overflow-y-auto print:p-0 print:static print:bg-white print:overflow-visible print:block print-container">
      
      {/* =========================================================================
          NATIVE-FEELING MOBILE NOTIFICATION CARD (Instant & Actionable)
          ========================================================================= */}
      {notification.isOpen && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-90 w-[94%] max-w-md animate-in slide-in-from-top-3 fade-in duration-200">
          <div className="bg-slate-900/98 text-white rounded-2xl shadow-2xl border border-emerald-500/40 p-3.5 sm:p-4 overflow-hidden">
            {/* Header: App Brand & Timestamp */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-[11px] font-black tracking-wider uppercase text-emerald-300">
                  DOWNLOAD SELESAI · THE CORE CHAMBER
                </span>
              </div>
              <button
                type="button"
                onClick={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Tutup Notifikasi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notification Body */}
            <div className="space-y-2">
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-white flex items-center gap-1.5">
                  <span className="text-emerald-400 font-black">✓</span>
                  <span>{notification.title}</span>
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  {notification.message}
                </p>
                <div className="mt-1 font-mono text-[10px] text-emerald-400 font-semibold break-all whitespace-normal bg-slate-950/70 px-2 py-1 rounded border border-slate-800">
                  {notification.fileName}
                </div>
              </div>

              {/* Action Buttons: Open & Re-download */}
              {notification.blobUrl && (
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <a
                    href={notification.blobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka File PDF</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleSaveAsPDF}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 text-xs font-semibold transition-all border border-slate-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Ulang</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
                    className="ml-auto px-2.5 py-1.5 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-semibold"
                  >
                    Tutup
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Preview Container */}
      <div className="relative bg-white text-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto print:border-none print:shadow-none print:max-w-none print:w-full print:rounded-none">
        
        {/* Floating Screen Controls (Hidden during print) */}
        <div className="sticky top-0 z-20 bg-slate-900 text-white px-3.5 py-3 sm:px-5 sm:py-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div className="min-w-0">
              <span className="font-extrabold text-xs sm:text-sm block tracking-wide break-words whitespace-normal leading-tight">
                LEMBAR KONFIRMASI & REGISTRASI {trial.Customer_type?.toUpperCase()}
              </span>
              <span className="text-[11px] text-slate-400 block break-words whitespace-normal leading-tight mt-0.5">
                {trial.Full_Name} · <span className="font-mono text-emerald-400 font-bold">{trial.MemberID || 'TCC-????'}</span> · {trial.Trial_Date ? formatDisplayDate(trial.Trial_Date) : 'Sesi Trial'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 shrink-0">
            {/* Salin WA Button */}
            <button
              type="button"
              onClick={handleCopyWhatsApp}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 shadow-xs"
              title="Salin Pesan Teks untuk WhatsApp"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin WA'}</span>
            </button>

            {/* Tombol Simpan PDF (Instant 0-Second Execution) */}
            <button
              type="button"
              onClick={handleSaveAsPDF}
              className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                hasJustDownloaded
                  ? 'bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white ring-2 ring-emerald-400/40'
                  : 'bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white'
              }`}
              title="Download dan simpan file PDF langsung ke HP atau Komputer Anda"
            >
              {hasJustDownloaded ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>Simpan PDF Lagi</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Simpan PDF</span>
                </>
              )}
            </button>

            {/* Tombol Cetak Dokumen (Browser Print Dialog) */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 hover:text-white text-xs font-bold transition-all border border-slate-700 cursor-pointer shadow-xs"
              title="Buka dialog cetak printer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                title="Tutup lembar cetak dan kembali"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Printable Document Body (Responsive Mobile & Elegant A4 Print) */}
        <div className="p-4 sm:p-8 space-y-5 text-slate-900 font-sans print:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-slate-900 pb-4 gap-3 print:flex-row print:items-center print:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-950 p-1.5 flex items-center justify-center shrink-0">
                <TCCLogo className="w-full h-full text-white" variant="full" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-950 uppercase leading-tight">
                  THE <span className="text-rose-600">CORE</span> CHAMBER
                </h1>
                <p className="text-[10px] sm:text-xs font-bold tracking-widest text-slate-600 uppercase">
                  TRIAL SESSION CONFIRMATION & REGISTRATION RECORD
                </p>
                <p className="text-[9px] sm:text-[10px] text-slate-500">
                  Document ID: {trial.MemberID} · Generated on {formatDisplayDate(new Date())}
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-300">
                {trial.Customer_type}
              </span>
              <span className="text-[10px] font-bold text-emerald-700">
                Status: {trial.schedule_status || 'Terkonfirmasi'}
              </span>
            </div>
          </div>

          {/* SECTION 1: JADWAL & IDENTITAS PESERTA */}
          <div className="bg-slate-50 border-2 border-slate-900 rounded-xl p-3.5 sm:p-4 space-y-3 break-inside-avoid">
            <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-2">
              <Calendar className="w-4 h-4 text-rose-600 shrink-0" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                1. IDENTITAS PESERTA & JADWAL SESI TRIAL
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs sm:text-sm">
              <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-slate-200">
                <span className="block text-[9.5px] font-bold text-slate-500 uppercase">Hari & Tanggal</span>
                <span className="font-extrabold text-xs sm:text-sm text-slate-900">
                  {trial.Trial_Day || '-'}, {trial.Trial_Date ? formatDisplayDate(trial.Trial_Date) : 'Belum Ditentukan'}
                </span>
              </div>

              <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-slate-200">
                <span className="block text-[9.5px] font-bold text-slate-500 uppercase">Waktu / Jam</span>
                <span className="font-extrabold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  {trial.Trial_Time ? `${trial.Trial_Time} WIB` : 'Belum Ditentukan'}
                </span>
              </div>

              <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-slate-200">
                <span className="block text-[9.5px] font-bold text-slate-500 uppercase">Coach / Instruktur</span>
                <span className="font-extrabold text-xs sm:text-sm text-slate-900 break-words whitespace-normal leading-snug block" title={trial.Coaches?.join(', ')}>
                  {trial.Coaches && trial.Coaches.length > 0 ? trial.Coaches.join(', ') : 'Belum Ditugaskan'}
                </span>
              </div>
            </div>

            {/* Identitas Personal Peserta */}
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="block text-[9.5px] font-bold text-slate-500 uppercase border-b border-slate-100 pb-1 mb-2">
                Data Diri Calon Member
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
                <div>
                  <span className="text-[9.5px] text-slate-400 block font-semibold">Nama Lengkap:</span>
                  <span className="font-bold text-slate-900 break-words whitespace-normal leading-snug block">{trial.Full_Name || '-'}</span>
                </div>
                <div>
                  <span className="text-[9.5px] text-slate-400 block font-semibold">Gender / Umur:</span>
                  <span className="font-semibold text-slate-800">
                    {trial.Gender || '-'} · {trial.Umur !== null && trial.Umur !== undefined ? `${trial.Umur} Thn` : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-[9.5px] text-slate-400 block font-semibold">Tanggal Lahir:</span>
                  <span className="font-semibold text-slate-800">{trial.DoB ? formatDisplayDate(trial.DoB) : '-'}</span>
                </div>
                <div>
                  <span className="text-[9.5px] text-slate-400 block font-semibold">Email:</span>
                  <span className="font-semibold text-slate-800 break-all whitespace-normal leading-snug block" title={trial.Email}>{trial.Email || '-'}</span>
                </div>
                <div>
                  <span className="text-[9.5px] text-slate-400 block font-semibold">WhatsApp:</span>
                  <span className="font-semibold text-emerald-700">{trial.WhatsApp_Number || '-'}</span>
                </div>
                <div>
                  <span className="text-[9.5px] text-slate-400 block font-semibold">Kontak Darurat:</span>
                  <span className="font-semibold text-rose-700">{trial.Emergency_Contact || '-'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: LATAR BELAKANG SEKOLAH / PEKERJAAN & AKTIVITAS OLAHRAGA */}
          <div className="bg-slate-50 border-2 border-slate-900 rounded-xl p-3.5 sm:p-4 space-y-3 break-inside-avoid">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 bg-white p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-[9.5px] text-slate-400 block font-semibold">Sekolah / Kelas:</span>
                    <span className="font-semibold text-slate-900">
                      {trial.nama_sekolah || '-'} ({trial.kelas_grade || '-'})
                    </span>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-slate-400 block font-semibold">Nama Ayah / No WA:</span>
                    <span className="font-semibold text-slate-800">
                      {trial.nama_ayah || '-'} {trial.no_whatsapp_ayah ? `(${trial.no_whatsapp_ayah})` : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-slate-400 block font-semibold">Nama Ibu / No WA:</span>
                    <span className="font-semibold text-slate-800">
                      {trial.nama_ibu || '-'} {trial.no_whatsapp_ibu ? `(${trial.no_whatsapp_ibu})` : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-slate-400 block font-semibold">Email Orang Tua:</span>
                    <span className="font-semibold text-slate-800 break-all whitespace-normal block">
                      {trial.email_orangTua || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-slate-400 block font-semibold">Klub & Cabang Olahraga:</span>
                    <span className="text-slate-800 font-medium">
                      {trial.formakids_tergabung_dalamClub === 'YA'
                        ? `Ya, ${trial.formakids_cabang_olahraga || 'Klub'}`
                        : 'Tidak Tergabung'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-slate-400 block font-semibold">Aktif Olahraga & Frekuensi:</span>
                    <span className="font-semibold text-slate-800">
                      {trial.formakids_aktif_olahraga || 'YA'} ({trial.formakids_frek_Latihan || '-'})
                    </span>
                  </div>
                  {trial.nama_wali && (
                    <div className="sm:col-span-2 md:col-span-3 pt-1 border-t border-slate-100 text-[11px] text-slate-600">
                      <span className="font-bold">Wali:</span> {trial.nama_wali} {trial.no_whatsapp_wali ? `(${trial.no_whatsapp_wali})` : ''}
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 bg-white p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-[9.5px] text-slate-400 block font-semibold">Pekerjaan:</span>
                    <span className="font-bold text-slate-900">{trial.formadults_pekerjaan || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-slate-400 block font-semibold">Perusahaan:</span>
                    <span className="text-slate-800">{trial.formadults_perusahaan || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-slate-400 block font-semibold">Alamat Kantor:</span>
                    <span className="text-slate-800">{trial.formadults_alamatKantor || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-slate-400 block font-semibold">Klub / Cabang Olahraga:</span>
                    <span className="text-slate-800 font-medium">
                      {trial.formadults_tergabung_dalamKlub === 'YA'
                        ? `Ya, ${trial.formadults_cabang_olahraga || ''}`
                        : 'Tidak Tergabung'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-slate-400 block font-semibold">Aktif Berolahraga:</span>
                    <span className="font-semibold text-slate-800">{trial.formadults_aktif_olahraga || 'YA'}</span>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-slate-400 block font-semibold">Frekuensi Latihan:</span>
                    <span className="font-semibold text-slate-800">{trial.formadults_frek_Latihan || '-'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: SKRINING RIWAYAT KESEHATAN, CEDERA & MEDIS */}
          <div className="bg-slate-50 border-2 border-slate-900 rounded-xl p-3.5 sm:p-4 space-y-3 break-inside-avoid">
            <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                3. SKRINING RIWAYAT KESEHATAN, CEDERA & MEDIS (SCREENING)
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
              <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-slate-200">
                <span className="text-[9.5px] uppercase font-bold text-slate-500 block">Kondisi Kesehatan Saat Ini:</span>
                <span className={`font-semibold text-slate-900 ${trial.formadults_kondisi === 'Ada Kondisi Khusus' ? 'text-rose-600 font-bold' : ''}`}>
                  {trial.formadults_kondisi || 'Sehat'}
                  {trial.formadults_kondisi_detail && ` — "${trial.formadults_kondisi_detail}"`}
                </span>
              </div>

              <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-slate-200">
                <span className="text-[9.5px] uppercase font-bold text-slate-500 block">Riwayat Cedera:</span>
                <span className={`font-semibold text-slate-900 ${trial.formadults_riwayat === 'Ada' ? 'text-rose-600 font-bold' : ''}`}>
                  {trial.formadults_riwayat || 'Tidak Ada'}
                  {trial.formadults_riwayat_detail && ` — "${trial.formadults_riwayat_detail}"`}
                </span>
              </div>

              <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-slate-200">
                <span className="text-[9.5px] uppercase font-bold text-slate-500 block">Operasi / Rawat Inap (12 Bulan):</span>
                <span className={`font-semibold text-slate-900 ${trial.formadults_cideraOperasi === 'Ada' ? 'text-rose-600 font-bold' : ''}`}>
                  {trial.formadults_cideraOperasi || 'Tidak Ada'}
                  {trial.formadults_cideraOperasi_detail && ` — "${trial.formadults_cideraOperasi_detail}"`}
                </span>
              </div>

              <div className="bg-white p-2.5 sm:p-3 rounded-lg border border-slate-200">
                <span className="text-[9.5px] uppercase font-bold text-slate-500 block">Kondisi Medis Khusus / Alergi:</span>
                <span className={`font-semibold text-slate-900 ${trial.formadults_medisKhusus === 'Ada' ? 'text-rose-600 font-bold' : ''}`}>
                  {trial.formadults_medisKhusus || 'Tidak Ada'}
                  {trial.formadults_medisKhusus_detail && ` — "${trial.formadults_medisKhusus_detail}"`}
                </span>
              </div>

              {trial.formadults_catatan && (
                <div className="md:col-span-2 bg-amber-50/80 p-3 rounded-lg border border-amber-200 text-slate-800">
                  <span className="text-[9.5px] uppercase font-bold text-amber-900 block mb-0.5">Catatan Khusus untuk Pelatih:</span>
                  <p className="italic font-medium text-xs">"{trial.formadults_catatan}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Physical Assessment & Coach Recommendations */}
          <div className="rounded-xl border-2 border-slate-900 p-3.5 sm:p-4 space-y-3 bg-slate-50/50 break-inside-avoid">
            <div className="border-b-2 border-slate-900 pb-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                4. HASIL ASESMEN FISIK TRIAL & PROGRAM REKOMENDASI PELATIH
              </h2>
            </div>

            {/* Assessment Scores Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 text-xs">
              {/* 1. Strength */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                  <span className="font-extrabold text-[10.5px] text-slate-900 uppercase">1. STRENGTH ASSESSMENT (1 - 5)</span>
                  <span className="font-mono font-bold text-xs bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                    Avg: {trial.avg_strength !== null && trial.avg_strength !== undefined ? `${trial.avg_strength.toFixed(2)}` : '-'} / 5.00
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-slate-50 rounded border border-slate-100">
                    <span className="text-[9.5px] text-slate-500 block">Lower Body</span>
                    <span className="text-sm font-bold text-slate-900">{trial.lower_body ?? '-'}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-100">
                    <span className="text-[9.5px] text-slate-500 block">Core</span>
                    <span className="text-sm font-bold text-slate-900">{trial.core ?? '-'}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-100">
                    <span className="text-[9.5px] text-slate-500 block">Upper Body</span>
                    <span className="text-sm font-bold text-slate-900">{trial.upper_body ?? '-'}</span>
                  </div>
                </div>
              </div>

              {/* 2. Skills Running Lane */}
              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                  <span className="font-extrabold text-[10.5px] text-slate-900 uppercase">2. SKILLS RELATED FITNESS (1 - 5)</span>
                  <span className="font-mono font-bold text-xs bg-sky-50 text-sky-800 px-2 py-0.5 rounded border border-sky-200">
                    Avg: {trial.avg_skill !== null && trial.avg_skill !== undefined ? `${trial.avg_skill.toFixed(2)}` : '-'} / 5.00
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                  <div className="p-1.5 bg-slate-50 rounded border border-slate-100">
                    <span className="text-[9px] text-slate-500 block break-words whitespace-normal leading-tight">Control</span>
                    <span className="text-sm font-bold text-slate-900">{trial.body_control ?? '-'}</span>
                  </div>
                  <div className="p-1.5 bg-slate-50 rounded border border-slate-100">
                    <span className="text-[9px] text-slate-500 block break-words whitespace-normal leading-tight">Flex</span>
                    <span className="text-sm font-bold text-slate-900">{trial.flexibility ?? '-'}</span>
                  </div>
                  <div className="p-1.5 bg-slate-50 rounded border border-slate-100">
                    <span className="text-[9px] text-slate-500 block break-words whitespace-normal leading-tight">Agility</span>
                    <span className="text-sm font-bold text-slate-900">{trial.agility ?? '-'}</span>
                  </div>
                  <div className="p-1.5 bg-slate-50 rounded border border-slate-100">
                    <span className="text-[9px] text-slate-500 block break-words whitespace-normal leading-tight">Speed</span>
                    <span className="text-sm font-bold text-slate-900">{trial.speed ?? '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Evaluasi Sikap & Karakter */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                <span className="font-extrabold text-[10.5px] text-slate-900 uppercase">3. EVALUASI SIKAP & KARAKTER (1 - 5)</span>
                <span className="font-mono font-bold text-xs bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded border border-indigo-200">
                  Avg: {trial.avg_character !== null && trial.avg_character !== undefined ? `${trial.avg_character.toFixed(2)}` : '-'} / 5.00
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 bg-slate-50 rounded border border-slate-100">
                  <span className="text-[9.5px] text-slate-500 block">Integritas</span>
                  <span className="text-sm font-bold text-slate-900">{trial.integrity ?? '-'}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-100">
                  <span className="text-[9.5px] text-slate-500 block">Berprinsip</span>
                  <span className="text-sm font-bold text-slate-900">{trial.principled ?? '-'}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-100">
                  <span className="text-[9.5px] text-slate-500 block">Daya Juang</span>
                  <span className="text-sm font-bold text-slate-900">{trial.perseverance ?? '-'}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-100">
                  <span className="text-[9.5px] text-slate-500 block">Rasa Syukur</span>
                  <span className="text-sm font-bold text-slate-900">{trial.believe_god ?? '-'}</span>
                </div>
              </div>
            </div>

            {/* Total Average Overall Box */}
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
                <div className="bg-slate-950 text-white rounded-xl p-3.5 sm:p-4 border-2 border-slate-900 shadow-xs print:bg-slate-950 print:text-white">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-2.5 mb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <Award className="w-4.5 h-4.5 text-amber-400 shrink-0" />
                        <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                          TOTAL AVERAGE OVERALL / SUMMARY
                        </h3>
                      </div>
                      <p className="text-[9.5px] text-slate-300 mt-0.5">
                        Kalkulasi performa gabungan dari sesi 1 (Strength) dan sesi 2 (Skills) calon member.
                      </p>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">TOTAL OVERALL SCORE</span>
                      <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400 leading-none">
                        {overallPhysicalAvg !== null ? `${overallPhysicalAvg.toFixed(2)}` : '-.--'}
                        <span className="text-xs text-slate-400 font-normal"> / 5.00</span>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 flex justify-between items-center">
                      <span className="text-[10px] text-slate-300 font-semibold">1. Summary Strength:</span>
                      <span className="font-bold font-mono text-emerald-400 text-xs">
                        {trial.avg_strength !== null && trial.avg_strength !== undefined ? `${trial.avg_strength.toFixed(2)}` : '-'} / 5.00
                      </span>
                    </div>

                    <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 flex justify-between items-center">
                      <span className="text-[10px] text-slate-300 font-semibold">2. Summary Skill:</span>
                      <span className="font-bold font-mono text-sky-400 text-xs">
                        {trial.avg_skill !== null && trial.avg_skill !== undefined ? `${trial.avg_skill.toFixed(2)}` : '-'} / 5.00
                      </span>
                    </div>

                    <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 flex justify-between items-center gap-2">
                      <span className="text-[10px] text-slate-300 font-semibold shrink-0">Predikat:</span>
                      <span className="font-extrabold text-amber-300 text-[10.5px] break-words whitespace-normal text-right">
                        {getOverallGrade(overallPhysicalAvg)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Coach Recommendations Box */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-2">
              <span className="font-bold text-slate-900 uppercase text-[10.5px] block border-b border-slate-200 pb-1">
                4. REKOMENDASI PROGRAM & KESIMPULAN PELATIH
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <span className="font-semibold text-slate-500 text-[9.5px] uppercase block">Kekuatan Utama Peserta:</span>
                  <span className="font-bold text-slate-900 text-xs">{trial.kekuatan_utama || '-'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 text-[9.5px] uppercase block">Area Perlu Dikembangkan:</span>
                  <span className="font-bold text-slate-900 text-xs">{trial.perlu_develop || '-'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 text-[9.5px] uppercase block">Kategori Performa:</span>
                  <span className="font-extrabold text-emerald-700 text-xs">{trial.cat_performance || '-'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 text-[9.5px] uppercase block">Rekomendasi Program Latihan:</span>
                  <span className="font-extrabold text-indigo-700 text-xs">{trial.rekomendasi_program || '-'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Signature Area */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs break-inside-avoid">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <p className="text-[9.5px] text-slate-500 uppercase font-bold mb-8">Coach / Instruktur 1</p>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-900 text-xs">
                {trial.Coaches && trial.Coaches[0] ? trial.Coaches[0] : '( Pelatih 1 )'}
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <p className="text-[9.5px] text-slate-500 uppercase font-bold mb-8">Coach / Instruktur 2</p>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-900 text-xs">
                {trial.Coaches && trial.Coaches[1] ? trial.Coaches[1] : '( Pelatih 2 )'}
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <p className="text-[9.5px] text-slate-500 uppercase font-bold mb-8">TCC Coordinator</p>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-900 text-xs">
                {trial.signature_coordinator || '( Coordinator TCC )'}
              </div>
            </div>
          </div>

          {/* Disclaimer Box before Footer */}
          <div className="pt-2 break-inside-avoid">
            <DisclaimerSection />
          </div>

          {/* Centered Brand, Logo & Contact Footer */}
          <div className="break-inside-avoid">
            <PrintFooter />
          </div>
        </div>
      </div>
    </div>
  );
};
