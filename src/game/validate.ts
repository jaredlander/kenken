import { checkCage } from "./solver";
import type { Cage, CellState, Op, Size } from "./types";

export function isComplete(cells: CellState[], cages: Cage[], size: Size): boolean {
  const N = size;
  for (const cell of cells) if (cell.value === null) return false;

  for (let r = 0; r < N; r++) {
    const seen = new Set<number>();
    for (let c = 0; c < N; c++) {
      const v = cells[r * N + c].value!;
      if (seen.has(v)) return false;
      seen.add(v);
    }
  }
  for (let c = 0; c < N; c++) {
    const seen = new Set<number>();
    for (let r = 0; r < N; r++) {
      const v = cells[r * N + c].value!;
      if (seen.has(v)) return false;
      seen.add(v);
    }
  }
  for (const cage of cages) {
    const vals = cage.cells.map((i) => cells[i].value!);
    if (!checkCage(cage.op, cage.target, vals)) return false;
  }
  return true;
}

export function findMistakes(
  cells: CellState[],
  solution: number[],
): boolean[] {
  return cells.map((c, i) => c.value !== null && c.value !== solution[i]);
}

const OP_DISPLAY: Record<Op, string> = {
  "+": "+",
  "-": "−",
  "*": "×",
  "/": "÷",
  "=": "",
};

export function formatCageLabel(cage: Cage): string {
  if (cage.op === "=") return String(cage.target);
  return `${cage.target}${OP_DISPLAY[cage.op]}`;
}

export function cageAnchors(cages: Cage[], size: Size): number[] {
  const N = size;
  return cages.map((cage) => {
    let best = cage.cells[0];
    let bestKey = N * N;
    for (const idx of cage.cells) {
      const r = Math.floor(idx / N);
      const c = idx % N;
      const key = r * N + c;
      if (key < bestKey) {
        bestKey = key;
        best = idx;
      }
    }
    return best;
  });
}
