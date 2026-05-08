import { useEffect, useReducer, useRef } from "react";
import { generatePuzzle } from "../game/generator";
import { seedFromDate, seedFromUnlimited, todayKey } from "../game/seed";
import type { Difficulty, GameState, Mode, PuzzleId, Size } from "../game/types";
import { DAILY_DIFFICULTY } from "../game/types";
import { clearGame, loadGame, persistGame } from "../persistence/storage";
import { gameReducer, initialState } from "./gameReducer";
import type { Action } from "./gameReducer";

export interface UseGameOptions {
  mode: Mode;
  size: Size;
  difficulty?: Difficulty;
  dateKey?: string;
  unlimitedSalt?: number;
}

export function buildPuzzleId(opts: UseGameOptions): PuzzleId {
  if (opts.mode === "daily") {
    const dateKey = opts.dateKey ?? todayKey();
    const difficulty = DAILY_DIFFICULTY[opts.size];
    const seed = seedFromDate(dateKey, opts.size);
    return { mode: "daily", size: opts.size, difficulty, dateKey, seed };
  }
  const difficulty = opts.difficulty ?? "easy";
  const seed = seedFromUnlimited(opts.size, difficulty, opts.unlimitedSalt ?? 0);
  return { mode: "unlimited", size: opts.size, difficulty, seed };
}

export function useGame(opts: UseGameOptions) {
  const idRef = useRef<PuzzleId | null>(null);
  const [state, dispatch] = useReducer(
    gameReducer,
    opts,
    (o): GameState => {
      const id = buildPuzzleId(o);
      idRef.current = id;
      const saved = loadGame(id);
      if (saved && saved.status !== "won") {
        return { ...saved, status: "playing", lastTickAt: Date.now() };
      }
      const puzzle = generatePuzzle(id.size, id.difficulty, id.seed);
      return initialState(puzzle, id.mode, id.dateKey);
    },
  );

  useEffect(() => {
    if (!idRef.current) return;
    if (state.status === "won") {
      clearGame(idRef.current);
    } else {
      persistGame(idRef.current, state);
    }
  }, [state]);

  useEffect(() => {
    if (state.status !== "playing") return;
    const id = setInterval(() => dispatch({ type: "TICK", now: Date.now() }), 1000);
    return () => clearInterval(id);
  }, [state.status]);

  useEffect(() => {
    function onVis() {
      if (document.hidden) dispatch({ type: "PAUSE" });
      else dispatch({ type: "RESUME" });
    }
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return { state, dispatch: dispatch as React.Dispatch<Action>, puzzleId: idRef.current! };
}
