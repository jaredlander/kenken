import { describe, expect, it } from "vitest";
import { generatePuzzle } from "./generator";
import { countSolutions } from "./solver";
import type { Size } from "./types";

describe("generator + solver", () => {
  for (const size of [3, 4, 5] as Size[]) {
    it(`produces a uniquely-solvable ${size}×${size} puzzle`, () => {
      const p = generatePuzzle(size, "easy", 12345 + size);
      expect(p.solution.length).toBe(size * size);
      const count = countSolutions(size, p.cages, p.cellCage, 2);
      expect(count).toBe(1);
    });
  }
});
