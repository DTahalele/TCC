import React, { useMemo } from 'react';
import { ScoreCardRecord, SCORE_CATEGORIES, ScoreLevel } from '../types/scoreCard';
import { TCCLogo } from './TCCLogo';
import { PrintFooter } from './PrintFooter';
import { DisclaimerSection } from './DisclaimerSection';
import { formatDisplayDate } from '../utils/dateFormatter';

interface PrintViewProps {
  record: ScoreCardRecord;
}

export const PrintView: React.FC<PrintViewProps> = ({ record }) => {
  const coachesList = useMemo(() => {
    if (!record.Coaches) return [];
    return record.Coaches.split(',').map((c) => c.trim()).filter(Boolean);
  }, [record.Coaches]);

  const customerName =
    record.Full_Name ||
    (record as any).fullName ||
    (record as any).Nama ||
    (record as any).nama ||
    (record as any).Name ||
    (record as any).name ||
    'Nama Peserta';

  return (
    <div className="hidden print:block text-black bg-white p-6 max-w-[210mm] mx-auto text-xs font-sans print-container">
      {/* Print Header */}
      <div className="border-b-2 border-black pb-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 border border-slate-300 rounded-lg p-1 flex items-center justify-center shrink-0">
            <TCCLogo className="w-full h-full text-slate-950" variant="full" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold uppercase tracking-tight">
              <span>THE </span><span className="text-red-600">CORE</span><span> CHAMBER</span>
            </h1>
            <p className="text-xs font-bold tracking-wider uppercase text-slate-700">
              FORM - PHYSICAL FITNESS SCOR CARD & DATA MEMBER
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-mono font-bold border border-black px-2.5 py-1 rounded inline-block">
            {record.MemberID || 'TCC-XXXX'}
          </div>
          <div className="text-[10px] mt-1 font-semibold uppercase">
            Kategori: {record.Customer_type === 'member' ? 'Member TCC' : 'Trial User'}
          </div>
        </div>
      </div>

      {/* 1. Personal Info */}
      <div className="mb-4">
        <div className="bg-slate-200 px-2 py-1 font-bold uppercase text-[11px] mb-2">
          1. PERSONAL DATA
        </div>
        <div className="grid grid-cols-4 gap-2 text-[11px]">
          <div>
            <span className="text-slate-600 block">Nama Lengkap:</span>
            <span className="font-bold">{customerName}</span>
          </div>
          <div>
            <span className="text-slate-600 block">Gender:</span>
            <span className="font-bold capitalize">{record.Gender || '-'}</span>
          </div>
          <div>
            <span className="text-slate-600 block">Tanggal Lahir:</span>
            <span className="font-bold">{formatDisplayDate(record.DoB)} ({record.Umur ?? '-'} Thn)</span>
          </div>
          <div>
            <span className="text-slate-600 block">Tanggal Tes / Coach:</span>
            <span className="font-bold">{formatDisplayDate(record.Test_Date)} / {record.Coaches || '-'}</span>
          </div>
        </div>
      </div>

      {/* 2. Body Composition & Measurements */}
      <div className="mb-4">
        <div className="bg-slate-200 px-2 py-1 font-bold uppercase text-[11px] mb-2">
          2. BODY COMPOSITION & MEASUREMENTS (CM)
        </div>
        <div className="grid grid-cols-5 gap-2 border border-slate-300 p-2 mb-2 text-center text-[10px]">
          <div>Wing Span: <strong className="font-mono">{record.wing_span ?? '-'} cm</strong></div>
          <div>Chest: <strong className="font-mono">{record.chest ?? '-'} cm</strong></div>
          <div>Left Arm: <strong className="font-mono">{record.left_arm ?? '-'} cm</strong></div>
          <div>Right Arm: <strong className="font-mono">{record.right_arm ?? '-'} cm</strong></div>
          <div>Waist: <strong className="font-mono">{record.waist ?? '-'} cm</strong></div>
          <div>Hips: <strong className="font-mono">{record.hips ?? '-'} cm</strong></div>
          <div>Left Thigh: <strong className="font-mono">{record.left_thigh ?? '-'} cm</strong></div>
          <div>Right Thigh: <strong className="font-mono">{record.right_tight ?? '-'} cm</strong></div>
          <div>Left Calf: <strong className="font-mono">{record.left_calf ?? '-'} cm</strong></div>
          <div>Right Calf: <strong className="font-mono">{record.right_calf ?? '-'} cm</strong></div>
        </div>
        <div className="grid grid-cols-5 gap-2 border border-black p-2 bg-slate-50 text-center text-[10px]">
          <div>Tinggi: <strong>{record.height ?? '-'} cm</strong></div>
          <div>Berat: <strong>{record.weight ?? '-'} kg</strong></div>
          <div>Body Fat: <strong>{record.body_fat !== null ? `${record.body_fat}%` : '-'}</strong></div>
          <div>Massa Otot: <strong>{record.muscle_mass !== null ? `${record.muscle_mass}%` : '-'}</strong></div>
          <div>BMI: <strong>{record.BMI ?? '-'} ({record.cat_bmi || '-'})</strong></div>
        </div>
      </div>

      {/* 3. Functional Assessment */}
      <div className="mb-4">
        <div className="bg-slate-200 px-2 py-1 font-bold uppercase text-[11px] mb-2 flex justify-between">
          <span>3. FUNCTIONAL ASSESSMENT</span>
          <span>Avg: {record.avg_functional?.toFixed(2) ?? '-'}</span>
        </div>
        <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
          <ScorePrintBox label="Deep Squat" score={record.score_deepSquat} category={record.cat_deepSquat} />
          <ScorePrintBox label="Hurdle Step" score={record.score_hurdleStep} category={record.cat_hurdleStep} />
          <ScorePrintBox label="In-Line Lunge" score={record.score_inlineLunge} category={record.cat_inlineLunge} />
          <ScorePrintBox label="Balance" score={record.score_balance} category={record.cat_balance} />
          <ScorePrintBox label="Landing" score={record.score_landing} category={record.cat_landing} />
        </div>
      </div>

      {/* 4. Strength */}
      <div className="mb-4">
        <div className="bg-slate-200 px-2 py-1 font-bold uppercase text-[11px] mb-2 flex justify-between">
          <span>4. STRENGTH</span>
          <span>Avg: {record.avg_strength?.toFixed(2) ?? '-'}</span>
        </div>
        <div className="grid grid-cols-6 gap-2 text-center text-[10px]">
          <ScorePrintBox label="Lower Body" score={record.score_lowerbody} category={record.cat_lowerbody} />
          <ScorePrintBox label="Unilateral" score={record.score_unilateralStrenght} category={record.cat_unilateralStrenght} />
          <ScorePrintBox label="Posterior" score={record.score_posteriorChain} category={record.cat_posteriorChain} />
          <ScorePrintBox label="Upper Body" score={record.score_upperBody} category={record.cat_upperBody} />
          <ScorePrintBox label="Core" score={record.score_core} category={record.cat_core} />
          <ScorePrintBox label="Conditioning" score={record.score_conditioning} category={record.cat_conditioning} />
        </div>
      </div>

      {/* 5. Skill Related Fitness */}
      <div className="mb-4">
        <div className="bg-slate-200 px-2 py-1 font-bold uppercase text-[11px] mb-2 flex justify-between">
          <span>5. SKILL RELATED FITNESS</span>
          <span>Avg: {record.avg_skill?.toFixed(2) ?? '-'} / 4.0</span>
        </div>
        <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
          <ScorePrintBox label="Power" score={record.score_power} category={record.cat_power} />
          <ScorePrintBox label="Speed" score={record.score_speed} category={record.cat_speed} />
          <ScorePrintBox label="Agility" score={record.score_agility} category={record.cat_agility} />
          <ScorePrintBox label="Flexibility" score={record.score_flexibility} category={record.cat_flexibility} />
          <ScorePrintBox label="Coordination" score={record.score_coordination} category={record.cat_coordination} />
        </div>
      </div>

      {/* 6. Summary & Signatures */}
      <div className="border border-black p-3 mb-4 bg-slate-50">
        <div className="font-bold uppercase text-[11px] mb-1">EVALUATION SUMMARY</div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>Status BMI: <strong>{record.cat_bmi || '-'} ({record.BMI} kg/m²)</strong></div>
          <div>Avg Skill Score: <strong>{record.avg_skill ?? '-'} / 4.0</strong></div>
          <div>Coach Evaluator: <strong>{record.Coaches || '-'}</strong></div>
        </div>
        {record.notes && (
          <div className="mt-2 text-[10px] text-slate-700">
            <strong>Catatan:</strong> {record.notes}
          </div>
        )}
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-8 pt-4 text-center text-[10px]">
        <div>
          <p className="mb-12">Peserta / Member Assessment</p>
          <div className="border-t border-black w-48 mx-auto font-bold pt-1">
            ( {customerName} )
          </div>
        </div>
        <div>
          <p className="mb-12">Coach / Instruktur Penguji</p>
          {coachesList.length > 1 ? (
            <div className="flex flex-wrap justify-center gap-4">
              {coachesList.map((coachName) => (
                <div key={coachName} className="min-w-[120px] max-w-[160px]">
                  <div className="border-t border-black px-2 font-bold pt-1 text-[9.5px]">
                    ( {coachName} )
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-t border-black w-48 mx-auto font-bold pt-1">
              ( {coachesList[0] || record.Coaches || 'Coach TCC'} )
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer Box before Footer */}
      <div className="pt-4">
        <DisclaimerSection className="border-black/60 bg-slate-50 text-slate-900" />
      </div>

      {/* Centered Brand & Contact Footer */}
      <PrintFooter />
    </div>
  );
};

const ScorePrintBox: React.FC<{ label: string; score: ScoreLevel | null; category: string }> = ({
  label,
  score,
  category,
}) => (
  <div className="border border-slate-300 p-1.5 rounded">
    <div className="font-semibold truncate">{label}</div>
    <div className="text-sm font-bold font-mono my-0.5">{score ?? '-'}</div>
    <div className="text-[9px] text-slate-600 truncate">{category || '-'}</div>
  </div>
);
