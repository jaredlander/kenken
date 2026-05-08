import type { CellState, Size } from "../game/types";

interface NotesGridProps {
  size: Size;
  notes: number[];
}

function NotesGrid({ size, notes }: NotesGridProps) {
  const cells = Array.from({ length: 9 }, (_, i) => {
    const v = i + 1;
    if (v > size) return null;
    return notes.includes(v) ? v : null;
  });
  return (
    <div className="notes-grid" aria-hidden="true">
      {cells.map((v, i) => (
        <span key={i}>{v ?? ""}</span>
      ))}
    </div>
  );
}

interface CellProps {
  index: number;
  state: CellState;
  size: Size;
  selected: boolean;
  highlighted: boolean;
  mistake: boolean;
  cageLabel?: string;
  borders: { top: boolean; right: boolean; bottom: boolean; left: boolean };
  onSelect: (index: number) => void;
}

export function Cell({
  index,
  state,
  size,
  selected,
  highlighted,
  mistake,
  cageLabel,
  borders,
  onSelect,
}: CellProps) {
  const cls = [
    "cell",
    selected && "selected",
    highlighted && !selected && "highlighted",
    mistake && "mistake",
    state.given && "given",
    borders.top && "cage-top",
    borders.right && "cage-right",
    borders.bottom && "cage-bottom",
    borders.left && "cage-left",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={cls}
      onClick={() => onSelect(index)}
      aria-label={`Cell ${index + 1}`}
    >
      {cageLabel && <span className="cage-label">{cageLabel}</span>}
      {state.value !== null ? (
        <span>{state.value}</span>
      ) : state.notes.length > 0 ? (
        <NotesGrid size={size} notes={state.notes} />
      ) : null}
    </button>
  );
}
