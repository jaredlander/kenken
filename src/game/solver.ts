import type { Cage, Op, Size } from "./types";

export function checkCage(op: Op, target: number, vals: number[]): boolean {
  if (op === "=") return vals.length === 1 && vals[0] === target;
  if (op === "+") return vals.reduce((a, b) => a + b, 0) === target;
  if (op === "*") return vals.reduce((a, b) => a * b, 1) === target;
  if (op === "-") {
    if (vals.length !== 2) return false;
    return Math.abs(vals[0] - vals[1]) === target;
  }
  if (op === "/") {
    if (vals.length !== 2) return false;
    const [a, b] = vals;
    return (a !== 0 && b % a === 0 && b / a === target) ||
      (b !== 0 && a % b === 0 && a / b === target);
  }
  return false;
}

function partialFeasibleByOp(
  op: Op,
  target: number,
  vals: number[],
  remainingMin: number,
): boolean {
  if (op === "+") {
    const sum = vals.reduce((a, b) => a + b, 0);
    return sum + remainingMin <= target;
  }
  if (op === "*") {
    const prod = vals.reduce((a, b) => a * b, 1);
    return target % prod === 0;
  }
  return true;
}

export function countSolutions(
  size: Size,
  cages: Cage[],
  cellCage: number[],
  limit = 2,
): number {
  const N = size;
  const total = N * N;
  const rowMask = new Array<number>(N).fill(0);
  const colMask = new Array<number>(N).fill(0);
  const cageVals: number[][] = cages.map(() => []);
  const cageRemaining: number[] = cages.map((c) => c.cells.length);
  const grid = new Array<number>(total).fill(0);
  let found = 0;

  const idx = (r: number, c: number) => r * N + c;

  function recurse(pos: number): boolean {
    if (found >= limit) return true;
    if (pos === total) {
      found++;
      return found >= limit;
    }
    const r = Math.floor(pos / N);
    const c = pos % N;
    const cageId = cellCage[pos];
    const cage = cages[cageId];

    for (let v = 1; v <= N; v++) {
      const bit = 1 << v;
      if (rowMask[r] & bit) continue;
      if (colMask[c] & bit) continue;

      cageVals[cageId].push(v);
      cageRemaining[cageId]--;
      grid[pos] = v;
      rowMask[r] |= bit;
      colMask[c] |= bit;

      let ok = true;
      if (cageRemaining[cageId] === 0) {
        ok = checkCage(cage.op, cage.target, cageVals[cageId]);
      } else {
        ok = partialFeasibleByOp(
          cage.op,
          cage.target,
          cageVals[cageId],
          cageRemaining[cageId],
        );
      }

      if (ok) {
        if (recurse(pos + 1)) {
          cageVals[cageId].pop();
          cageRemaining[cageId]++;
          rowMask[r] ^= bit;
          colMask[c] ^= bit;
          if (found >= limit) return true;
        }
      }

      cageVals[cageId].pop();
      cageRemaining[cageId]++;
      rowMask[r] ^= bit;
      colMask[c] ^= bit;
      grid[pos] = 0;
    }
    return false;
  }

  void idx;
  recurse(0);
  return found;
}
