/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Bell } from 'lucide-react';
import { playTimerTick, playTimerAlarm, playBuzzer } from '../utils/sound';
import { broadcastSound } from '../utils/sync';

interface TimerWidgetProps {
  soundEnabled: boolean;
  onBuzzerTrigger?: () => void;
  compact?: boolean;
}

export const TimerWidget: React.FC<TimerWidgetProps> = ({
  soundEnabled,
  onBuzzerTrigger,
  compact = false,
}) => {
  const [totalSeconds, setTotalSeconds] = useState<number>(15);
  const [secondsLeft, setSecondsLeft] = useState<number>(15);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const intervalRef = useRef<number | null>(null);

  // Sync timer countdown
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Alarm fires
            playTimerAlarm(soundEnabled);
            broadcastSound('alarm');
            setIsRunning(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 0;
          }

          // Tick sound in the final 5 seconds
          if (prev <= 6 && prev > 1) {
            playTimerTick(soundEnabled);
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, soundEnabled]);

  const setTimerPreset = (secs: number) => {
    setIsRunning(false);
    setTotalSeconds(secs);
    setSecondsLeft(secs);
  };

  const handleTogglePlay = () => {
    if (secondsLeft === 0) {
      setSecondsLeft(totalSeconds);
      setIsRunning(true);
    } else {
      setIsRunning(!isRunning);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(totalSeconds);
  };

  const handleManualBuzzer = () => {
    playBuzzer(soundEnabled);
    broadcastSound('buzzer');
    if (onBuzzerTrigger) onBuzzerTrigger();
  };

  // Progress percentage
  const progress = totalSeconds > 0 ? (secondsLeft / totalSeconds) * 100 : 0;
  const isUrgent = secondsLeft <= 5 && secondsLeft > 0;
  const isFinished = secondsLeft === 0;

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-lg">
        <div
          className={`font-mono tabular-nums text-lg font-bold px-2 py-0.5 rounded ${
            isFinished
              ? 'bg-rose-950 text-rose-400 animate-pulse'
              : isUrgent
              ? 'bg-amber-950 text-amber-400 animate-pulse'
              : 'text-slate-200'
          }`}
        >
          {String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:
          {String(secondsLeft % 60).padStart(2, '0')}
        </div>
        <button
          onClick={handleTogglePlay}
          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          title={isRunning ? 'Jeda Timer' : 'Mulai Timer'}
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={handleReset}
          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
          title="Reset Timer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Timer Hitung Mundur & Bel
        </div>
        
        {/* Preset Selector */}
        <div className="flex items-center gap-1">
          {[5, 10, 15, 30].map((sec) => (
            <button
              key={sec}
              onClick={() => setTimerPreset(sec)}
              className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${
                totalSeconds === sec && !isRunning
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {sec}d
            </button>
          ))}
        </div>
      </div>

      {/* Main Timer Display & Progress Bar */}
      <div className="relative overflow-hidden bg-slate-950 border border-slate-800/90 rounded-lg p-3 text-center mb-3">
        <div
          className={`absolute top-0 bottom-0 left-0 opacity-20 transition-all duration-300 ${
            isFinished ? 'bg-rose-500' : isUrgent ? 'bg-amber-500' : 'bg-blue-500'
          }`}
          style={{ width: `${progress}%` }}
        />
        <div
          className={`font-mono tabular-nums text-4xl sm:text-5xl font-black relative z-10 tracking-tight transition-colors ${
            isFinished
              ? 'text-rose-400 animate-pulse'
              : isUrgent
              ? 'text-amber-400 animate-pulse'
              : 'text-white'
          }`}
        >
          {String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:
          {String(secondsLeft % 60).padStart(2, '0')}
        </div>
        <div className="text-[11px] font-medium text-slate-400 mt-1 relative z-10">
          {isFinished ? 'Waktu Telah Habis!' : isRunning ? 'Waktu Berjalan...' : 'Timer Berhenti'}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={handleTogglePlay}
          className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
            isRunning
              ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
              : 'bg-blue-600 text-white hover:bg-blue-500'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4" />
              <span>Jeda</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Mulai</span>
            </>
          )}
        </button>

        <button
          onClick={handleReset}
          className="py-2 px-3 text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
        </button>

        <button
          onClick={handleManualBuzzer}
          title="Bunyikan Bel Cepat Tangkas Sekarang"
          className="py-2 px-3 text-xs sm:text-sm font-semibold bg-rose-600/90 hover:bg-rose-500 text-white rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
        >
          <Bell className="w-4 h-4 animate-bounce" />
          <span>Bel Cepat</span>
        </button>
      </div>
    </div>
  );
};
