import { mulberry32, pick, randInt, shuffle } from "./rng";
import type { Rng } from "./rng";
import { countSolutions } from "./solver";
import type { Cage, Difficulty, Op, Puzzle, Size } from "./types";

interface Profile {
  sizeWeights: { size: number; weight: number }[];
  twoCellOps: { op: Op; weight: number }[];
  multiCellOps: { op: Op; weight: number }[];
}

const PROFILES: Record<Difficulty, Profile> = {
  easy: {
    sizeWeights: [
      { size: 1, weight: 4 },
      { size: 2, weight: 8 },
      { size: 3, weight: 2 },
    ],
    twoCellOps: [
      { op: "+", weight: 4 },
      { op: "-", weight: 4 },
      { op: "*", weight: 2 },
      { op: "/", weight: 1 },
    ],
    multiCellOps: [
      { op: "+", weight: 6 },
      { op: "*", weight: 1 },
    ],
  },
  medium: {
    sizeWeights: [
      { size: 1, weight: 2 },
      { size: 2, weight: 6 },
      { size: 3, weight: 5 },
      { size: 4, weight: 1 },
    ],
    twoCellOps: [
      { op: "+", weight: 3 },
      { op: "-", weight: 3 },
      { op: "*", weight: 3 },
      { op: "/", weight: 2 },
    ],
    multiCellOps: [
      { op: "+", weight: 5 },
      { op: "*", weight: 3 },
    ],
  },
  hard: {
    sizeWeights: [
      { size: 1, weight: 1 },
      { size: 2, weight: 4 },
      { size: 3, weight: 6 },
      { size: 4, weight: 3 },
    ],
    twoCellOps: [
      { op: "+", weight: 2 },
      { op: "-", weight: 3 },
      { op: "*", weight: 3 },
      { op: "/", weight: 3 },
    ],
    multiCellOps: [
      { op: "+", weight: 4 },
      { op: "*", weight: 4 },
    ],
  },
};

function weightedPick<T extends { weight: number }>(rng: Rng, items: T[]): T {
  const total = items.reduce((s, x) => s + x.weight, 0);
  let r = rng() * total;
  for (const it of items) {
    r -= it.weight;
    if (r <= 0) return it;
  }
  return items[items.length - 1];
}

function generateLatinSquare(size: Size, rng: Rng): number[] {
  const N = size;
  const grid = new Array<number>(N * N);
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      grid[i * N + j] = ((i + j) % N) + 1;
    }
  }

  const rowOrder = shuffle(
    Array.from({ length: N }, (_, i) => i),
    rng,
  );
  const colOrder = shuffle(
    Array.from({ length: N }, (_, i) => i),
    rng,
  );
  const valuePerm = shuffle(
    Array.from({ length: N }, (_, i) => i + 1),
    rng,
  );

  const out = new Array<number>(N * N);
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const v = grid[rowOrder[i] * N + colOrder[j]];
      out[i * N + j] = valuePerm[v - 1];
    }
  }
  return out;
}

function partitionCages(size: Size, profile: Profile, rng: Rng): number[][] {
  const N = size;
  const total = N * N;
  const cellCage = new Array<number>(total).fill(-1);
  const cages: number[][] = [];

  const neighbors = (idx: number): number[] => {
    const r = Math.floor(idx / N);
    const c = idx % N;
    const out: number[] = [];
    if (r > 0) out.push(idx - N);
    if (r < N - 1) out.push(idx + N);
    if (c > 0) out.push(idx - 1);
    if (c < N - 1) out.push(idx + 1);
    return out;
  };

  for (let i = 0; i < total; i++) {
    if (cellCage[i] !== -1) continue;
    const cageId = cages.length;
    const targetSize = weightedPick(rng, profile.sizeWeights).size;
    const cells: number[] = [i];
    cellCage[i] = cageId;
    const frontier = neighbors(i).filter((n) => cellCage[n] === -1);

    while (cells.length < targetSize && frontier.length > 0) {
      const pickIdx = randInt(rng, 0, frontier.length - 1);
      const next = frontier.splice(pickIdx, 1)[0];
      if (cellCage[next] !== -1) continue;
      cells.push(next);
      cellCage[next] = cageId;
      for (const n of neighbors(next)) {
        if (cellCage[n] === -1 && !frontier.includes(n)) frontier.push(n);
      }
    }
    cages.push(cells);
  }

  return cages;
}

function assignOps(
  cells: number[][],
  solution: number[],
  profile: Profile,
  rng: Rng,
): Cage[] {
  return cells.map((cellIdxs, id) => {
    const vals = cellIdxs.map((i) => solution[i]);
    if (vals.length === 1) {
      return { id, cells: cellIdxs, op: "=" as Op, target: vals[0] };
    }
    if (vals.length === 2) {
      const [a, b] = vals;
      const candidates = profile.twoCellOps.filter((o) => {
        if (o.op === "/") {
          const hi = Math.max(a, b);
          const lo = Math.min(a, b);
          return lo !== 0 && hi % lo === 0 && hi / lo !== 1;
        }
        if (o.op === "-") return a !== b;
        return true;
      });
      const fallback: { op: Op; weight: number }[] = [{ op: "+", weight: 1 }];
      const chosen = weightedPick(rng, candidates.length ? candidates : fallback);
      let target: number;
      if (chosen.op === "+") target = a + b;
      else if (chosen.op === "-") target = Math.abs(a - b);
      else if (chosen.op === "*") target = a * b;
      else if (chosen.op === "/") target = Math.max(a, b) / Math.min(a, b);
      else target = a;
      return { id, cells: cellIdxs, op: chosen.op, target };
    }
    const chosen = weightedPick(rng, profile.multiCellOps);
    const target =
      chosen.op === "+"
        ? vals.reduce((s, v) => s + v, 0)
        : vals.reduce((s, v) => s * v, 1);
    return { id, cells: cellIdxs, op: chosen.op, target };
  });
}

export function generatePuzzle(
  size: Size,
  difficulty: Difficulty,
  seed: number,
): Puzzle {
  const profile = PROFILES[difficulty];
  const rng = mulberry32(seed);

  for (let solutionAttempt = 0; solutionAttempt < 8; solutionAttempt++) {
    const solution = generateLatinSquare(size, rng);
    for (let cageAttempt = 0; cageAttempt < 20; cageAttempt++) {
      const cells = partitionCages(size, profile, rng);
      const cages = assignOps(cells, solution, profile, rng);
      const cellCage = new Array<number>(size * size).fill(0);
      cages.forEach((cage, id) => {
        for (const c of cage.cells) cellCage[c] = id;
      });
      const count = countSolutions(size, cages, cellCage, 2);
      if (count === 1) {
        return { size, difficulty, cages, cellCage, solution, seed };
      }
    }
  }

  // Fallback: every cell is a single "=" cage. Always unique.
  const solution = generateLatinSquare(size, rng);
  void pick;
  const cages: Cage[] = solution.map((v, i) => ({
    id: i,
    cells: [i],
    op: "=" as Op,
    target: v,
  }));
  const cellCage = solution.map((_, i) => i);
  return { size, difficulty, cages, cellCage, solution, seed };
}
