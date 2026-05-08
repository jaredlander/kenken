import { eliminateRowColNotes, toggleNote } from "../game/notes";
import type { GameSnapshot, GameState, Mode, Puzzle } from "../game/types";
import { findMistakes, isComplete } from "../game/validate";

const SNAPSHOT_CAP = 100;

export type Action =
  | { type: "SELECT"; index: number | null }
  | { type: "TOGGLE_NOTES_MODE" }
  | { type: "SET_VALUE"; index: number; value: number }
  | { type: "TOGGLE_NOTE"; index: number; value: number }
  | { type: "CLEAR_CELL"; index: number }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "REVEAL_HINT"; index?: number }
  | { type: "FLAG_MISTAKES" }
  | { type: "CLEAR_FLAGS" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "TICK"; now: number }
  | { type: "RESET" };

export function initialState(
  puzzle: Puzzle,
  mode: Mode,
  dateKey?: string,
  now: number = Date.now(),
): GameState {
  const cells = puzzle.cages.map(() => null).flat();
  void cells;
  const total = puzzle.size * puzzle.size;
  return {
    puzzle,
    cells: Array.from({ length: total }, () => ({
      value: null,
      notes: [],
      given: false,
    })),
    selected: null,
    notesMode: false,
    past: [],
    future: [],
    elapsedMs: 0,
    startedAt: now,
    lastTickAt: now,
    status: "playing",
    hintsUsed: 0,
    mistakeFlags: new Array(total).fill(false),
    mode,
    dateKey,
  };
}

function snapshot(state: GameState): GameSnapshot {
  return { cells: state.cells.map((c) => ({ ...c, notes: c.notes.slice() })) };
}

function withSnapshot(state: GameState): GameState {
  const past = state.past.slice();
  past.push(snapshot(state));
  while (past.length > SNAPSHOT_CAP) past.shift();
  return { ...state, past, future: [], mistakeFlags: state.mistakeFlags.map(() => false) };
}

function maybeWin(state: GameState): GameState {
  if (state.status !== "playing") return state;
  if (isComplete(state.cells, state.puzzle.cages, state.puzzle.size)) {
    return { ...state, status: "won" };
  }
  return state;
}

function pickEmptyCell(state: GameState): number | null {
  for (let i = 0; i < state.cells.length; i++) {
    if (state.cells[i].value === null) return i;
  }
  return null;
}

export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "SELECT":
      return { ...state, selected: action.index };

    case "TOGGLE_NOTES_MODE":
      return { ...state, notesMode: !state.notesMode };

    case "SET_VALUE": {
      if (state.status !== "playing") return state;
      const N = state.puzzle.size;
      const r = Math.floor(action.index / N);
      const c = action.index % N;
      const next = withSnapshot(state);
      let cells = next.cells.map((cell, i) =>
        i === action.index ? { ...cell, value: action.value, notes: [] } : cell,
      );
      cells = eliminateRowColNotes(N, cells, r, c, action.value);
      return maybeWin({ ...next, cells });
    }

    case "TOGGLE_NOTE": {
      if (state.status !== "playing") return state;
      const cell = state.cells[action.index];
      if (cell.value !== null) return state;
      const next = withSnapshot(state);
      const cells = next.cells.map((c, i) =>
        i === action.index ? { ...c, notes: toggleNote(c.notes, action.value) } : c,
      );
      return { ...next, cells };
    }

    case "CLEAR_CELL": {
      if (state.status !== "playing") return state;
      const cell = state.cells[action.index];
      if (cell.value === null && cell.notes.length === 0) return state;
      const next = withSnapshot(state);
      const cells = next.cells.map((c, i) =>
        i === action.index ? { ...c, value: null, notes: [] } : c,
      );
      return { ...next, cells };
    }

    case "UNDO": {
      if (state.past.length === 0) return state;
      const past = state.past.slice();
      const prev = past.pop()!;
      const future = state.future.slice();
      future.push(snapshot(state));
      return {
        ...state,
        past,
        future,
        cells: prev.cells,
        status: "playing",
        mistakeFlags: state.mistakeFlags.map(() => false),
      };
    }

    case "REDO": {
      if (state.future.length === 0) return state;
      const future = state.future.slice();
      const next = future.pop()!;
      const past = state.past.slice();
      past.push(snapshot(state));
      return {
        ...state,
        past,
        future,
        cells: next.cells,
        mistakeFlags: state.mistakeFlags.map(() => false),
      };
    }

    case "REVEAL_HINT": {
      if (state.status !== "playing") return state;
      let target: number | null = action.index ?? null;
      if (target === null) target = pickEmptyCell(state);
      if (target === null) return state;
      const correct = state.puzzle.solution[target];
      const N = state.puzzle.size;
      const r = Math.floor(target / N);
      const c = target % N;
      const next = withSnapshot(state);
      let cells = next.cells.map((cell, i) =>
        i === target
          ? { value: correct, notes: [], given: true }
          : cell,
      );
      cells = eliminateRowColNotes(N, cells, r, c, correct);
      return maybeWin({ ...next, cells, hintsUsed: state.hintsUsed + 1 });
    }

    case "FLAG_MISTAKES": {
      const flags = findMistakes(state.cells, state.puzzle.solution);
      return { ...state, mistakeFlags: flags };
    }

    case "CLEAR_FLAGS":
      return { ...state, mistakeFlags: state.mistakeFlags.map(() => false) };

    case "PAUSE":
      if (state.status !== "playing") return state;
      return { ...state, status: "paused" };

    case "RESUME":
      if (state.status !== "paused") return state;
      return { ...state, status: "playing", lastTickAt: Date.now() };

    case "TICK": {
      if (state.status !== "playing") return { ...state, lastTickAt: action.now };
      const delta = action.now - state.lastTickAt;
      return {
        ...state,
        elapsedMs: state.elapsedMs + (delta > 0 ? delta : 0),
        lastTickAt: action.now,
      };
    }

    case "RESET":
      return initialState(state.puzzle, state.mode, state.dateKey);

    default:
      return state;
  }
}
