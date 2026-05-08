import type { GameState, PuzzleId, Size } from "../game/types";

const PREFIX = "kenken:v1";

export function gameStorageKey(p: PuzzleId): string {
  if (p.mode === "daily") {
    return `${PREFIX}:game:daily:${p.size}:${p.dateKey}`;
  }
  return `${PREFIX}:game:unlim:${p.size}:${p.seed}`;
}

export const statsKey = (size: Size) => `${PREFIX}:stats:${size}`;
export const dailyCompletedKey = `${PREFIX}:daily-completed`;
export const themeKey = `${PREFIX}:theme`;
export const unlimitedSaltKey = `${PREFIX}:unlim-salt`;

export function safeGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota errors */
  }
}

export function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function persistGame(p: PuzzleId, state: GameState): void {
  safeSet(gameStorageKey(p), state);
}

export function loadGame(p: PuzzleId): GameState | null {
  return safeGet<GameState>(gameStorageKey(p));
}

export function clearGame(p: PuzzleId): void {
  safeRemove(gameStorageKey(p));
}

export function nextUnlimitedSalt(): number {
  const cur = safeGet<number>(unlimitedSaltKey) ?? 0;
  const next = cur + 1;
  safeSet(unlimitedSaltKey, next);
  return next;
}
