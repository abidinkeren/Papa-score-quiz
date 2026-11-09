/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GradeLevel, ViewMode, RoundType, Team, GradeData, ScoreHistoryEntry } from './types/quiz';
import { loadQuizData, saveQuizData } from './utils/storage';
import { getSyncChannel, broadcastState, broadcastSound, SyncMessage } from './utils/sync';
import { playBuzzer, playCorrect, playWrong, playTimerAlarm, playFanfare } from './utils/sound';
import { Header } from './components/Header';
import { StageScoreboard } from './components/StageScoreboard';
import { OperatorDeck } from './components/OperatorDeck';
import { AllGradesView } from './components/AllGradesView';
import { EditTeamModal } from './components/EditTeamModal';
import { HistoryLogModal } from './components/HistoryLogModal';
import { Monitor, AlertTriangle, ArrowLeft } from 'lucide-react';

export default function App() {
  const [gradesData, setGradesData] = useState<Record<GradeLevel, GradeData>>(() => loadQuizData());
  const [currentGrade, setCurrentGrade] = useState<GradeLevel>(7);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') === 'projector') return 'stage';
      if (params.get('view') === 'operator') return 'operator';
    }
    return 'stage';
  });
  const [activeRound, setActiveRound] = useState<RoundType>('wajib');
  const [activeTeamId, setActiveTeamId] = useState<string>('team-a');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);

  // Check if this window was opened specifically as a dedicated projector screen
  const isStandaloneProjector = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('view') === 'projector';
  }, []);

  // Multi-tab real-time listener (BroadcastChannel & storage events)
  useEffect(() => {
    const channel = getSyncChannel();

    const handleMessage = (e: MessageEvent<SyncMessage>) => {
      const msg = e.data;
      if (!msg) return;

      if (msg.type === 'STATE_UPDATE') {
        setGradesData(msg.payload);
        setCurrentGrade(msg.currentGrade);
        setActiveRound(msg.activeRound);
      } else if (msg.type === 'PLAY_SOUND') {
        if (msg.payload.sound === 'buzzer') playBuzzer(soundEnabled);
        else if (msg.payload.sound === 'correct') playCorrect(soundEnabled);
        else if (msg.payload.sound === 'wrong') playWrong(soundEnabled);
        else if (msg.payload.sound === 'alarm') playTimerAlarm(soundEnabled);
        else if (msg.payload.sound === 'fanfare') playFanfare(soundEnabled);
      }
    };

    if (channel) {
      channel.addEventListener('message', handleMessage);
    }

    // Storage event fallback (runs across different browser tabs of same origin)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'cepat_tangkas_quiz_data_v1' && e.newValue) {
        try {
          const fresh = JSON.parse(e.newValue);
          setGradesData(fresh);
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      if (channel) {
        channel.removeEventListener('message', handleMessage);
      }
      window.removeEventListener('storage', handleStorage);
    };
  }, [soundEnabled]);

  // Sync state to LocalStorage and broadcast changes across tabs
  const updateAndBroadcastData = useCallback(
    (updater: (prev: Record<GradeLevel, GradeData>) => Record<GradeLevel, GradeData>, newGrade?: GradeLevel, newRound?: RoundType) => {
      setGradesData((prev) => {
        const next = updater(prev);
        saveQuizData(next);
        broadcastState(next, newGrade ?? currentGrade, newRound ?? activeRound);
        return next;
      });
    },
    [currentGrade, activeRound]
  );

  // Fullscreen change listener
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Browser permissions or iframe constraint
    }
  };

  const currentGradeData = gradesData[currentGrade];

  // Apply score adjustment from operator or stage
  const handleApplyScoreDelta = useCallback(
    (teamId: string, delta: number, note?: string) => {
      updateAndBroadcastData((prev) => {
        const gradeCopy = { ...prev[currentGrade] };
        const teamsCopy = gradeCopy.teams.map((t) => {
          if (t.id === teamId) {
            const previousScore = t.score;
            const newScore = previousScore + delta;
            const updatedRoundScores = {
              ...t.roundScores,
              [activeRound]: (t.roundScores[activeRound] || 0) + delta,
            };
            return {
              ...t,
              score: newScore,
              roundScores: updatedRoundScores,
            };
          }
          return t;
        });

        const targetTeam = gradeCopy.teams.find((t) => t.id === teamId);
        const historyEntry: ScoreHistoryEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          timestamp: Date.now(),
          grade: currentGrade,
          teamId,
          teamName: targetTeam ? targetTeam.name : 'Regu',
          delta,
          round: activeRound,
          note: note || `Penyesuaian skor ${delta > 0 ? '+' : ''}${delta}`,
          scoreBefore: targetTeam ? targetTeam.score : 0,
          scoreAfter: targetTeam ? targetTeam.score + delta : delta,
        };

        return {
          ...prev,
          [currentGrade]: {
            ...gradeCopy,
            teams: teamsCopy,
            history: [historyEntry, ...gradeCopy.history],
          },
        };
      });
    },
    [currentGrade, activeRound, updateAndBroadcastData]
  );

  // Undo last action for current grade
  const handleUndoLastAction = useCallback(() => {
    updateAndBroadcastData((prev) => {
      const gradeCopy = { ...prev[currentGrade] };
      if (gradeCopy.history.length === 0) return prev;

      const [lastEntry, ...remainingHistory] = gradeCopy.history;
      const teamsCopy = gradeCopy.teams.map((t) => {
        if (t.id === lastEntry.teamId) {
          const revertedScore = t.score - lastEntry.delta;
          const revertedRoundScores = {
            ...t.roundScores,
            [lastEntry.round]: Math.max(0, (t.roundScores[lastEntry.round] || 0) - lastEntry.delta),
          };
          return {
            ...t,
            score: revertedScore,
            roundScores: revertedRoundScores,
          };
        }
        return t;
      });

      return {
        ...prev,
        [currentGrade]: {
          ...gradeCopy,
          teams: teamsCopy,
          history: remainingHistory,
        },
      };
    });
  }, [currentGrade, updateAndBroadcastData]);

  // Undo specific entry from History Modal
  const handleUndoEntry = useCallback(
    (entry: ScoreHistoryEntry) => {
      updateAndBroadcastData((prev) => {
        const gradeCopy = { ...prev[entry.grade] };
        const teamsCopy = gradeCopy.teams.map((t) => {
          if (t.id === entry.teamId) {
            return {
              ...t,
              score: t.score - entry.delta,
              roundScores: {
                ...t.roundScores,
                [entry.round]: Math.max(0, (t.roundScores[entry.round] || 0) - entry.delta),
              },
            };
          }
          return t;
        });

        return {
          ...prev,
          [entry.grade]: {
            ...gradeCopy,
            teams: teamsCopy,
            history: gradeCopy.history.filter((h) => h.id !== entry.id),
          },
        };
      });
    },
    [updateAndBroadcastData]
  );

  // Save updated team info (name, members, custom score)
  const handleSaveTeam = useCallback(
    (updatedTeam: Team) => {
      updateAndBroadcastData((prev) => {
        const gradeCopy = { ...prev[currentGrade] };
        return {
          ...prev,
          [currentGrade]: {
            ...gradeCopy,
            teams: gradeCopy.teams.map((t) => (t.id === updatedTeam.id ? updatedTeam : t)),
          },
        };
      });
    },
    [currentGrade, updateAndBroadcastData]
  );

  // Change grade and broadcast
  const handleGradeChange = (g: GradeLevel) => {
    setCurrentGrade(g);
    broadcastState(gradesData, g, activeRound);
  };

  // Change round and broadcast
  const handleRoundChange = (r: RoundType) => {
    setActiveRound(r);
    broadcastState(gradesData, currentGrade, r);
  };

  // Execute reset when confirmed in in-app modal
  const handleConfirmReset = () => {
    updateAndBroadcastData((prev) => {
      const gradeCopy = { ...prev[currentGrade] };
      const resetTeams = gradeCopy.teams.map((t) => ({
        ...t,
        score: 0,
        roundScores: { wajib: 0, lemparan: 0, rebutan: 0 },
      }));

      return {
        ...prev,
        [currentGrade]: {
          ...gradeCopy,
          teams: resetTeams,
          history: [],
        },
      };
    });
    setIsResetConfirmOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* If this is the standalone projector window, show minimal top bar with real-time status */}
      {isStandaloneProjector ? (
        <div className="bg-slate-900 border-b border-slate-800 px-6 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-emerald-300">
              Layar Proyektor Terhubung (Tingkat {currentGrade} · 6 Kelompok)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400">
              Dikendalikan langsung dari Laptop Operator
            </span>
            <a
              href="/"
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Buka Menu Lengkap</span>
            </a>
          </div>
        </div>
      ) : (
        /* Regular Top Navigation Bar */
        <Header
          currentGrade={currentGrade}
          onGradeChange={handleGradeChange}
          viewMode={viewMode}
          onViewModeChange={(m) => setViewMode(m)}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onResetGrade={() => setIsResetConfirmOpen(true)}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
        />
      )}

      {/* Operator Laptop Info Strip (when in operator view) */}
      {!isStandaloneProjector && viewMode === 'operator' && (
        <div className="bg-gradient-to-r from-blue-900/40 via-slate-900 to-slate-950 border-b border-blue-900/40 px-4 sm:px-6 py-2 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-blue-300 font-medium">
            <Monitor className="w-4 h-4 text-blue-400 shrink-0" />
            <span>
              Mode Kontrol Laptop Aktif: Setiap perubahan nilai, babak, dan nama akan tampil seketika (real-time) di layar proyektor.
            </span>
          </div>
          <a
            href="?view=projector"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2 shrink-0"
          >
            Buka Layar Proyektor di Tab Baru →
          </a>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {viewMode === 'stage' && (
          <StageScoreboard
            gradeLevel={currentGrade}
            teams={currentGradeData.teams}
            activeRound={activeRound}
            soundEnabled={soundEnabled}
            onEditTeam={(team) => setEditingTeam(team)}
            onSelectTeamForScoring={(team) => {
              setActiveTeamId(team.id);
              setViewMode('operator');
            }}
            activeTeamId={activeTeamId}
            isProjectorStandalone={isStandaloneProjector}
          />
        )}

        {viewMode === 'operator' && (
          <OperatorDeck
            gradeLevel={currentGrade}
            teams={currentGradeData.teams}
            activeRound={activeRound}
            onChangeRound={handleRoundChange}
            activeTeamId={activeTeamId}
            onSelectTeam={(id) => setActiveTeamId(id)}
            onApplyScoreDelta={handleApplyScoreDelta}
            onUndoLastAction={handleUndoLastAction}
            canUndo={currentGradeData.history.length > 0}
            lastHistoryEntry={currentGradeData.history[0]}
            soundEnabled={soundEnabled}
            onEditTeam={(team) => setEditingTeam(team)}
          />
        )}

        {viewMode === 'all' && (
          <AllGradesView
            gradesData={gradesData}
            onSelectGrade={(g) => {
              handleGradeChange(g);
              setViewMode('stage');
            }}
          />
        )}
      </main>

      {/* Modals: Render strictly on operator laptop, NEVER on the projector screen */}
      {!isStandaloneProjector && (
        <>
          <EditTeamModal
            team={editingTeam}
            isOpen={Boolean(editingTeam)}
            onClose={() => setEditingTeam(null)}
            onSave={handleSaveTeam}
          />

          <HistoryLogModal
            isOpen={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
            gradeLevel={currentGrade}
            history={currentGradeData.history}
            onUndoEntry={handleUndoEntry}
            onClearHistory={() => {
              updateAndBroadcastData((prev) => ({
                ...prev,
                [currentGrade]: {
                  ...prev[currentGrade],
                  history: [],
                },
              }));
            }}
          />

          {/* In-App Confirmation Modal for Reset (replaces window.confirm) */}
          {isResetConfirmOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Reset Skor Tingkat Kelas {currentGrade}?
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  Tindakan ini akan mengembalikan seluruh skor 6 kelompok di Tingkat Kelas {currentGrade} menjadi 0 dan menghapus riwayat nilai tingkat ini. Data tingkat lain tidak akan terpengaruh.
                </p>
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setIsResetConfirmOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleConfirmReset}
                    className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors shadow-sm"
                  >
                    Ya, Reset Skor
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
