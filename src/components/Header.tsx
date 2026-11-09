/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GradeLevel, ViewMode } from '../types/quiz';
import { Volume2, VolumeX, Maximize2, Minimize2, RotateCcw, FileText } from 'lucide-react';

interface HeaderProps {
  currentGrade: GradeLevel;
  onGradeChange: (grade: GradeLevel) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenHistory: () => void;
  onResetGrade: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentGrade,
  onGradeChange,
  viewMode,
  onViewModeChange,
  soundEnabled,
  onToggleSound,
  onOpenHistory,
  onResetGrade,
  isFullscreen,
  onToggleFullscreen,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-display font-extrabold text-white text-lg shadow-sm">
            CT
          </div>
          <span className="font-display font-extrabold text-lg sm:text-xl tracking-tight text-white whitespace-nowrap">
            Cepat Tangkas
          </span>
        </div>

        {/* Zone 2: Navigation Links & Grade Selector */}
        <nav className="flex items-center gap-2 sm:gap-4 overflow-x-auto py-1 scrollbar-none">
          {/* Grade Selector Group */}
          <div className="flex items-center p-1 bg-slate-950/70 border border-slate-800/80 rounded-lg shrink-0">
            {([7, 8, 9] as GradeLevel[]).map((grade) => {
              const isActive = currentGrade === grade;
              return (
                <button
                  key={grade}
                  onClick={() => onGradeChange(grade)}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                  aria-pressed={isActive}
                >
                  Tingkat {grade}
                </button>
              );
            })}
          </div>

          <span className="text-slate-700 hidden sm:inline" aria-hidden="true">|</span>

          {/* View Mode Selector Group */}
          <div className="flex items-center p-1 bg-slate-950/70 border border-slate-800/80 rounded-lg shrink-0">
            <button
              onClick={() => onViewModeChange('stage')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                viewMode === 'stage'
                  ? 'bg-slate-800 text-amber-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              Mode Panggung
            </button>
            <button
              onClick={() => onViewModeChange('operator')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                viewMode === 'operator'
                  ? 'bg-slate-800 text-amber-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              Panel Juri & Operator
            </button>
            <button
              onClick={() => onViewModeChange('all')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                viewMode === 'all'
                  ? 'bg-slate-800 text-amber-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              Rekap Semua Tingkat
            </button>
          </div>
        </nav>

        {/* Zone 3: Utility Controls & Primary Action */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Matikan Suara Bel & Efek' : 'Nyalakan Suara Bel & Efek'}
            className={`p-2 rounded-lg border transition-colors ${
              soundEnabled
                ? 'border-slate-700 bg-slate-800 text-amber-400 hover:bg-slate-700'
                : 'border-slate-800 bg-slate-950 text-slate-500 hover:text-slate-300'
            }`}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenHistory}
            title="Riwayat & Audit Trail Nilai"
            className="p-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="Log Riwayat Nilai"
          >
            <FileText className="w-4 h-4" />
          </button>

          <button
            onClick={onResetGrade}
            title="Reset Skor Tingkat Ini"
            className="p-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-colors"
            aria-label="Reset Skor Tingkat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <a
            href="?view=projector"
            target="_blank"
            rel="noopener noreferrer"
            title="Buka Layar Panggung di Tab/Jendela Baru untuk Ditampilkan ke Proyektor atau TV"
            className="px-3 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-slate-950 animate-pulse"></span>
            <span>Layar Proyektor</span>
          </a>

          <button
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Mode Layar Penuh (Proyektor)'}
            className="px-3 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Layar Normal</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Layar Penuh</span>
              </>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
