import { useTheme } from "../theme/ThemeProvider";
import type { Difficulty, Size } from "../game/types";
import { DAILY_DIFFICULTY, SIZES } from "../game/types";
import { todayKey } from "../game/seed";
import { loadDailyCompleted } from "../persistence/stats";

interface MenuScreenProps {
  onPlayDaily: (size: Size) => void;
  onPlayUnlimited: (size: Size, difficulty: Difficulty) => void;
  onShowStats: () => void;
}

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

export function MenuScreen({ onPlayDaily, onPlayUnlimited, onShowStats }: MenuScreenProps) {
  const { theme, toggle } = useTheme();
  const today = todayKey();
  const completedToday = new Set(loadDailyCompleted(today));
  return (
    <div className="app">
      <div className="topbar">
        <h1>KenKen</h1>
        <div className="right">
          <button onClick={onShowStats}>Stats</button>
          <button onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? "☀" : "☾"}
          </button>
        </div>
      </div>

      <div className="menu">
        <h2>Daily</h2>
        <div className="row">
          {SIZES.map((s) => {
            const done = completedToday.has(s);
            return (
              <button key={s} onClick={() => onPlayDaily(s)} disabled={done}>
                {s}×{s}{" "}
                <span className="muted">
                  {done ? "✓ done" : `(${DAILY_DIFFICULTY[s]})`}
                </span>
              </button>
            );
          })}
        </div>

        <h2>Unlimited</h2>
        {SIZES.map((s) => (
          <div key={s}>
            <div className="muted" style={{ padding: "0.25rem 0" }}>
              {s}×{s}
            </div>
            <div className="row">
              {DIFFICULTIES.map((d) => (
                <button key={d} onClick={() => onPlayUnlimited(s, d)}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
