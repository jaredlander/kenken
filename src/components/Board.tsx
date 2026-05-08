import { useMemo } from "react";
import { cageAnchors, formatCageLabel } from "../game/validate";
import type { GameState } from "../game/types";
import { Cell } from "./Cell";

interface BoardProps {
  state: GameState;
  onSelect: (index: number) => void;
}

export function Board({ state, onSelect }: BoardProps) {
  const { puzzle, cells, selected, mistakeFlags, status } = state;
  const N = puzzle.size;

  const anchors = useMemo(() => {
    const a = cageAnchors(puzzle.cages, N);
    const map = new Map<number, string>();
    a.forEach((idx, cageId) => map.set(idx, formatCageLabel(puzzle.cages[cageId])));
    return map;
  }, [puzzle, N]);

  const selectedRow = selected !== null ? Math.floor(selected / N) : -1;
  const selectedCol = selected !== null ? selected % N : -1;

  const className = `board${status === "won" ? " win-flash" : ""}`;

  return (
    <div className="board-wrap">
      <div className={className} style={{ ["--cells" as never]: N }}>
        {cells.map((cell, i) => {
          const r = Math.floor(i / N);
          const c = i % N;
          const myCage = puzzle.cellCage[i];
          const top = r === 0 || puzzle.cellCage[i - N] !== myCage;
          const bottom = r === N - 1 || puzzle.cellCage[i + N] !== myCage;
          const left = c === 0 || puzzle.cellCage[i - 1] !== myCage;
          const right = c === N - 1 || puzzle.cellCage[i + 1] !== myCage;
          const highlighted = r === selectedRow || c === selectedCol;
          return (
            <Cell
              key={i}
              index={i}
              state={cell}
              size={N}
              selected={i === selected}
              highlighted={highlighted}
              mistake={mistakeFlags[i]}
              cageLabel={anchors.get(i)}
              borders={{ top, right, bottom, left }}
              onSelect={onSelect}
            />
          );
        })}
      </div>
    </div>
  );
}
