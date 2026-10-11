import React from 'react';
import { ScoreLevel } from '../types/scoreCard';

export interface ScoreItemConfig {
  scoreKey: string;
  catKey: string;
  label: string;
  currentScore: ScoreLevel | null;
  currentCategory: string;
}

interface ScoringSectionProps {
  sectionTitle: string;
  subtitle: string;
  items: ScoreItemConfig[];
  averageScore: number | null;
  averageCategory: string;
  onScoreSelect: (scoreKey: string, catKey: string, score: ScoreLevel) => void;
}

export const ScoringSection: React.FC<ScoringSectionProps> = ({
  sectionTitle,
  subtitle,
  items,
  averageScore,
  averageCategory,
  onScoreSelect,
}) => {
  const filledCount = items.filter((i) => i.currentScore !== null).length;
  const totalCount = items.length;
  const isComplete = filledCount === totalCount;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-extrabold uppercase tracking-tight text-slate-950 dark:text-white">
              {sectionTitle}
            </h3>
            {isComplete && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Lengkap ({totalCount}/{totalCount})
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        </div>

        {/* Dynamic Average Pill */}
        <div className="self-start sm:self-auto">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-2xs">
            <span className="text-slate-500 dark:text-slate-400">Avg:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {averageScore !== null ? averageScore.toFixed(2) : '-.--'}
            </span>
            {averageCategory && (
              <span className={`text-[11px] font-bold px-1.5 py-0.2 rounded ${getCategoryPillStyle(averageCategory)}`}>
                ({averageCategory})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {items.map((item) => (
          <ScoreItemCard
            key={item.scoreKey}
            item={item}
            onSelect={(score) => onScoreSelect(item.scoreKey, item.catKey, score)}
          />
        ))}
      </div>
    </div>
  );
};

interface ScoreItemCardProps {
  item: ScoreItemConfig;
  onSelect: (score: ScoreLevel) => void;
}

const ScoreItemCard: React.FC<ScoreItemCardProps> = ({ item, onSelect }) => {
  const isFilled = item.currentScore !== null;

  return (
    <div
      className={`p-3.5 rounded-xl border transition-all ${
        isFilled
          ? 'bg-emerald-50/20 dark:bg-slate-850 border-emerald-300/80 dark:border-emerald-900/60 shadow-2xs'
          : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
      }`}
    >
      {/* Card Header: Title, Filled Check, and Category Badge */}
      <div className="flex items-center justify-between gap-1 mb-2.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
            {item.label}
          </span>
          {isFilled && (
            <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold whitespace-nowrap">
              ✓ Terisi
            </span>
          )}
        </div>

        {item.currentCategory && (
          <span
            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border whitespace-nowrap transition-colors ${getCategoryBadgeStyle(
              item.currentCategory
            )}`}
          >
            {item.currentCategory}
          </span>
        )}
      </div>

      {/* 1 - 4 Scale Buttons */}
      <div className="grid grid-cols-4 gap-1.5">
        {[1, 2, 3, 4].map((num) => {
          const score = num as ScoreLevel;
          const isSelected = item.currentScore === score;

          return (
            <button
              key={score}
              type="button"
              onClick={() => onSelect(score)}
              className={`py-2 rounded-lg font-mono text-xs font-bold transition-all ${getButtonScoreStyle(
                score,
                isSelected
              )}`}
            >
              {score}
            </button>
          );
        })}
      </div>
    </div>
  );
};

function getButtonScoreStyle(score: ScoreLevel, isSelected: boolean): string {
  if (!isSelected) {
    return 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700';
  }

  // Active styles matching mockup
  switch (score) {
    case 1:
      return 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border border-slate-800 dark:border-slate-200 shadow-xs';
    case 2:
      return 'bg-amber-500 text-white border border-amber-600 shadow-xs';
    case 3:
      // Emerald as shown in mockup
      return 'bg-emerald-600 text-white border border-emerald-600 shadow-xs ring-2 ring-emerald-500/20';
    case 4:
      // Purple / Violet as shown in mockup for great scores
      return 'bg-purple-600 text-white border border-purple-600 shadow-xs ring-2 ring-purple-500/20';
    default:
      return 'bg-slate-900 text-white';
  }
}

function getCategoryBadgeStyle(category: string): string {
  if (category.includes('Great') || category.includes('baik sekali')) {
    return 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
  }
  if (category.includes('Good') || category.includes('baik')) {
    return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
  }
  if (category.includes('Fair') || category.includes('cukup')) {
    return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
  }
  return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700';
}

function getCategoryPillStyle(category: string): string {
  if (category.includes('Great') || category.includes('baik sekali')) {
    return 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300';
  }
  if (category.includes('Good') || category.includes('baik')) {
    return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300';
  }
  if (category.includes('Fair') || category.includes('cukup')) {
    return 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300';
  }
  return 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
}
