import { useState } from "react";
import { GameScreen } from "./components/GameScreen";
import { MenuScreen } from "./components/MenuScreen";
import { StatsScreen } from "./components/StatsScreen";
import { nextUnlimitedSalt } from "./persistence/storage";
import type { Difficulty, Mode, Size } from "./game/types";

type View =
  | { kind: "menu" }
  | { kind: "stats" }
  | { kind: "game"; mode: Mode; size: Size; difficulty?: Difficulty; unlimitedSalt?: number };

export function App() {
  const [view, setView] = useState<View>({ kind: "menu" });
  const [lastUnlim, setLastUnlim] = useState<{ size: Size; difficulty: Difficulty } | null>(null);

  const playDaily = (size: Size) => setView({ kind: "game", mode: "daily", size });
  const playUnlimited = (size: Size, difficulty: Difficulty) => {
    setLastUnlim({ size, difficulty });
    setView({
      kind: "game",
      mode: "unlimited",
      size,
      difficulty,
      unlimitedSalt: nextUnlimitedSalt(),
    });
  };

  if (view.kind === "menu") {
    return (
      <MenuScreen
        onPlayDaily={playDaily}
        onPlayUnlimited={playUnlimited}
        onShowStats={() => setView({ kind: "stats" })}
      />
    );
  }
  if (view.kind === "stats") {
    return <StatsScreen onBack={() => setView({ kind: "menu" })} />;
  }
  return (
    <GameScreen
      mode={view.mode}
      size={view.size}
      difficulty={view.difficulty}
      unlimitedSalt={view.unlimitedSalt}
      onBack={() => setView({ kind: "menu" })}
      onNext={() => {
        if (view.mode === "daily") {
          setView({ kind: "menu" });
        } else if (lastUnlim) {
          setView({
            kind: "game",
            mode: "unlimited",
            size: lastUnlim.size,
            difficulty: lastUnlim.difficulty,
            unlimitedSalt: nextUnlimitedSalt(),
          });
        }
      }}
    />
  );
}
