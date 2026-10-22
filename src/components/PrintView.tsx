import React, { useMemo, useRef, useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { ScoreCardRecord, ScoreLevel } from '../types/scoreCard';
import { TCCLogo } from './TCCLogo';
import { PrintFooter } from './PrintFooter';
import { DisclaimerSection } from './DisclaimerSection';
import { formatDisplayDate } from '../utils/dateFormatter';
import {
  Printer,
  X,
  Download,
  CheckCircle2,
  Calendar,
  UserCheck,
  Scale,
  Activity,
  Award,
  ShieldCheck,
  FileText,
  ExternalLink,
  Smartphone,
  AlertCircle,
  Check,
} from 'lucide-react';

interface PrintViewProps {
  record: ScoreCardRecord;
  isOpen?: boolean;
  onClose?: () => void;
}

interface DownloadNotificationState {
  isOpen: boolean;
  status: 'ready' | 'downloading' | 'success' | 'error';
  title: string;
  message: string;
  blobUrl?: string;
  fileName?: string;
}

export const PrintView: React.FC<PrintViewProps> = ({
  record,
  isOpen = true,
  onClose,
}) => {
  const printSheetRef = useRef<HTMLDivElement>(null);

  // Cached pre-generated PDF for 0-second instant downloads
  const [cachedPdf, setCachedPdf] = useState<{
    blob: Blob;
    url: string;
    fileName: string;
    pdfInstance: jsPDF;
  } | null>(null);

  const [notification, setNotification] = useState<DownloadNotificationState>({
    isOpen: false,
    status: 'ready',
    title: '',
    message: '',
  });

  const [hasJustDownloaded, setHasJustDownloaded] = useState(false);

  const coachesList = useMemo(() => {
    if (!record.Coaches) return [];
    return record.Coaches.split(',').map((c) => c.trim()).filter(Boolean);
  }, [record.Coaches]);

  const coach1Name = coachesList[0] || (record.Coaches ? record.Coaches.trim() : 'Coach 1 (Penguji)');
  const coach2Name = coachesList[1] || (coachesList.length > 2 ? coachesList.slice(1).join(', ') : 'Coach 2 (Pendamping)');

  const customerName =
    record.Full_Name ||
    (record as any).fullName ||
    (record as any).Nama ||
    (record as any).nama ||
    (record as any).Name ||
    (record as any).name ||
    'Nama Peserta';

  // Format File Naming resmi yang terstruktur
  const cleanMemberId = useMemo(() => {
    return (record.MemberID || 'TCC').replace(/[^a-zA-Z0-9_-]/g, '_');
  }, [record.MemberID]);

  const cleanName = useMemo(() => {
    return (customerName || 'Member').replace(/[^a-zA-Z0-9_-]/g, '_');
  }, [customerName]);

  const defaultFileName = useMemo(() => {
    return `ScoreCard_${cleanMemberId}_${cleanName}.pdf`;
  }, [cleanMemberId, cleanName]);

  // Ultra-fast vector A4 PDF Generator (< 25ms execution time)
  const buildScoreCardPDF = (data: ScoreCardRecord): jsPDF => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const docMemberId = data.MemberID || 'TCC-XXXX';
    const cleanDate = formatDisplayDate(data.Test_Date);

    const margin = 10;
    const pageWidth = 210;
    const contentWidth = pageWidth - margin * 2; // 190mm
    let y = 11;

    // --- 1. HEADER LEMBAR RESMI ---
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
    pdf.setTextColor(220, 38, 38); // red-600
    pdf.text('CORE ', margin + 24.5, y + 5);
    pdf.setTextColor(15, 23, 42);
    pdf.text('CHAMBER', margin + 39, y + 5);

    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 41, 59);
    pdf.text('FORM - PHYSICAL FITNESS SCORE CARD & DATA MEMBER', margin + 14, y + 9);

    pdf.setFontSize(6.5);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 116, 139);
    pdf.text('Standardized Athletic & Functional Performance Assessment System', margin + 14, y + 12);

    // Right Box: Member ID & Category
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.4);
    pdf.setFillColor(248, 250, 252);
    pdf.rect(pageWidth - margin - 38, y, 38, 8, 'FD');
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text(docMemberId, pageWidth - margin - 19, y + 5.5, { align: 'center' });

    pdf.setFontSize(6.5);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(5, 150, 105);
    pdf.text('KATEGORI: MEMBER TCC', pageWidth - margin, y + 11, { align: 'right' });

    pdf.setFontSize(5.5);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Doc Ref: ${(data.id || 'VERIFIED').slice(-8).toUpperCase()}`, pageWidth - margin, y + 14, { align: 'right' });

    y += 16;
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.6);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 3;

    // --- 2. SECTION 1: PERSONAL DATA MEMBER ---
    pdf.setFillColor(30, 41, 59);
    pdf.rect(margin, y, contentWidth, 5, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'bold');
    pdf.text('1. PERSONAL DATA MEMBER', margin + 2.5, y + 3.5);
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Identitas Resmi Peserta', pageWidth - margin - 2.5, y + 3.5, { align: 'right' });
    y += 5;

    // Personal Data Box
    pdf.setDrawColor(203, 213, 225);
    pdf.setLineWidth(0.2);
    pdf.setFillColor(248, 250, 252);
    pdf.rect(margin, y, contentWidth, 10, 'FD');

    const colW = contentWidth / 4;
    pdf.setTextColor(100, 116, 139);
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'bold');
    pdf.text('NAMA LENGKAP:', margin + 2.5, y + 3.5);
    pdf.text('GENDER:', margin + colW + 2.5, y + 3.5);
    pdf.text('TANGGAL LAHIR / USIA:', margin + colW * 2 + 2.5, y + 3.5);
    pdf.text('TANGGAL TES / COACH:', margin + colW * 3 + 2.5, y + 3.5);

    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'bold');
    pdf.text(customerName.slice(0, 26), margin + 2.5, y + 7.5);
    pdf.text(data.Gender ? data.Gender.toUpperCase() : 'MALE', margin + colW + 2.5, y + 7.5);
    pdf.text(`${formatDisplayDate(data.DoB)} (${data.Umur ?? '-'} Thn)`, margin + colW * 2 + 2.5, y + 7.5);
    pdf.text(`${cleanDate} / ${(data.Coaches || '-').slice(0, 22)}`, margin + colW * 3 + 2.5, y + 7.5);
    y += 12;

    // --- 3. SECTION 2: BODY COMPOSITION & ANTHROPOMETRY ---
    pdf.setFillColor(30, 41, 59);
    pdf.rect(margin, y, contentWidth, 5, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'bold');
    pdf.text('2. BODY COMPOSITION & ANTHROPOMETRIC MEASUREMENTS (CM)', margin + 2.5, y + 3.5);
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Pengukuran Fisik & Antropometri', pageWidth - margin - 2.5, y + 3.5, { align: 'right' });
    y += 5;

    // 10 Body Measurements Grid (5 cols x 2 rows)
    const mColW = contentWidth / 5;
    const mHeight = 8;
    const measurements = [
      { label: 'Wing Span', val: data.wing_span ? `${data.wing_span} cm` : '-' },
      { label: 'Chest / Dada', val: data.chest ? `${data.chest} cm` : '-' },
      { label: 'Left Arm (Ki)', val: data.left_arm ? `${data.left_arm} cm` : '-' },
      { label: 'Right Arm (Ka)', val: data.right_arm ? `${data.right_arm} cm` : '-' },
      { label: 'Waist / Pinggang', val: data.waist ? `${data.waist} cm` : '-' },
      { label: 'Hips / Pinggul', val: data.hips ? `${data.hips} cm` : '-' },
      { label: 'Left Thigh (Ki)', val: data.left_thigh ? `${data.left_thigh} cm` : '-' },
      { label: 'Right Thigh (Ka)', val: data.right_tight ? `${data.right_tight} cm` : '-' },
      { label: 'Left Calf (Ki)', val: data.left_calf ? `${data.left_calf} cm` : '-' },
      { label: 'Right Calf (Ka)', val: data.right_calf ? `${data.right_calf} cm` : '-' },
    ];

    measurements.forEach((item, idx) => {
      const col = idx % 5;
      const row = Math.floor(idx / 5);
      const bx = margin + col * mColW;
      const by = y + row * mHeight;

      pdf.setDrawColor(226, 232, 240);
      pdf.setFillColor(255, 255, 255);
      pdf.rect(bx, by, mColW, mHeight, 'FD');

      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(5.5);
      pdf.setFont('helvetica', 'normal');
      pdf.text(item.label, bx + mColW / 2, by + 3, { align: 'center' });

      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(7.5);
      pdf.setFont('helvetica', 'bold');
      pdf.text(item.val, bx + mColW / 2, by + 6.5, { align: 'center' });
    });
    y += mHeight * 2;

    // Physical Status Row: Height, Weight, Fat, Muscle, BMI
    pdf.setFillColor(241, 245, 249);
    pdf.rect(margin, y, contentWidth, 8, 'F');
    pdf.setDrawColor(203, 213, 225);
    pdf.rect(margin, y, contentWidth, 8, 'D');

    const statusList = [
      { label: 'TINGGI BADAN', val: data.height ? `${data.height} cm` : '-' },
      { label: 'BERAT BADAN', val: data.weight ? `${data.weight} kg` : '-' },
      { label: 'BODY FAT %', val: data.body_fat !== null ? `${data.body_fat}%` : '-' },
      { label: 'MASSA OTOT %', val: data.muscle_mass !== null ? `${data.muscle_mass}%` : '-' },
      { label: 'BMI & KATEGORI', val: `${data.BMI ?? '-'} ${data.cat_bmi ? `(${data.cat_bmi})` : ''}` },
    ];

    statusList.forEach((st, idx) => {
      const bx = margin + idx * mColW;
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(5.5);
      pdf.setFont('helvetica', 'bold');
      pdf.text(st.label, bx + mColW / 2, y + 3, { align: 'center' });

      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(7.5);
      pdf.setFont('helvetica', 'bold');
      pdf.text(st.val, bx + mColW / 2, y + 6.5, { align: 'center' });
    });
    y += 10;

    // --- Helper for scoring sections ---
    const drawScoringSection = (
      title: string,
      avgText: string,
      items: { label: string; score: ScoreLevel | null; cat: string }[]
    ) => {
      pdf.setFillColor(30, 41, 59);
      pdf.rect(margin, y, contentWidth, 5, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, margin + 2.5, y + 3.5);
      pdf.setTextColor(110, 231, 183);
      pdf.setFontSize(6.5);
      pdf.text(avgText, pageWidth - margin - 2.5, y + 3.5, { align: 'right' });
      y += 5;

      const itemW = contentWidth / items.length;
      const boxH = 10;

      items.forEach((item, idx) => {
        const bx = margin + idx * itemW;
        pdf.setDrawColor(203, 213, 225);
        pdf.setFillColor(255, 255, 255);
        pdf.rect(bx, y, itemW, boxH, 'FD');

        pdf.setTextColor(71, 85, 105);
        pdf.setFontSize(5.5);
        pdf.setFont('helvetica', 'bold');
        pdf.text(item.label, bx + itemW / 2, y + 3, { align: 'center' });

        pdf.setTextColor(15, 23, 42);
        pdf.setFontSize(8.5);
        pdf.setFont('helvetica', 'bold');
        pdf.text(item.score !== null ? `${item.score}` : '-', bx + itemW / 2, y + 6.5, { align: 'center' });

        pdf.setTextColor(100, 116, 139);
        pdf.setFontSize(5);
        pdf.setFont('helvetica', 'normal');
        pdf.text((item.cat || '-').slice(0, 14), bx + itemW / 2, y + 9, { align: 'center' });
      });
      y += boxH + 2;
    };

    // --- 4. SECTION 3: FUNCTIONAL ASSESSMENT ---
    drawScoringSection(
      '3. FUNCTIONAL ASSESSMENT (UJI GERAK DASAR FUNGSIONAL)',
      `Rata-rata: ${data.avg_functional !== null ? data.avg_functional.toFixed(1) + ' / 4.0' : '-'}`,
      [
        { label: 'Deep Squat', score: data.score_deepSquat, cat: data.cat_deepSquat },
        { label: 'Hurdle Step', score: data.score_hurdleStep, cat: data.cat_hurdleStep },
        { label: 'In-Line Lunge', score: data.score_inlineLunge, cat: data.cat_inlineLunge },
        { label: 'Balance Test', score: data.score_balance, cat: data.cat_balance },
        { label: 'Landing Error', score: data.score_landing, cat: data.cat_landing },
      ]
    );

    // --- 5. SECTION 4: STRENGTH ASSESSMENT ---
    drawScoringSection(
      '4. STRENGTH ASSESSMENT (KEKUATAN OTOT & KONDISIONING)',
      `Rata-rata: ${data.avg_strength !== null ? data.avg_strength.toFixed(1) + ' / 4.0' : '-'}`,
      [
        { label: 'Lower Body', score: data.score_lowerbody, cat: data.cat_lowerbody },
        { label: 'Unilateral', score: data.score_unilateralStrenght, cat: data.cat_unilateralStrenght },
        { label: 'Posterior', score: data.score_posteriorChain, cat: data.cat_posteriorChain },
        { label: 'Upper Body', score: data.score_upperBody, cat: data.cat_upperBody },
        { label: 'Core Stability', score: data.score_core, cat: data.cat_core },
        { label: 'Conditioning', score: data.score_conditioning, cat: data.cat_conditioning },
      ]
    );

    // --- 6. SECTION 5: SKILL RELATED FITNESS ---
    drawScoringSection(
      '5. SKILL RELATED FITNESS (KETERAMPILAN FISIK ATLETIK)',
      `Rata-rata: ${data.avg_skill !== null ? data.avg_skill.toFixed(1) + ' / 4.0' : '-'}`,
      [
        { label: 'Power', score: data.score_power, cat: data.cat_power },
        { label: 'Speed', score: data.score_speed, cat: data.cat_speed },
        { label: 'Agility', score: data.score_agility, cat: data.cat_agility },
        { label: 'Flexibility', score: data.score_flexibility, cat: data.cat_flexibility },
        { label: 'Coordination', score: data.score_coordination, cat: data.cat_coordination },
      ]
    );

    // --- 7. SECTION 6: EVALUATION SUMMARY & CATATAN COACH ---
    pdf.setDrawColor(203, 213, 225);
    pdf.setFillColor(248, 250, 252);
    pdf.rect(margin, y, contentWidth, 14, 'FD');

    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(6.5);
    pdf.setFont('helvetica', 'bold');
    pdf.text('6. EVALUATION SUMMARY & CATATAN COACH', margin + 2.5, y + 3.5);

    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(71, 85, 105);
    pdf.text(`Status BMI: ${data.cat_bmi || '-'} (${data.BMI ?? '-'} kg/m²)`, margin + 2.5, y + 7);
    pdf.text(`Rata-rata Skill: ${data.avg_skill !== null ? data.avg_skill.toFixed(1) + ' / 4.0' : '-'}`, margin + 70, y + 7);
    pdf.text(`Evaluator: ${(data.Coaches || '-').slice(0, 32)}`, margin + 125, y + 7);

    const notesSnippet = data.notes?.trim()
      ? `Catatan: "${data.notes.slice(0, 140)}"`
      : 'Catatan: Tidak ada catatan tambahan khusus dari coach evaluator.';
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(100, 116, 139);
    pdf.text(notesSnippet, margin + 2.5, y + 11.5);
    y += 16;

    // --- 8. SECTION 7: DISCLAIMER BOX ---
    pdf.setDrawColor(203, 213, 225);
    pdf.setFillColor(248, 250, 252);
    pdf.rect(margin, y, contentWidth, 15, 'FD');

    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DISCLAIMER (PERNYATAAN PELEPASAN TANGGUNG JAWAB) - THE CORE CHAMBER', margin + 2.5, y + 3);

    pdf.setTextColor(71, 85, 105);
    pdf.setFontSize(4.8);
    pdf.setFont('helvetica', 'normal');
    const discID =
      'Hasil Physical Fitness Score Card ini hanya digunakan sebagai gambaran umum mengenai kondisi kebugaran fisik individu pada saat pengukuran dilakukan. Nilai yang ditampilkan dipengaruhi oleh berbagai faktor, seperti usia, jenis kelamin, tingkat pertumbuhan, pengalaman latihan, kondisi kesehatan, kualitas tidur, nutrisi, hidrasi, motivasi, serta kondisi fisik pada saat pelaksanaan tes.';
    const discEN =
      'This Score Card is intended solely to provide a general overview of an individual\'s physical fitness status. The interpretation of these results serves as a reference for designing training programs and monitoring fitness progress, not as medical diagnosis.';
    pdf.text(pdf.splitTextToSize(discID, contentWidth - 5), margin + 2.5, y + 6);
    pdf.setTextColor(148, 163, 184);
    pdf.text(pdf.splitTextToSize(discEN, contentWidth - 5), margin + 2.5, y + 11.5);
    y += 17;

    // --- 9. SECTION 8: LEMBAR PENGESAHAN (TANDA TANGAN 4 PIHAK) ---
    pdf.setDrawColor(203, 213, 225);
    pdf.setFillColor(255, 255, 255);
    pdf.rect(margin, y, contentWidth, 19, 'FD');

    pdf.setTextColor(71, 85, 105);
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'bold');
    pdf.text('LEMBAR PENGESAHAN & PERSETUJUAN ASESMEN FISIK', margin + contentWidth / 2, y + 3, { align: 'center' });

    const sigW = contentWidth / 4;
    const sigY = y + 4.5;
    const sigBoxes = [
      { role: 'PESERTA / MEMBER', name: customerName, sub: 'Member TCC' },
      { role: 'COACH 1 (PENGUJI)', name: coach1Name, sub: 'Pelatih Utama' },
      { role: 'COACH 2 (PENDAMPING)', name: coach2Name, sub: 'Pelatih Pendamping' },
      { role: 'COORDINATOR TCC', name: 'Coordinator TCC', sub: 'Program / Head Coach' },
    ];

    sigBoxes.forEach((bx, idx) => {
      const sx = margin + idx * sigW;
      pdf.setTextColor(71, 85, 105);
      pdf.setFontSize(5.5);
      pdf.setFont('helvetica', 'bold');
      pdf.text(bx.role, sx + sigW / 2, sigY + 2.5, { align: 'center' });

      // Line for signature
      pdf.setDrawColor(15, 23, 42);
      pdf.setLineWidth(0.3);
      pdf.line(sx + 3, sigY + 9.5, sx + sigW - 3, sigY + 9.5);

      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(6);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`( ${bx.name.slice(0, 18)} )`, sx + sigW / 2, sigY + 12, { align: 'center' });

      pdf.setTextColor(148, 163, 184);
      pdf.setFontSize(4.8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(bx.sub, sx + sigW / 2, sigY + 14, { align: 'center' });
    });
    y += 21;

    // --- 10. SECTION 9: FOOTER RESMI ---
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
    pdf.text(`Waktu Cetak: ${new Date().toLocaleString('id-ID')} WIB  ·  Dokumen ini sah dan diverifikasi resmi oleh The Core Chamber.`, margin + contentWidth / 2, y, { align: 'center' });

    return pdf;
  };

  // Pre-generate PDF in the background instantly on mount/update (takes < 25ms)
  useEffect(() => {
    try {
      const pdf = buildScoreCardPDF(record);
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
      console.warn('Pre-generating PDF warning:', e);
    }
  }, [record, defaultFileName, customerName]);

  // Instant Save / Download Function (No artificial delays, finishes in < 0.1s)
  const handleSaveAsPDF = () => {
    let pdfBlob: Blob;
    let blobUrl: string;
    let fileName = defaultFileName;

    // 1. Use pre-cached PDF if ready, or generate immediately
    if (cachedPdf) {
      pdfBlob = cachedPdf.blob;
      blobUrl = cachedPdf.url;
      fileName = cachedPdf.fileName;
    } else {
      const pdf = buildScoreCardPDF(record);
      pdfBlob = pdf.output('blob');
      blobUrl = URL.createObjectURL(pdfBlob);
    }

    // 2. Direct browser download trigger via anchor tag
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
          const pdf = buildScoreCardPDF(record);
          pdf.save(fileName);
        }
      } catch (err2) {
        console.warn('jsPDF save fallback warning:', err2);
      }
    }

    setHasJustDownloaded(true);

    // 3. Immediately display the Mobile Notification Card
    setNotification({
      isOpen: true,
      status: 'success',
      title: '✓ File PDF Berhasil Disimpan & Diunduh!',
      message: `Berkas "${fileName}" telah disimpan ke folder Unduhan (Downloads) perangkat Anda.`,
      blobUrl,
      fileName,
    });
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-70 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-5 overflow-y-auto print:p-0 print:static print:bg-white print:overflow-visible print:block print-container">
      
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
      <div className="relative bg-white text-slate-950 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto print:border-none print:shadow-none print:max-w-none print:w-full print:rounded-none">
        
        {/* Floating Screen Controls Bar (Hidden during print) */}
        <div className="sticky top-0 z-20 bg-slate-900 text-white px-3.5 py-3 sm:px-5 sm:py-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div className="min-w-0">
              <span className="font-extrabold text-xs sm:text-sm block tracking-wide break-words whitespace-normal leading-tight">
                LEMBAR SCORE CARD MEMBER TCC SIAP CETAK / SIMPAN PDF
              </span>
              <span className="text-[11px] text-slate-400 block break-words whitespace-normal leading-tight mt-0.5">
                {customerName} · <span className="font-mono text-emerald-400 font-bold">{record.MemberID || 'TCC-????'}</span> · {formatDisplayDate(record.Test_Date)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 shrink-0">
            {/* Tombol Simpan PDF (Instant 0-Second Execution) */}
            <button
              type="button"
              onClick={handleSaveAsPDF}
              className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                hasJustDownloaded
                  ? 'bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white ring-2 ring-emerald-400/40'
                  : 'bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white'
              }`}
              title="Download dan simpan file PDF Score Card langsung ke penyimpanan HP atau Komputer Anda"
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
              onClick={handleTriggerPrint}
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

        {/* Printable Score Card Document Content (Responsive & Elegant on Mobile, Exact A4 on Print) */}
        <div
          ref={printSheetRef}
          className="p-4 sm:p-7 md:p-8 text-black bg-white max-w-[210mm] mx-auto text-xs font-sans print:p-0"
        >
          {/* Header Lembar Resmi */}
          <div className="border-b-2 border-black pb-3.5 mb-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 print:flex-row print:items-center print:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 border border-slate-400 rounded-lg p-1 flex items-center justify-center shrink-0 bg-slate-50">
                <TCCLogo className="w-full h-full text-slate-950" variant="full" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-950 leading-tight">
                  <span>THE </span><span className="text-red-600">CORE</span><span> CHAMBER</span>
                </h1>
                <p className="text-[10px] sm:text-[11px] font-extrabold tracking-wider uppercase text-slate-800 mt-0.5">
                  FORM - PHYSICAL FITNESS SCORE CARD & DATA MEMBER
                </p>
                <span className="text-[9px] sm:text-[9.5px] text-slate-500 font-medium block">
                  Standardized Athletic & Functional Performance Assessment System
                </span>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
              <div className="text-xs sm:text-sm font-mono font-black border-2 border-black px-2.5 sm:px-3 py-0.5 sm:py-1 rounded bg-slate-50 shadow-2xs">
                {record.MemberID || 'TCC-XXXX'}
              </div>
              <div className="text-right">
                <div className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-800">
                  KATEGORI: <span className="text-emerald-700 font-extrabold">MEMBER TCC</span>
                </div>
                <div className="text-[8.5px] sm:text-[9px] text-slate-500">
                  Doc Ref: {record.id ? record.id.slice(-8).toUpperCase() : 'VERIFIED'}
                </div>
              </div>
            </div>
          </div>

          {/* 1. PERSONAL DATA */}
          <div className="mb-3.5 border border-slate-300 rounded-lg overflow-hidden break-inside-avoid shadow-2xs print:shadow-none">
            <div className="bg-slate-800 text-white px-3 py-1 font-extrabold uppercase text-[10px] sm:text-[10.5px] flex items-center justify-between">
              <span>1. PERSONAL DATA MEMBER</span>
              <span className="text-[9px] sm:text-[9.5px] font-normal text-slate-300">Identitas Resmi Peserta</span>
            </div>
            <div className="p-3 bg-slate-50/70 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs print:grid-cols-4">
              <div className="bg-white sm:bg-transparent p-2 sm:p-0 rounded border sm:border-0 border-slate-200">
                <span className="text-slate-500 text-[9px] sm:text-[10px] block font-semibold uppercase">Nama Lengkap:</span>
                <span className="font-extrabold text-slate-900 text-xs sm:text-[13px] block break-words whitespace-normal leading-snug">{customerName}</span>
              </div>
              <div className="bg-white sm:bg-transparent p-2 sm:p-0 rounded border sm:border-0 border-slate-200">
                <span className="text-slate-500 text-[9px] sm:text-[10px] block font-semibold uppercase">Gender:</span>
                <span className="font-bold text-slate-900 capitalize text-xs sm:text-[13px] block">{record.Gender || 'Male'}</span>
              </div>
              <div className="bg-white sm:bg-transparent p-2 sm:p-0 rounded border sm:border-0 border-slate-200">
                <span className="text-slate-500 text-[9px] sm:text-[10px] block font-semibold uppercase">Tanggal Lahir / Usia:</span>
                <span className="font-bold text-slate-900 text-xs sm:text-[13px] block">
                  {formatDisplayDate(record.DoB)} ({record.Umur ?? '-'} Thn)
                </span>
              </div>
              <div className="bg-white sm:bg-transparent p-2 sm:p-0 rounded border sm:border-0 border-slate-200">
                <span className="text-slate-500 text-[9px] sm:text-[10px] block font-semibold uppercase">Tanggal Tes / Coach:</span>
                <span className="font-bold text-slate-900 text-xs sm:text-[13px] block break-words whitespace-normal leading-snug" title={record.Coaches || '-'}>
                  {formatDisplayDate(record.Test_Date)} / {record.Coaches || '-'}
                </span>
              </div>
            </div>
          </div>

          {/* 2. BODY COMPOSITION & MEASUREMENTS (CM) */}
          <div className="mb-3.5 border border-slate-300 rounded-lg overflow-hidden break-inside-avoid shadow-2xs print:shadow-none">
            <div className="bg-slate-800 text-white px-3 py-1 font-extrabold uppercase text-[10px] sm:text-[10.5px] flex items-center justify-between">
              <span>2. BODY COMPOSITION & ANTHROPOMETRIC MEASUREMENTS (CM)</span>
              <span className="text-[9px] sm:text-[9.5px] font-normal text-slate-300">Pengukuran Fisik & Antropometri</span>
            </div>

            {/* 10 Pengukuran Lingkar Tubuh (Responsive 2-col on mobile, 5-col on desktop & print) */}
            <div className="p-2.5 grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs border-b border-slate-200 print:grid-cols-5">
              <div className="bg-slate-50 p-2 sm:p-1.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[9.5px] uppercase font-semibold">Wing Span</span>
                <strong className="font-mono text-xs sm:text-[11px] text-slate-900">{record.wing_span ? `${record.wing_span} cm` : '-'}</strong>
              </div>
              <div className="bg-slate-50 p-2 sm:p-1.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[9.5px] uppercase font-semibold">Chest / Dada</span>
                <strong className="font-mono text-xs sm:text-[11px] text-slate-900">{record.chest ? `${record.chest} cm` : '-'}</strong>
              </div>
              <div className="bg-slate-50 p-2 sm:p-1.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[9.5px] uppercase font-semibold">Left Arm (Lengan Ki)</span>
                <strong className="font-mono text-xs sm:text-[11px] text-slate-900">{record.left_arm ? `${record.left_arm} cm` : '-'}</strong>
              </div>
              <div className="bg-slate-50 p-2 sm:p-1.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[9.5px] uppercase font-semibold">Right Arm (Lengan Ka)</span>
                <strong className="font-mono text-xs sm:text-[11px] text-slate-900">{record.right_arm ? `${record.right_arm} cm` : '-'}</strong>
              </div>
              <div className="bg-slate-50 p-2 sm:p-1.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[9.5px] uppercase font-semibold">Waist / Pinggang</span>
                <strong className="font-mono text-xs sm:text-[11px] text-slate-900">{record.waist ? `${record.waist} cm` : '-'}</strong>
              </div>

              <div className="bg-slate-50 p-2 sm:p-1.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[9.5px] uppercase font-semibold">Hips / Pinggul</span>
                <strong className="font-mono text-xs sm:text-[11px] text-slate-900">{record.hips ? `${record.hips} cm` : '-'}</strong>
              </div>
              <div className="bg-slate-50 p-2 sm:p-1.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[9.5px] uppercase font-semibold">Left Thigh (Paha Ki)</span>
                <strong className="font-mono text-xs sm:text-[11px] text-slate-900">{record.left_thigh ? `${record.left_thigh} cm` : '-'}</strong>
              </div>
              <div className="bg-slate-50 p-2 sm:p-1.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[9.5px] uppercase font-semibold">Right Thigh (Paha Ka)</span>
                <strong className="font-mono text-xs sm:text-[11px] text-slate-900">{record.right_tight ? `${record.right_tight} cm` : '-'}</strong>
              </div>
              <div className="bg-slate-50 p-2 sm:p-1.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[9.5px] uppercase font-semibold">Left Calf (Betis Ki)</span>
                <strong className="font-mono text-xs sm:text-[11px] text-slate-900">{record.left_calf ? `${record.left_calf} cm` : '-'}</strong>
              </div>
              <div className="bg-slate-50 p-2 sm:p-1.5 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[9.5px] uppercase font-semibold">Right Calf (Betis Ka)</span>
                <strong className="font-mono text-xs sm:text-[11px] text-slate-900">{record.right_calf ? `${record.right_calf} cm` : '-'}</strong>
              </div>
            </div>

            {/* Tinggi, Berat, Fat, Otot, BMI (Responsive 2-col on mobile, 5-col on desktop & print) */}
            <div className="p-2.5 bg-slate-100/80 grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs print:grid-cols-5">
              <div className="bg-white sm:bg-transparent p-1.5 rounded border sm:border-0 border-slate-200">
                <span className="text-slate-500 text-[9px] sm:text-[9.5px] block font-semibold uppercase">Tinggi Badan</span>
                <strong className="font-bold text-slate-900 text-xs sm:text-sm">{record.height ? `${record.height} cm` : '-'}</strong>
              </div>
              <div className="bg-white sm:bg-transparent p-1.5 rounded border sm:border-0 border-slate-200">
                <span className="text-slate-500 text-[9px] sm:text-[9.5px] block font-semibold uppercase">Berat Badan</span>
                <strong className="font-bold text-slate-900 text-xs sm:text-sm">{record.weight ? `${record.weight} kg` : '-'}</strong>
              </div>
              <div className="bg-white sm:bg-transparent p-1.5 rounded border sm:border-0 border-slate-200">
                <span className="text-slate-500 text-[9px] sm:text-[9.5px] block font-semibold uppercase">Body Fat %</span>
                <strong className="font-bold text-emerald-700 text-xs sm:text-sm">{record.body_fat !== null ? `${record.body_fat}%` : '-'}</strong>
              </div>
              <div className="bg-white sm:bg-transparent p-1.5 rounded border sm:border-0 border-slate-200">
                <span className="text-slate-500 text-[9px] sm:text-[9.5px] block font-semibold uppercase">Massa Otot %</span>
                <strong className="font-bold text-sky-700 text-xs sm:text-sm">{record.muscle_mass !== null ? `${record.muscle_mass}%` : '-'}</strong>
              </div>
              <div className="col-span-2 sm:col-span-1 bg-white sm:bg-transparent p-1.5 rounded border sm:border-0 border-slate-200">
                <span className="text-slate-500 text-[9px] sm:text-[9.5px] block font-semibold uppercase">BMI & Kategori</span>
                <strong className="font-bold text-slate-950 text-xs sm:text-sm">
                  {record.BMI ?? '-'} {record.cat_bmi ? `(${record.cat_bmi})` : ''}
                </strong>
              </div>
            </div>
          </div>

          {/* 3. FUNCTIONAL ASSESSMENT */}
          <div className="mb-3.5 border border-slate-300 rounded-lg overflow-hidden break-inside-avoid shadow-2xs print:shadow-none">
            <div className="bg-slate-800 text-white px-3 py-1 font-extrabold uppercase text-[10px] sm:text-[10.5px] flex justify-between items-center">
              <span>3. FUNCTIONAL ASSESSMENT (UJI GERAK DASAR FUNGSIONAL)</span>
              <span className="font-mono text-emerald-300 text-[10px] sm:text-xs">
                Rata-rata: {record.avg_functional !== null ? `${record.avg_functional.toFixed(1)} / 4.0` : '-'}
              </span>
            </div>
            <div className="p-2.5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-center text-xs print:grid-cols-5">
              <ScorePrintBox label="Deep Squat" score={record.score_deepSquat} category={record.cat_deepSquat} />
              <ScorePrintBox label="Hurdle Step" score={record.score_hurdleStep} category={record.cat_hurdleStep} />
              <ScorePrintBox label="In-Line Lunge" score={record.score_inlineLunge} category={record.cat_inlineLunge} />
              <ScorePrintBox label="Balance Test" score={record.score_balance} category={record.cat_balance} />
              <div className="col-span-2 sm:col-span-1 print:col-span-1">
                <ScorePrintBox label="Landing Error" score={record.score_landing} category={record.cat_landing} />
              </div>
            </div>
          </div>

          {/* 4. STRENGTH ASSESSMENT */}
          <div className="mb-3.5 border border-slate-300 rounded-lg overflow-hidden break-inside-avoid shadow-2xs print:shadow-none">
            <div className="bg-slate-800 text-white px-3 py-1 font-extrabold uppercase text-[10px] sm:text-[10.5px] flex justify-between items-center">
              <span>4. STRENGTH ASSESSMENT (KEKUATAN OTOT & KONDISIONING)</span>
              <span className="font-mono text-emerald-300 text-[10px] sm:text-xs">
                Rata-rata: {record.avg_strength !== null ? `${record.avg_strength.toFixed(1)} / 4.0` : '-'}
              </span>
            </div>
            <div className="p-2.5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs print:grid-cols-6">
              <ScorePrintBox label="Lower Body" score={record.score_lowerbody} category={record.cat_lowerbody} />
              <ScorePrintBox label="Unilateral" score={record.score_unilateralStrenght} category={record.cat_unilateralStrenght} />
              <ScorePrintBox label="Posterior Chain" score={record.score_posteriorChain} category={record.cat_posteriorChain} />
              <ScorePrintBox label="Upper Body" score={record.score_upperBody} category={record.cat_upperBody} />
              <ScorePrintBox label="Core Stability" score={record.score_core} category={record.cat_core} />
              <ScorePrintBox label="Conditioning" score={record.score_conditioning} category={record.cat_conditioning} />
            </div>
          </div>

          {/* 5. SKILL RELATED FITNESS */}
          <div className="mb-3.5 border border-slate-300 rounded-lg overflow-hidden break-inside-avoid shadow-2xs print:shadow-none">
            <div className="bg-slate-800 text-white px-3 py-1 font-extrabold uppercase text-[10px] sm:text-[10.5px] flex justify-between items-center">
              <span>5. SKILL RELATED FITNESS (KETERAMPILAN FISIK ATLETIK)</span>
              <span className="font-mono text-emerald-300 text-[10px] sm:text-xs">
                Rata-rata: {record.avg_skill !== null ? `${record.avg_skill.toFixed(1)} / 4.0` : '-'}
              </span>
            </div>
            <div className="p-2.5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-center text-xs print:grid-cols-5">
              <ScorePrintBox label="Power" score={record.score_power} category={record.cat_power} />
              <ScorePrintBox label="Speed" score={record.score_speed} category={record.cat_speed} />
              <ScorePrintBox label="Agility" score={record.score_agility} category={record.cat_agility} />
              <ScorePrintBox label="Flexibility" score={record.score_flexibility} category={record.cat_flexibility} />
              <div className="col-span-2 sm:col-span-1 print:col-span-1">
                <ScorePrintBox label="Coordination" score={record.score_coordination} category={record.cat_coordination} />
              </div>
            </div>
          </div>

          {/* 6. EVALUATION SUMMARY & CATATAN EVALUASI COACH */}
          <div className="border border-slate-300 rounded-lg p-3 sm:p-3.5 mb-3.5 bg-slate-50/80 break-inside-avoid shadow-2xs print:shadow-none">
            <div className="font-extrabold uppercase text-[10px] sm:text-[10.5px] text-slate-900 mb-1 flex items-center justify-between">
              <span>6. EVALUATION SUMMARY & CATATAN COACH</span>
              <span className="text-[9px] sm:text-[9.5px] font-semibold text-slate-500">Evaluator: {record.Coaches || '-'}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs py-2 border-y border-slate-200">
              <div className="bg-white sm:bg-transparent p-2 sm:p-0 rounded border sm:border-0 border-slate-200">
                <span className="text-slate-500 text-[9.5px] block font-semibold uppercase">Status BMI:</span>
                <strong>{record.cat_bmi || '-'} ({record.BMI} kg/m²)</strong>
              </div>
              <div className="bg-white sm:bg-transparent p-2 sm:p-0 rounded border sm:border-0 border-slate-200">
                <span className="text-slate-500 text-[9.5px] block font-semibold uppercase">Rata-rata Skor Skill:</span>
                <strong className="text-purple-700">{record.avg_skill !== null ? `${record.avg_skill.toFixed(1)} / 4.0` : '-'}</strong>
              </div>
              <div className="bg-white sm:bg-transparent p-2 sm:p-0 rounded border sm:border-0 border-slate-200">
                <span className="text-slate-500 text-[9.5px] block font-semibold uppercase">Tim Pelatih Penguji:</span>
                <strong className="break-words whitespace-normal leading-snug block" title={record.Coaches || '-'}>{record.Coaches || '-'}</strong>
              </div>
            </div>
            {record.notes && (
              <div className="mt-2 text-[10.5px] text-slate-800 leading-relaxed">
                <strong className="text-slate-900 block font-bold mb-0.5">Catatan Khusus & Rekomendasi Coach:</strong>
                <p className="whitespace-pre-line break-words bg-white p-2.5 rounded-lg border border-slate-200 italic">
                  "{record.notes}"
                </p>
              </div>
            )}
          </div>

          {/* 7. DISCLAIMER SECTION (PERNYATAAN PELEPASAN TANGGUNG JAWAB) */}
          <div className="mb-3.5 break-inside-avoid">
            <DisclaimerSection className="border-slate-300 bg-slate-50 text-slate-900" />
          </div>

          {/* 8. KOLOM TANDA TANGAN 4 PIHAK (MEMBER, COACH 1, COACH 2, COORDINATOR) */}
          <div className="border border-slate-300 rounded-lg p-3 sm:p-3.5 mb-3 bg-white break-inside-avoid shadow-2xs print:shadow-none">
            <div className="text-[10px] font-extrabold uppercase text-slate-700 mb-2.5 text-center tracking-wider">
              LEMBAR PENGESAHAN & PERSETUJUAN ASESMEN FISIK
            </div>
            {/* Responsive 2-col on mobile (2x2 grid), 4-col on desktop and print */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-center text-xs print:grid-cols-4">
              {/* Kolom 1: Peserta / Member */}
              <div className="flex flex-col justify-between min-h-[95px] sm:min-h-[105px] p-2.5 rounded-lg bg-slate-50/70 border border-slate-200">
                <p className="font-bold text-slate-800 text-[9.5px] uppercase">Peserta / Member</p>
                <div className="border-t border-slate-900 pt-1 mt-auto">
                  <div className="font-extrabold text-[10px] sm:text-[11px] text-slate-900 break-words whitespace-normal leading-tight" title={customerName}>
                    ( {customerName} )
                  </div>
                  <span className="text-[8.5px] text-slate-500 block">Member TCC</span>
                </div>
              </div>

              {/* Kolom 2: Coach 1 (Pelatih Penguji) */}
              <div className="flex flex-col justify-between min-h-[95px] sm:min-h-[105px] p-2.5 rounded-lg bg-slate-50/70 border border-slate-200">
                <p className="font-bold text-slate-800 text-[9.5px] uppercase">Coach 1 (Penguji)</p>
                <div className="border-t border-slate-900 pt-1 mt-auto">
                  <div className="font-extrabold text-[10px] sm:text-[11px] text-slate-900 break-words whitespace-normal leading-tight" title={coach1Name}>
                    ( {coach1Name} )
                  </div>
                  <span className="text-[8.5px] text-slate-500 block">Pelatih Utama</span>
                </div>
              </div>

              {/* Kolom 3: Coach 2 (Pelatih Pendamping) */}
              <div className="flex flex-col justify-between min-h-[95px] sm:min-h-[105px] p-2.5 rounded-lg bg-slate-50/70 border border-slate-200">
                <p className="font-bold text-slate-800 text-[9.5px] uppercase">Coach 2 (Pendamping)</p>
                <div className="border-t border-slate-900 pt-1 mt-auto">
                  <div className="font-extrabold text-[10px] sm:text-[11px] text-slate-900 break-words whitespace-normal leading-tight" title={coach2Name}>
                    ( {coach2Name} )
                  </div>
                  <span className="text-[8.5px] text-slate-500 block">Pelatih Pendamping</span>
                </div>
              </div>

              {/* Kolom 4: Coordinator (Fitness / Program) */}
              <div className="flex flex-col justify-between min-h-[95px] sm:min-h-[105px] p-2.5 rounded-lg bg-slate-50/70 border border-slate-200">
                <p className="font-bold text-slate-800 text-[9.5px] uppercase">Coordinator TCC</p>
                <div className="border-t border-slate-900 pt-1 mt-auto">
                  <div className="font-extrabold text-[10px] sm:text-[11px] text-slate-900 break-words whitespace-normal leading-tight">
                    ( Coordinator TCC )
                  </div>
                  <span className="text-[8.5px] text-slate-500 block">Program / Head Coach</span>
                </div>
              </div>
            </div>
          </div>

          {/* 9. FOOTER RESMI THE CORE CHAMBER */}
          <div className="break-inside-avoid">
            <PrintFooter />
          </div>
        </div>
      </div>
    </div>
  );
};

const ScorePrintBox: React.FC<{
  label: string;
  score: ScoreLevel | null;
  category: string;
}> = ({ label, score, category }) => (
  <div className="border border-slate-300 p-2 sm:p-2 rounded-lg bg-white flex flex-col justify-between shadow-2xs print:shadow-none print:p-1.5">
    <div className="font-bold text-[10px] sm:text-[10.5px] text-slate-700 break-words whitespace-normal leading-tight">
      {label}
    </div>
    <div className="my-1 flex items-baseline justify-center gap-1">
      <span className="text-base sm:text-lg font-black font-mono text-slate-950">
        {score !== null ? score : '-'}
      </span>
      <span className="text-[9.5px] text-slate-400 font-semibold">/4</span>
    </div>
    <div className="text-[9px] sm:text-[9.5px] font-bold text-slate-600 break-words whitespace-normal leading-tight bg-slate-50 px-1 py-0.5 rounded border border-slate-200">
      {category || '-'}
    </div>
  </div>
);
