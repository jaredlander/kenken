import type { Difficulty, Size } from "./types";

export function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function seedFromDate(dateKey: string, size: Size): number {
  return fnv1a(`daily:${dateKey}:${size}`);
}

export function seedFromUnlimited(
  size: Size,
  difficulty: Difficulty,
  salt: number,
): number {
  return fnv1a(`unlim:${size}:${difficulty}:${salt}`);
}

export function todayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
