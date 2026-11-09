/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Team, GradeLevel, RoundType } from '../types/quiz';
import { Users, Edit3, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playFanfare } from '../utils/sound';
import { broadcastSound } from '../utils/sync';

interface StageScoreboardProps {
  gradeLevel: GradeLevel;
  teams: Team[];
  activeRound: RoundType;
  soundEnabled: boolean;
  onEditTeam: (team: Team) => void;
  onSelectTeamForScoring?: (team: Team) => void;
  activeTeamId?: string | null;
  isProjectorStandalone?: boolean;
}

export const StageScoreboard: React.FC<StageScoreboardProps> = ({
  gradeLevel,
  teams,
  activeRound,
  soundEnabled,
  onEditTeam,
  onSelectTeamForScoring,
  activeTeamId,
  isProjectorStandalone = false,
}) => {
  const handleCelebrate = () => {
    playFanfare(soundEnabled);
    broadcastSound('fanfare');
    try {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
      });
    } catch {
      // Fallback
    }
  };

  const roundName =
    activeRound === 'wajib'
      ? 'Babak Wajib / Paket Soal'
      : activeRound === 'lemparan'
      ? 'Babak Lemparan'
      : 'Babak Rebutan Cepat Tangkas';

  return (
    <div className="space-y-6">
      {/* Top Banner & Header Information */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 sm:p-5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest font-bold text-amber-400">
              Papan Skor Panggung Utama
            </span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span className="text-xs font-semibold text-slate-300">
              {roundName}
            </span>
            {isProjectorStandalone && (
              <>
                <span className="text-slate-600" aria-hidden="true">·</span>
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  Sinkronisasi Layar Real-Time
                </span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight mt-0.5">
            Kuis Cepat Tangkas — Tingkat Kelas {gradeLevel}
          </h1>
        </div>

        {/* Action Controls for Stage */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleCelebrate}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 rounded-xl shadow-md flex items-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-100" />
            <span>Selebrasi Kemenangan</span>
          </button>
        </div>
      </div>

      {/* Grid of 6 Teams (Ordered by Table Position: A, B, C, D, E, F - No Ranking Sorting) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {teams.map((team) => {
          const isSelected = !isProjectorStandalone && activeTeamId === team.id;

          return (
            <div
              key={team.id}
              onClick={() => {
                if (!isProjectorStandalone && onSelectTeamForScoring) {
                  onSelectTeamForScoring(team);
                }
              }}
              className={`relative bg-slate-900/95 rounded-2xl border transition-all duration-200 overflow-hidden ${
                isSelected
                  ? 'border-amber-400 ring-2 ring-amber-400/60 shadow-xl bg-slate-850 scale-[1.01]'
                  : 'border-slate-800 shadow-lg'
              } ${isProjectorStandalone ? 'cursor-default' : 'hover:border-slate-700 hover:bg-slate-850/80 cursor-pointer'}`}
            >
              {/* Distinctive accent bar at top matching team's official color */}
              <div
                className="h-2.5 w-full"
                style={{ backgroundColor: team.color }}
              />

              <div className="p-5 sm:p-6 flex flex-col justify-between min-h-[260px]">
                
                {/* Header of Team Card: Prominent Team Name */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    
                    {/* Badge identifier & Prominent Team Name */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-white text-xl shadow-md shrink-0"
                        style={{ backgroundColor: team.color }}
                      >
                        {team.code}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          {team.defaultName}
                        </div>
                        <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white truncate tracking-tight" title={team.name}>
                          {team.name}
                        </h2>
                      </div>
                    </div>

                    {/* Quick Edit Name Button (Visible only on Laptop, hidden on Projector) */}
                    {!isProjectorStandalone && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditTeam(team);
                        }}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors shrink-0"
                        title={`Ubah Nama & Anggota ${team.defaultName}`}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Team Members info if filled */}
                  {team.members ? (
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-2 px-2.5 py-1 rounded bg-slate-950/60 border border-slate-800/80">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{team.members}</span>
                    </div>
                  ) : !isProjectorStandalone ? (
                    <div className="text-[11px] text-slate-500 italic mt-1 pl-1">
                      (Klik ikon pensil untuk nama peserta)
                    </div>
                  ) : null}
                </div>

                {/* Central Score Display: Huge high-contrast typography */}
                <div className="my-4 text-center py-4 bg-slate-950/80 border border-slate-800 rounded-xl relative group-hover:border-slate-700 transition-colors">
                  <div
                    className="font-mono tabular-nums text-6xl sm:text-7xl font-black tracking-tight"
                    style={{ color: team.score < 0 ? '#f43f5e' : team.color }}
                  >
                    {team.score}
                  </div>
                  <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mt-1">
                    Total Skor Saat Ini
                  </div>
                </div>

                {/* Round Breakdown Strip: Wajib, Lemparan, Rebutan */}
                <div className="pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-950/50 p-1.5 rounded-lg border border-slate-800/60">
                    <div className="text-slate-400 text-[10px] uppercase font-semibold">Wajib</div>
                    <div className="font-mono tabular-nums font-bold text-slate-200 text-sm">
                      {team.roundScores.wajib}
                    </div>
                  </div>
                  <div className="bg-slate-950/50 p-1.5 rounded-lg border border-slate-800/60">
                    <div className="text-slate-400 text-[10px] uppercase font-semibold">Lemparan</div>
                    <div className="font-mono tabular-nums font-bold text-slate-200 text-sm">
                      {team.roundScores.lemparan}
                    </div>
                  </div>
                  <div className="bg-slate-950/50 p-1.5 rounded-lg border border-slate-800/60">
                    <div className="text-slate-400 text-[10px] uppercase font-semibold">Rebutan</div>
                    <div className="font-mono tabular-nums font-bold text-slate-200 text-sm">
                      {team.roundScores.rebutan}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
