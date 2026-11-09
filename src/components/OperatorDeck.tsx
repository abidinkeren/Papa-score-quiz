/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Team, GradeLevel, RoundType, ScoreHistoryEntry } from '../types/quiz';
import { TimerWidget } from './TimerWidget';
import { CheckCircle2, XCircle, Undo2, Plus, Minus, Send, Edit3, Sparkles } from 'lucide-react';
import { playCorrect, playWrong, playBuzzer } from '../utils/sound';
import { broadcastSound } from '../utils/sync';

interface OperatorDeckProps {
  gradeLevel: GradeLevel;
  teams: Team[];
  activeRound: RoundType;
  onChangeRound: (round: RoundType) => void;
  activeTeamId: string;
  onSelectTeam: (teamId: string) => void;
  onApplyScoreDelta: (teamId: string, delta: number, note?: string) => void;
  onUndoLastAction: () => void;
  canUndo: boolean;
  lastHistoryEntry?: ScoreHistoryEntry;
  soundEnabled: boolean;
  onEditTeam: (team: Team) => void;
}

export const OperatorDeck: React.FC<OperatorDeckProps> = ({
  gradeLevel,
  teams,
  activeRound,
  onChangeRound,
  activeTeamId,
  onSelectTeam,
  onApplyScoreDelta,
  onUndoLastAction,
  canUndo,
  lastHistoryEntry,
  soundEnabled,
  onEditTeam,
}) => {
  const [customDelta, setCustomDelta] = useState<string>('');
  const [customNote, setCustomNote] = useState<string>('');

  const activeTeam = teams.find((t) => t.id === activeTeamId) || teams[0];

  // Keyboard shortcut listener: pressing A, B, C, D, E, F selects corresponding team
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      const key = e.key.toUpperCase();
      const matched = teams.find((t) => t.code === key);
      if (matched) {
        onSelectTeam(matched.id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [teams, onSelectTeam]);

  // Round points definition
  const roundPoints = {
    wajib: { correct: 100, wrong: 0 },
    lemparan: { correct: 100, wrong: 0 },
    rebutan: { correct: 100, wrong: -100 },
  };

  const handleCorrect = () => {
    playCorrect(soundEnabled);
    broadcastSound('correct');
    const pts = roundPoints[activeRound].correct;
    onApplyScoreDelta(activeTeam.id, pts, `Jawaban Benar (${activeRound.toUpperCase()})`);
  };

  const handleWrong = () => {
    playWrong(soundEnabled);
    broadcastSound('wrong');
    const pts = roundPoints[activeRound].wrong;
    onApplyScoreDelta(activeTeam.id, pts, `Jawaban Salah (${activeRound.toUpperCase()})`);
  };

  const handleQuickAdd = (delta: number) => {
    if (delta > 0) {
      playCorrect(soundEnabled);
      broadcastSound('correct');
    } else {
      playWrong(soundEnabled);
      broadcastSound('wrong');
    }
    onApplyScoreDelta(activeTeam.id, delta, `Penyesuaian Skor ${delta > 0 ? '+' : ''}${delta}`);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customDelta, 10);
    if (!isNaN(val) && val !== 0) {
      if (val > 0) {
        playCorrect(soundEnabled);
        broadcastSound('correct');
      } else {
        playWrong(soundEnabled);
        broadcastSound('wrong');
      }
      onApplyScoreDelta(activeTeam.id, val, customNote || `Nilai Kustom ${val > 0 ? '+' : ''}${val}`);
      setCustomDelta('');
      setCustomNote('');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Round & Stage Status Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            Panel Kontrol Juri & Operator — Tingkat Kelas {gradeLevel}
          </div>
          <div className="text-xl sm:text-2xl font-display font-extrabold text-white mt-0.5">
            Manajemen Penilaian Real-Time
          </div>
        </div>

        {/* Round Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl">
          {(['wajib', 'lemparan', 'rebutan'] as RoundType[]).map((r) => {
            const labels = {
              wajib: 'Babak Wajib',
              lemparan: 'Babak Lemparan',
              rebutan: 'Babak Rebutan',
            };
            const isRoundActive = activeRound === r;
            return (
              <button
                key={r}
                onClick={() => onChangeRound(r)}
                className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                  isRoundActive
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {labels[r]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Left Column (Team Selection & Quick Points) / Right Column (Timer & Tools) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 Columns: Team Selector & Scorer */}
        <div className="lg:col-span-2 space-y-6">

          {/* 1. Team Selector Cards */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                1. Pilih Kelompok yang Menjawab (Tekan Shortcut Huruf A - F)
              </span>
              <button
                onClick={() => onEditTeam(activeTeam)}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Info Regu {activeTeam.code}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {teams.map((team) => {
                const isSelected = team.id === activeTeam.id;
                return (
                  <button
                    key={team.id}
                    onClick={() => onSelectTeam(team.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-400 ring-2 ring-amber-400/50 bg-slate-800 shadow-md'
                        : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className="absolute top-0 left-0 bottom-0 w-1.5"
                      style={{ backgroundColor: team.color }}
                    />
                    <div className="pl-2 flex items-center justify-between gap-1 w-full">
                      <div className="font-display font-bold text-white text-sm sm:text-base truncate">
                        {team.name}
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
                        [{team.code}]
                      </span>
                    </div>

                    <div className="pl-2 mt-2 flex items-baseline justify-between">
                      <span className="text-[11px] text-slate-400">Skor:</span>
                      <span
                        className="font-mono tabular-nums font-black text-xl"
                        style={{ color: team.color }}
                      >
                        {team.score}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Action Score Pad */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  2. Aksi Nilai untuk:{' '}
                </span>
                <span className="text-base font-bold text-white ml-1">
                  {activeTeam.name} (Skor Saat Ini: {activeTeam.score})
                </span>
              </div>
              <span className="text-xs text-amber-400/90 font-medium bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                Mode: {activeRound === 'wajib' ? 'Wajib (+100 / 0)' : activeRound === 'lemparan' ? 'Lemparan (+100 / 0)' : 'Rebutan (+100 / -100)'}
              </span>
            </div>

            {/* Quick Answer Buttons: BENAR & SALAH */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <button
                onClick={handleCorrect}
                className="py-4 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-[0.98]"
              >
                <CheckCircle2 className="w-6 h-6 text-emerald-200" />
                <span className="text-lg">JAWABAN BENAR (+{roundPoints[activeRound].correct})</span>
              </button>

              <button
                onClick={handleWrong}
                className="py-4 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-[0.98]"
              >
                <XCircle className="w-6 h-6 text-rose-200" />
                <span className="text-lg">
                  JAWABAN SALAH ({roundPoints[activeRound].wrong >= 0 ? '0' : roundPoints[activeRound].wrong})
                </span>
              </button>
            </div>

            {/* Increments & Decrements Grid */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="text-xs font-semibold text-slate-400">
                Penambahan Skor Cepat (Poin Spesifik):
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[10, 20, 25, 50, 100, 200].map((pts) => (
                  <button
                    key={pts}
                    onClick={() => handleQuickAdd(pts)}
                    className="py-2.5 px-2 bg-slate-800 hover:bg-emerald-700/50 hover:border-emerald-500 border border-slate-700 rounded-lg text-emerald-400 font-mono font-bold text-sm transition-colors flex items-center justify-center gap-0.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{pts}</span>
                  </button>
                ))}
              </div>

              <div className="text-xs font-semibold text-slate-400 pt-2">
                Pengurangan Skor Cepat (Penalti):
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[10, 20, 25, 50, 100, 200].map((pts) => (
                  <button
                    key={pts}
                    onClick={() => handleQuickAdd(-pts)}
                    className="py-2.5 px-2 bg-slate-800 hover:bg-rose-700/50 hover:border-rose-500 border border-slate-700 rounded-lg text-rose-400 font-mono font-bold text-sm transition-colors flex items-center justify-center gap-0.5"
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>{pts}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Score Input */}
            <form onSubmit={handleCustomSubmit} className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-2">
              <div className="flex-1 w-full flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Nominal kustom (cth: 75 atau -25)"
                  value={customDelta}
                  onChange={(e) => setCustomDelta(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <input
                  type="text"
                  placeholder="Keterangan (opsional)"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
              <button
                type="submit"
                disabled={!customDelta}
                className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Terapkan</span>
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: Timer & Audit Undo */}
        <div className="space-y-6">
          
          {/* Timer Widget */}
          <TimerWidget soundEnabled={soundEnabled} onBuzzerTrigger={() => playBuzzer(soundEnabled)} />

          {/* Undo Action Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Koreksi & Pembatalan Input
            </div>
            
            {lastHistoryEntry ? (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl mb-3 text-xs text-slate-300">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white">{lastHistoryEntry.teamName}</span>
                  <span
                    className={`font-mono font-bold ${
                      lastHistoryEntry.delta > 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {lastHistoryEntry.delta > 0 ? `+${lastHistoryEntry.delta}` : lastHistoryEntry.delta}
                  </span>
                </div>
                <div className="text-slate-400">{lastHistoryEntry.note || 'Perubahan nilai'}</div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {new Date(lastHistoryEntry.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl mb-3 text-xs text-slate-500 text-center">
                Belum ada aksi penilaian pada tingkat ini
              </div>
            )}

            <button
              onClick={onUndoLastAction}
              disabled={!canUndo}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-700 transition-colors"
            >
              <Undo2 className="w-4 h-4 text-amber-400" />
              <span>Undo Nilai Terakhir (Batalkan)</span>
            </button>
          </div>

          {/* Shortcut Quick Reference */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 space-y-1.5">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Petunjuk Pintasan Keyboard:</span>
            </div>
            <div>• Tekan tombol <strong className="text-slate-200">A, B, C, D, E, F</strong> untuk memilih regu secara instan.</div>
            <div>• Bel cepat tangkas dapat dipicu kapan saja dari tombol merah.</div>
          </div>

        </div>

      </div>

    </div>
  );
};
