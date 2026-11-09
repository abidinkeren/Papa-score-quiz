/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GradeData, GradeLevel } from '../types/quiz';
import { Download, Printer } from 'lucide-react';
import { exportToCSV } from '../utils/storage';

interface AllGradesViewProps {
  gradesData: Record<GradeLevel, GradeData>;
  onSelectGrade: (grade: GradeLevel) => void;
}

interface TopTeam {
  grade: GradeLevel;
  name: string;
  code: string;
  score: number;
}

export const AllGradesView: React.FC<AllGradesViewProps> = ({
  gradesData,
  onSelectGrade,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    exportToCSV(gradesData);
  };

  // Find top performer across all grades with explicit typing
  const allTeams: TopTeam[] = [];
  ([7, 8, 9] as GradeLevel[]).forEach((lvl) => {
    gradesData[lvl]?.teams.forEach((t) => {
      allTeams.push({ grade: lvl, name: t.name, code: t.code, score: t.score });
    });
  });

  const sortedAll = allTeams.sort((a, b) => b.score - a.score);
  const highestTeam: TopTeam | undefined = sortedAll[0];

  return (
    <div className="space-y-8">
      
      {/* Top Summary Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-2xl">
        <div>
          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            Rekapitulasi Nilai Seluruh Tingkatan
          </div>
          <h1 className="text-2xl font-display font-extrabold text-white mt-0.5">
            Perbandingan Tingkat Kelas 7, 8, dan 9
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Total 18 kelompok (6 kelompok per tingkat). Data tersimpan aman dan terintegrasi.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExport}
            className="px-3.5 py-2 text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Unduh CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs sm:text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition-colors flex items-center gap-2 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Berita Acara</span>
          </button>
        </div>
      </div>

      {/* 3 Columns / Cards for the 3 Grades (7, 8, 9) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {([7, 8, 9] as GradeLevel[]).map((gradeLevel) => {
          const grade = gradesData[gradeLevel];
          const teams = grade.teams;

          return (
            <div
              key={gradeLevel}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <div>
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Daftar Nilai
                    </span>
                    <h2 className="text-xl font-display font-black text-white">
                      Kelas {gradeLevel}
                    </h2>
                  </div>
                  <button
                    onClick={() => onSelectGrade(gradeLevel)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
                  >
                    Buka Kontrol
                  </button>
                </div>

                {/* Team Rows */}
                <div className="space-y-2.5">
                  {teams.map((team) => {
                    return (
                      <div
                        key={team.id}
                        className="p-3 rounded-xl border border-slate-800/80 bg-slate-950/60 flex items-center justify-between transition-colors hover:border-slate-700"
                      >
                        <div className="flex items-center gap-2.5 truncate mr-2">
                          <div
                            className="w-7 h-7 rounded-md flex items-center justify-center font-mono text-xs font-bold text-white shrink-0 shadow-sm"
                            style={{ backgroundColor: team.color }}
                          >
                            {team.code}
                          </div>
                          <div className="truncate">
                            <div className="text-sm font-bold text-white truncate" title={team.name}>
                              {team.name}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              W: {team.roundScores.wajib} · L: {team.roundScores.lemparan} · R: {team.roundScores.rebutan}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className="font-mono tabular-nums font-black text-lg"
                            style={{ color: team.color }}
                          >
                            {team.score}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total points generated in this grade */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Total Poin Akumulasi:</span>
                <span className="font-mono font-bold text-slate-200">
                  {teams.reduce((acc, curr) => acc + curr.score, 0)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
