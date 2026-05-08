import type { Size } from "../game/types";

interface KeypadProps {
  size: Size;
  notesMode: boolean;
  onDigit: (n: number) => void;
  onClear: () => void;
  onToggleNotes: () => void;
}

export function Keypad({ size, notesMode, onDigit, onClear, onToggleNotes }: KeypadProps) {
  const digits = Array.from({ length: size }, (_, i) => i + 1);
  return (
    <div className="keypad" style={{ gridTemplateColumns: `repeat(${size + 2}, 1fr)` }}>
      {digits.map((d) => (
        <button key={d} type="button" onClick={() => onDigit(d)}>
          {d}
        </button>
      ))}
      <button
        type="button"
        className={notesMode ? "active" : undefined}
        onClick={onToggleNotes}
        aria-pressed={notesMode}
        aria-label="Toggle notes mode (N)"
        title="Toggle notes mode (N)"
      >
        ✎
      </button>
      <button
        type="button"
        onClick={onClear}
        aria-label="Clear cell (Backspace)"
        title="Clear cell (Backspace)"
      >
        ⌫
      </button>
    </div>
  );
}
