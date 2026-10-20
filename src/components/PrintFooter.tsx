import React from 'react';
import { TCCLogo } from './TCCLogo';
import { formatDisplayDate } from '../utils/dateFormatter';

interface PrintFooterProps {
  className?: string;
  showTimestamp?: boolean;
}

export const PrintFooter: React.FC<PrintFooterProps> = ({
  className = '',
  showTimestamp = true,
}) => {
  return (
    <div
      role="contentinfo"
      className={`mt-8 pt-4 border-t-2 border-slate-900 text-slate-800 text-center select-none print:mt-6 print:pt-3 print:border-slate-900 ${className}`}
    >
      {/* Centered Main Brand & Contact Bar (Left to Right, no icons, no overlap) */}
      <div className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1.5 text-xs sm:text-[13px] font-semibold leading-normal print:text-[10px] print:gap-x-2.5">
        {/* Item 1: AIRZONE (@airzone_id) */}
        <div className="inline-flex items-center gap-1 shrink-0 whitespace-nowrap">
          <span className="font-extrabold tracking-wide text-slate-950 uppercase">AIRZONE</span>
          <span className="text-slate-600 font-medium">(@airzone_id)</span>
        </div>

        {/* Separator */}
        <span className="text-slate-300 font-light select-none shrink-0" aria-hidden="true">|</span>

        {/* Item 2: Logo & Judul THE CORE CHAMBER */}
        <div className="inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap">
          <div className="w-4.5 h-4.5 rounded bg-slate-950 p-0.5 flex items-center justify-center shrink-0 print:w-4 print:h-4">
            <TCCLogo className="w-full h-full text-white" variant="full" />
          </div>
          <span className="font-black tracking-wider text-slate-950 uppercase text-xs print:text-[10px]">
            THE CORE CHAMBER
          </span>
        </div>

        {/* Separator */}
        <span className="text-slate-300 font-light select-none shrink-0" aria-hidden="true">|</span>

        {/* Item 3: Phone */}
        <div className="inline-flex items-center gap-1 shrink-0 whitespace-nowrap text-slate-800">
          <span className="font-bold text-slate-950">Phone:</span>
          <span className="font-mono text-slate-800">0811-2112-1117</span>
        </div>

        {/* Separator */}
        <span className="text-slate-300 font-light select-none shrink-0" aria-hidden="true">|</span>

        {/* Item 4: Email */}
        <div className="inline-flex items-center gap-1 shrink-0 whitespace-nowrap text-slate-800">
          <span className="font-bold text-slate-950">Email:</span>
          <span className="font-mono text-slate-800">admin.ho@airzone.id</span>
        </div>
      </div>

      {showTimestamp && (
        <div className="mt-2 text-[9px] text-slate-400 print:text-[8px] print:mt-1">
          THE CORE CHAMBER • Official Assessment & Score Card Document • Dicetak pada {formatDisplayDate(new Date())}
        </div>
      )}
    </div>
  );
};

