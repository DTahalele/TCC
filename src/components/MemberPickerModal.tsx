import React, { useState, useMemo } from 'react';
import { Search, UserCheck, Plus, X, Calendar, ArrowRight } from 'lucide-react';
import { ScoreCardRecord } from '../types/scoreCard';

interface MemberPickerModalProps {
  records: ScoreCardRecord[];
  isOpen: boolean;
  onClose: () => void;
  onSelectMemberForNewSession: (member: ScoreCardRecord) => void;
  onStartBrandNewMember: () => void;
}

export const MemberPickerModal: React.FC<MemberPickerModalProps> = ({
  records,
  isOpen,
  onClose,
  onSelectMemberForNewSession,
  onStartBrandNewMember,
}) => {
  const [search, setSearch] = useState('');

  // Extract unique members (by MemberID or Name)
  const uniqueMembers = useMemo(() => {
    const memberMap = new Map<string, ScoreCardRecord>();
    records.forEach((r) => {
      const key = r.MemberID || r.Full_Name;
      if (key && !memberMap.has(key)) {
        memberMap.set(key, r);
      }
    });
    return Array.from(memberMap.values());
  }, [records]);

  const filteredMembers = useMemo(() => {
    return uniqueMembers.filter((m) => {
      const q = search.toLowerCase();
      return (
        (m.Full_Name || '').toLowerCase().includes(q) ||
        (m.MemberID || '').toLowerCase().includes(q)
      );
    });
  }, [uniqueMembers, search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">
                PILIH MEMBER TCC (SESI BARU)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pilih member yang sudah terdaftar untuk membuat sesi assessment baru
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & New Member button */}
        <div className="p-4 bg-slate-50/50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama member atau nomor ID (TCC-xxxx)..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              onStartBrandNewMember();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Daftarkan Member Baru Baru (TCC ID Baru)</span>
          </button>
        </div>

        {/* Member List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100 dark:divide-slate-800">
          {filteredMembers.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p className="text-xs font-semibold">Tidak ditemukan member dengan nama atau ID tersebut.</p>
              <button
                type="button"
                onClick={() => {
                  onStartBrandNewMember();
                  onClose();
                }}
                className="mt-2 text-xs font-bold text-emerald-600 hover:underline"
              >
                Mulai dengan Member Baru sekarang
              </button>
            </div>
          ) : (
            filteredMembers.map((m) => (
              <div
                key={m.id}
                onClick={() => {
                  onSelectMemberForNewSession(m);
                  onClose();
                }}
                className="py-3 px-3 rounded-xl hover:bg-emerald-50/50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between transition-colors group"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                      {m.Full_Name}
                    </span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                      {m.MemberID}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <span>Gender: {m.Gender || '-'}</span>
                    <span>•</span>
                    <span>DoB: {m.DoB || '-'}</span>
                    {m.Umur !== null && <span>({m.Umur} thn)</span>}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 opacity-80 group-hover:opacity-100 transition-opacity">
                  <span>Mulai Sesi</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
