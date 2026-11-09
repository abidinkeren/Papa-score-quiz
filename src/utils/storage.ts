/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GradeData, GradeLevel, Team, ScoreHistoryEntry, RoundType } from '../types/quiz';

const STORAGE_KEY = 'cepat_tangkas_quiz_data_v1';

export const TEAM_TEMPLATES = [
  {
    id: 'team-a',
    code: 'A',
    defaultName: 'Regu A',
    color: '#F59E0B',
    bgGradient: 'from-amber-500/20 via-amber-500/5 to-slate-900',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/40',
  },
  {
    id: 'team-b',
    code: 'B',
    defaultName: 'Regu B',
    color: '#3B82F6',
    bgGradient: 'from-blue-500/20 via-blue-500/5 to-slate-900',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-500/40',
  },
  {
    id: 'team-c',
    code: 'C',
    defaultName: 'Regu C',
    color: '#10B981',
    bgGradient: 'from-emerald-500/20 via-emerald-500/5 to-slate-900',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
  },
  {
    id: 'team-d',
    code: 'D',
    defaultName: 'Regu D',
    color: '#EF4444',
    bgGradient: 'from-rose-500/20 via-rose-500/5 to-slate-900',
    textColor: 'text-rose-400',
    borderColor: 'border-rose-500/40',
  },
  {
    id: 'team-e',
    code: 'E',
    defaultName: 'Regu E',
    color: '#8B5CF6',
    bgGradient: 'from-purple-500/20 via-purple-500/5 to-slate-900',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/40',
  },
  {
    id: 'team-f',
    code: 'F',
    defaultName: 'Regu F',
    color: '#06B6D4',
    bgGradient: 'from-cyan-500/20 via-cyan-500/5 to-slate-900',
    textColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/40',
  },
];

export function createDefaultTeams(): Team[] {
  return TEAM_TEMPLATES.map((tmpl) => ({
    id: tmpl.id,
    code: tmpl.code,
    defaultName: tmpl.defaultName,
    name: tmpl.defaultName,
    members: '',
    color: tmpl.color,
    bgGradient: tmpl.bgGradient,
    textColor: tmpl.textColor,
    borderColor: tmpl.borderColor,
    score: 0,
    roundScores: {
      wajib: 0,
      lemparan: 0,
      rebutan: 0,
    },
  }));
}

export function createDefaultGrades(): Record<GradeLevel, GradeData> {
  return {
    7: {
      grade: 7,
      title: 'Tingkat Kelas 7',
      teams: createDefaultTeams(),
      history: [],
    },
    8: {
      grade: 8,
      title: 'Tingkat Kelas 8',
      teams: createDefaultTeams(),
      history: [],
    },
    9: {
      grade: 9,
      title: 'Tingkat Kelas 9',
      teams: createDefaultTeams(),
      history: [],
    },
  };
}

export function loadQuizData(): Record<GradeLevel, GradeData> {
  if (typeof window === 'undefined') return createDefaultGrades();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultGrades();
    const parsed = JSON.parse(raw);
    if (parsed && parsed[7] && parsed[8] && parsed[9]) {
      return parsed;
    }
    return createDefaultGrades();
  } catch (err) {
    console.error('Error loading quiz data from localStorage', err);
    return createDefaultGrades();
  }
}

export function saveQuizData(data: Record<GradeLevel, GradeData>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving quiz data to localStorage', err);
  }
}

export function exportToCSV(data: Record<GradeLevel, GradeData>): void {
  let csvContent = 'data:text/csv;charset=utf-8,';
  csvContent += 'Tingkat,Kode Regu,Nama Kelompok,Anggota,Skor Wajib,Skor Lemparan,Skor Rebutan,Total Skor,Peringkat di Tingkat\n';

  [7, 8, 9].forEach((lvl) => {
    const gradeLevel = lvl as GradeLevel;
    const grade = data[gradeLevel];
    const sortedTeams = [...grade.teams].sort((a, b) => b.score - a.score);

    grade.teams.forEach((team) => {
      const rank = sortedTeams.findIndex((t) => t.id === team.id) + 1;
      const row = [
        `Kelas ${gradeLevel}`,
        team.code,
        `"${team.name.replace(/"/g, '""')}"`,
        `"${(team.members || '-').replace(/"/g, '""')}"`,
        team.roundScores.wajib,
        team.roundScores.lemparan,
        team.roundScores.rebutan,
        team.score,
        rank,
      ];
      csvContent += row.join(',') + '\n';
    });
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `rekap_skor_cepat_tangkas_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
