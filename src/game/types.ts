export type Size = 3 | 4 | 5 | 6;
export type Difficulty = "easy" | "medium" | "hard";
export type Op = "+" | "-" | "*" | "/" | "=";
export type Mode = "daily" | "unlimited";

export interface Cage {
  id: number;
  cells: number[];
  op: Op;
  target: number;
}

export interface Puzzle {
  size: Size;
  difficulty: Difficulty;
  cages: Cage[];
  cellCage: number[];
  solution: number[];
  seed: number;
}

export interface CellState {
  value: number | null;
  notes: number[];
  given: boolean;
}

export interface GameSnapshot {
  cells: CellState[];
}

export type GameStatus = "playing" | "won" | "paused";

export interface GameState {
  puzzle: Puzzle;
  cells: CellState[];
  selected: number | null;
  notesMode: boolean;
  past: GameSnapshot[];
  future: GameSnapshot[];
  elapsedMs: number;
  startedAt: number;
  lastTickAt: number;
  status: GameStatus;
  hintsUsed: number;
  mistakeFlags: boolean[];
  mode: Mode;
  dateKey?: string;
}

export interface PuzzleId {
  mode: Mode;
  size: Size;
  difficulty: Difficulty;
  dateKey?: string;
  seed: number;
}

export const DAILY_DIFFICULTY: Record<Size, Difficulty> = {
  3: "easy",
  4: "easy",
  5: "medium",
  6: "hard",
};

export const SIZES: ReadonlyArray<Size> = [3, 4, 5, 6];
