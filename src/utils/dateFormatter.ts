const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * Format any date string or Date object into "DD Mon YYYY" (e.g. "19 Oct 2026").
 * Safeguarded against timezone offset shifts by parsing YYYY-MM-DD parts directly.
 */
export function formatDisplayDate(
  val: string | Date | null | undefined,
  fallback: string = '-'
): string {
  if (!val) return fallback;

  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (
      !trimmed ||
      trimmed === '-' ||
      trimmed === 'Belum Ada Jadwal' ||
      trimmed === 'Belum Dijadwalkan' ||
      trimmed === 'Belum Ditentukan'
    ) {
      return fallback;
    }

    // Check if already formatted like "19 Oct 2026"
    if (/^\d{1,2}\s+[A-Za-z]{3}\s+\d{4}$/.test(trimmed)) {
      return trimmed;
    }

    // Handle "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm:ss..." directly
    const datePart = trimmed.split('T')[0].trim();
    const parts = datePart.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      const year = parseInt(parts[0], 10);
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (
        !isNaN(year) &&
        !isNaN(monthIdx) &&
        !isNaN(day) &&
        monthIdx >= 0 &&
        monthIdx < 12 &&
        day > 0 &&
        day <= 31
      ) {
        return `${day} ${MONTHS_SHORT[monthIdx]} ${year}`;
      }
    }

    // Try parsing as standard Date
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
    }

    return trimmed;
  }

  if (val instanceof Date) {
    if (isNaN(val.getTime())) return fallback;
    return `${val.getDate()} ${MONTHS_SHORT[val.getMonth()]} ${val.getFullYear()}`;
  }

  return fallback;
}
