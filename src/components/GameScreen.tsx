import { useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "../state/useGame";
import type { Difficulty, Mode, Size } from "../game/types";
import { useTheme } from "../theme/ThemeProvider";
import { Board } from "./Board";
import { Controls } from "./Controls";
import { Keypad } from "./Keypad";
import { Timer } from "./Timer";
import { WinModal } from "./WinModal";
import { recordWin } from "../persistence/stats";

interface GameScreenProps {
  mode: Mode;
  size: Size;
  difficulty?: Difficulty;
  unlimitedSalt?: number;
  onBack: () => void;
  onNext: () => void;
}

export function GameScreen(props: GameScreenProps) {
  const { state, dispatch, puzzleId } = useGame(props);
  const { theme, toggle } = useTheme();
  const [winInfo, setWinInfo] = useState<{ newBest: boolean; streakIncremented: boolean } | null>(
    null,
  );
  const recordedRef = useRef(false);

  useEffect(() => {
    if (state.status === "won" && !recordedRef.current) {
      recordedRef.current = true;
      const result = recordWin({
        size: state.puzzle.size,
        mode: state.mode,
        dateKey: state.dateKey,
        elapsedMs: state.elapsedMs,
        hintsUsed: state.hintsUsed,
      });
      setWinInfo({ newBest: result.newBest, streakIncremented: result.streakIncremented });
      navigator.vibrate?.(30);
    }
  }, [state.status, state.puzzle.size, state.mode, state.dateKey, state.elapsedMs, state.hintsUsed]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (state.status !== "playing") return;
      if (e.key >= "1" && e.key <= "9") {
        const v = Number(e.key);
        if (v <= state.puzzle.size && state.selected !== null) {
          if (state.notesMode) dispatch({ type: "TOGGLE_NOTE", index: state.selected, value: v });
          else dispatch({ type: "SET_VALUE", index: state.selected, value: v });
        }
      } else if (e.key === "Backspace" || e.key === "Delete") {
        if (state.selected !== null) dispatch({ type: "CLEAR_CELL", index: state.selected });
      } else if (e.key === "n" || e.key === "N") {
        dispatch({ type: "TOGGLE_NOTES_MODE" });
      } else if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) dispatch({ type: "REDO" });
        else dispatch({ type: "UNDO" });
      } else if (e.key.startsWith("Arrow") && state.selected !== null) {
        const N = state.puzzle.size;
        const r = Math.floor(state.selected / N);
        const c = state.selected % N;
        let nr = r;
        let nc = c;
        if (e.key === "ArrowUp") nr = Math.max(0, r - 1);
        if (e.key === "ArrowDown") nr = Math.min(N - 1, r + 1);
        if (e.key === "ArrowLeft") nc = Math.max(0, c - 1);
        if (e.key === "ArrowRight") nc = Math.min(N - 1, c + 1);
        dispatch({ type: "SELECT", index: nr * N + nc });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state, dispatch]);

  const headerTitle = useMemo(() => {
    const s = state.puzzle.size;
    if (state.mode === "daily") return `${s}×${s} • Daily`;
    return `${s}×${s} • ${puzzleId.difficulty}`;
  }, [state.puzzle.size, state.mode, puzzleId.difficulty]);

  return (
    <div className="app">
      <div className="topbar">
        <button onClick={props.onBack}>← Menu</button>
        <h1>{headerTitle}</h1>
        <div className="right">
          <Timer ms={state.elapsedMs} paused={state.status === "paused"} />
          <button
            onClick={() =>
              dispatch({ type: state.status === "paused" ? "RESUME" : "PAUSE" })
            }
            aria-label={state.status === "paused" ? "Resume" : "Pause"}
            disabled={state.status === "won"}
          >
            {state.status === "paused" ? "▶" : "⏸"}
          </button>
          <button onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? "☀" : "☾"}
          </button>
        </div>
      </div>

      <div className="board-stack">
        <Board state={state} onSelect={(i) => dispatch({ type: "SELECT", index: i })} />
        {state.status === "paused" && (
          <div className="paused-overlay" role="dialog" aria-label="Paused">
            <div className="paused-content">
              <div className="paused-title">Paused</div>
              <button onClick={() => dispatch({ type: "RESUME" })}>Resume</button>
            </div>
          </div>
        )}
      </div>

      <Keypad
        size={state.puzzle.size}
        notesMode={state.notesMode}
        onDigit={(n) => {
          if (state.selected === null) return;
          if (state.notesMode) dispatch({ type: "TOGGLE_NOTE", index: state.selected, value: n });
          else dispatch({ type: "SET_VALUE", index: state.selected, value: n });
        }}
        onClear={() => state.selected !== null && dispatch({ type: "CLEAR_CELL", index: state.selected })}
        onToggleNotes={() => dispatch({ type: "TOGGLE_NOTES_MODE" })}
      />

      <Controls
        canUndo={state.past.length > 0}
        canRedo={state.future.length > 0}
        onUndo={() => dispatch({ type: "UNDO" })}
        onRedo={() => dispatch({ type: "REDO" })}
        onCheck={() => dispatch({ type: "FLAG_MISTAKES" })}
        onReveal={() => dispatch({ type: "REVEAL_HINT" })}
      />

      {state.status === "won" && winInfo && (
        <WinModal
          size={state.puzzle.size}
          mode={state.mode}
          dateKey={state.dateKey}
          elapsedMs={state.elapsedMs}
          hintsUsed={state.hintsUsed}
          newBest={winInfo.newBest}
          streakIncremented={winInfo.streakIncremented}
          onMenu={props.onBack}
          onNext={props.onNext}
        />
      )}
    </div>
  );
}
