/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GradeLevel = 7 | 8 | 9;

export type RoundType = 'wajib' | 'lemparan' | 'rebutan';

export interface Team {
  id: string; // e.g., 'team-a'
  code: string; // e.g., 'A'
  defaultName: string; // 'Regu A'
  name: string; // Customizable name, e.g., 'Regu A (Kelas 7A)'
  members?: string;
  color: string; // Hex color code
  bgGradient: string; // Tailwind gradient class
  textColor: string;
  borderColor: string;
  score: number;
  roundScores: {
    wajib: number;
    lemparan: number;
    rebutan: number;
  };
}

export interface ScoreHistoryEntry {
  id: string;
  timestamp: number;
  grade: GradeLevel;
  teamId: string;
  teamName: string;
  delta: number;
  round: RoundType;
  note?: string;
  scoreBefore: number;
  scoreAfter: number;
}

export interface GradeData {
  grade: GradeLevel;
  title: string;
  teams: Team[];
  history: ScoreHistoryEntry[];
}

export type ViewMode = 'stage' | 'operator' | 'all';
