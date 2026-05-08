import type { Mode, Size } from "../game/types";
import { dailyCompletedKey, safeGet, safeSet, statsKey } from "./storage";

export interface Stats {
  played: number;
  won: number;
  hintAssistedWins: number;
  bestMs: number | null;
  currentStreak: number;
  bestStreak: number;
  lastDailyDateKey: string | null;
}

export function emptyStats(): Stats {
  return {
    played: 0,
    won: 0,
    hintAssistedWins: 0,
    bestMs: null,
    currentStreak: 0,
    bestStreak: 0,
    lastDailyDateKey: null,
  };
}

export function loadStats(size: Size): Stats {
  return safeGet<Stats>(statsKey(size)) ?? emptyStats();
}

export function saveStats(size: Size, stats: Stats): void {
  safeSet(statsKey(size), stats);
}

function dayDiff(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const aMs = Date.UTC(ay, am - 1, ad);
  const bMs = Date.UTC(by, bm - 1, bd);
  return Math.round((bMs - aMs) / 86400000);
}

export interface RecordWinResult {
  stats: Stats;
  newBest: boolean;
  streakIncremented: boolean;
}

export function recordWin(opts: {
  size: Size;
  mode: Mode;
  dateKey?: string;
  elapsedMs: number;
  hintsUsed: number;
}): RecordWinResult {
  const stats = loadStats(opts.size);
  stats.played++;
  stats.won++;

  const hintAssisted = opts.hintsUsed > 0;
  if (hintAssisted) stats.hintAssistedWins++;

  let newBest = false;
  if (!hintAssisted) {
    if (stats.bestMs === null || opts.elapsedMs < stats.bestMs) {
      stats.bestMs = opts.elapsedMs;
      newBest = true;
    }
  }

  let streakIncremented = false;
  if (opts.mode === "daily" && opts.dateKey && !hintAssisted) {
    const last = stats.lastDailyDateKey;
    if (last === opts.dateKey) {
      // no-op: already counted today
    } else if (last && dayDiff(last, opts.dateKey) === 1) {
      stats.currentStreak++;
      streakIncremented = true;
    } else {
      stats.currentStreak = 1;
      streakIncremented = true;
    }
    stats.lastDailyDateKey = opts.dateKey;
    if (stats.currentStreak > stats.bestStreak) stats.bestStreak = stats.currentStreak;
  }

  saveStats(opts.size, stats);

  if (opts.mode === "daily" && opts.dateKey) {
    const completed = safeGet<Record<string, number[]>>(dailyCompletedKey) ?? {};
    const arr = completed[opts.dateKey] ?? [];
    if (!arr.includes(opts.size)) arr.push(opts.size);
    completed[opts.dateKey] = arr;
    safeSet(dailyCompletedKey, completed);
  }

  return { stats, newBest, streakIncremented };
}
