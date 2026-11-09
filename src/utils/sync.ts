/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GradeData, GradeLevel, RoundType } from '../types/quiz';

export type SyncMessage =
  | { type: 'STATE_UPDATE'; payload: Record<GradeLevel, GradeData>; currentGrade: GradeLevel; activeRound: RoundType }
  | { type: 'TIMER_UPDATE'; payload: { secondsLeft: number; isRunning: number; totalSeconds: number } }
  | { type: 'PLAY_SOUND'; payload: { sound: 'buzzer' | 'correct' | 'wrong' | 'alarm' | 'fanfare' } };

const CHANNEL_NAME = 'cepat_tangkas_realtime_sync';

let channel: BroadcastChannel | null = null;

export function getSyncChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null;
  if (!channel && 'BroadcastChannel' in window) {
    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
    } catch (e) {
      console.warn('BroadcastChannel not supported', e);
    }
  }
  return channel;
}

export function broadcastState(
  gradesData: Record<GradeLevel, GradeData>,
  currentGrade: GradeLevel,
  activeRound: RoundType
) {
  const ch = getSyncChannel();
  if (ch) {
    ch.postMessage({
      type: 'STATE_UPDATE',
      payload: gradesData,
      currentGrade,
      activeRound,
    });
  }
}

export function broadcastSound(sound: 'buzzer' | 'correct' | 'wrong' | 'alarm' | 'fanfare') {
  const ch = getSyncChannel();
  if (ch) {
    ch.postMessage({
      type: 'PLAY_SOUND',
      payload: { sound },
    });
  }
}
