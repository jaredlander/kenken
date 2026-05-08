import type { CellState, Size } from "./types";

export function eliminateRowColNotes(
  size: Size,
  cells: CellState[],
  r: number,
  c: number,
  value: number,
): CellState[] {
  const N = size;
  return cells.map((cell, i) => {
    const cr = Math.floor(i / N);
    const cc = i % N;
    if ((cr === r || cc === c) && cell.notes.includes(value)) {
      return { ...cell, notes: cell.notes.filter((n) => n !== value) };
    }
    return cell;
  });
}

export function toggleNote(notes: number[], value: number): number[] {
  if (notes.includes(value)) return notes.filter((n) => n !== value);
  const out = notes.concat(value);
  out.sort((a, b) => a - b);
  return out;
}
