import React from 'react';
import { Instagram, Phone, Mail } from 'lucide-react';
import { TCCLogo } from './TCCLogo';

interface PrintFooterProps {
  className?: string;
  showTimestamp?: boolean;
}

export const PrintFooter: React.FC<PrintFooterProps> = ({
  className = '',
  showTimestamp = true,
}) => {
  return (
    <footer className={`mt-8 pt-4 border-t-2 border-slate-900 text-slate-800 text-center select-none print:mt-6 print:pt-3 print:border-slate-900 ${className}`}>
      {/* Centered Main Brand / Sponsor & Contact Bar */}
      <div className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-2 text-xs sm:text-[13px] font-semibold leading-relaxed print:text-[11px] print:gap-x-3">
        {/* Item 1: AIRZONE (@airzone_id) */}
        <div className="inline-flex items-center gap-1.5 shrink-0">
          <Instagram className="w-3.5 h-3.5 text-rose-600 shrink-0 print:w-3 print:h-3" />
          <span className="font-extrabold tracking-wide text-slate-950 uppercase">AIRZONE</span>
          <span className="text-slate-600 font-medium">(@airzone_id)</span>
        </div>

        {/* Separator */}
        <span className="text-slate-400 font-light select-none">|</span>

        {/* Item 2: Logo The Core Chamber */}
        <div className="inline-flex items-center gap-1.5 shrink-0">
          <div className="w-5 h-5 rounded-md bg-slate-950 p-0.5 flex items-center justify-center shrink-0 print:w-4.5 print:h-4.5">
            <TCCLogo className="w-full h-full text-white" variant="full" />
          </div>
          <span className="font-black tracking-wider text-slate-950 uppercase text-xs print:text-[10px]">
            THE CORE CHAMBER
          </span>
        </div>

        {/* Separator */}
        <span className="text-slate-400 font-light select-none">|</span>

        {/* Item 3: Phone : 0811-2112-1117, Email : admin.ho@airzone.id */}
        <div className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 text-slate-700 shrink-0">
          <span className="inline-flex items-center gap-1">
            <Phone className="w-3 h-3 text-emerald-600 shrink-0 print:w-2.5 print:h-2.5" />
            <span className="font-bold text-slate-900">Phone :</span>
            <span className="font-mono text-slate-800">0811-2112-1117</span>
          </span>
          <span className="text-slate-400">,</span>
          <span className="inline-flex items-center gap-1">
            <Mail className="w-3 h-3 text-sky-600 shrink-0 print:w-2.5 print:h-2.5" />
            <span className="font-bold text-slate-900">Email :</span>
            <span className="text-slate-800 font-mono">admin.ho@airzone.id</span>
          </span>
        </div>
      </div>

      {showTimestamp && (
        <div className="mt-2 text-[9px] text-slate-400 print:text-[8px] print:mt-1">
          THE CORE CHAMBER • Official Assessment & Score Card Document • Dicetak pada {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      )}
    </footer>
  );
};
