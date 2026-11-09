/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GradeLevel, ScoreHistoryEntry } from '../types/quiz';
import { X, Undo2, Clock, Trash2 } from 'lucide-react';

interface HistoryLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  gradeLevel: GradeLevel;
  history: ScoreHistoryEntry[];
  onUndoEntry: (entry: ScoreHistoryEntry) => void;
  onClearHistory: () => void;
}

export const HistoryLogModal: React.FC<HistoryLogModalProps> = ({
  isOpen,
  onClose,
  gradeLevel,
  history,
  onUndoEntry,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Audit Trail Nilai
            </span>
            <h3 className="font-display font-bold text-lg text-white">
              Riwayat Penilaian — Tingkat Kelas {gradeLevel}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-2.5">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Belum ada riwayat perubahan skor untuk tingkat ini.</p>
            </div>
          ) : (
            history.map((entry, idx) => {
              const isPositive = entry.delta > 0;
              const isLatest = idx === 0;

              return (
                <div
                  key={entry.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                    isLatest
                      ? 'bg-slate-800/80 border-slate-700'
                      : 'bg-slate-950/60 border-slate-800/80'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-sm text-white truncate">
                        {entry.teamName}
                      </span>
                      <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {entry.round}
                      </span>
                      {isLatest && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Terbaru
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                      {entry.note || 'Perubahan nilai'}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {new Date(entry.timestamp).toLocaleTimeString()} · Sebelum: {entry.scoreBefore} → Sesudah: {entry.scoreAfter}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`font-mono tabular-nums text-lg font-black ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPositive ? `+${entry.delta}` : entry.delta}
                    </span>

                    <button
                      onClick={() => onUndoEntry(entry)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="Batalkan perubahan ini"
                    >
                      <Undo2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Undo</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/50">
            <span className="text-xs text-slate-500">
              Total {history.length} entri tercatat
            </span>
            <button
              onClick={onClearHistory}
              className="px-3 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-rose-900/40 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bersihkan Riwayat</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
