import { loadStats } from "../persistence/stats";
import { SIZES } from "../game/types";

interface StatsScreenProps {
  onBack: () => void;
}

function fmtMs(ms: number | null): string {
  if (ms === null) return "—";
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function StatsScreen({ onBack }: StatsScreenProps) {
  return (
    <div className="app">
      <div className="topbar">
        <button onClick={onBack}>← Back</button>
        <h1>Stats</h1>
        <div />
      </div>

      <div className="stats">
        {SIZES.map((s) => {
          const st = loadStats(s);
          return (
            <div key={s}>
              <h3 style={{ margin: "0.5rem 0" }}>
                {s}×{s}
              </h3>
              <div className="stats-grid">
                <div className="stats-card">
                  <div className="label">Played</div>
                  <div className="value">{st.played}</div>
                </div>
                <div className="stats-card">
                  <div className="label">Won</div>
                  <div className="value">
                    {st.won}{" "}
                    {st.hintAssistedWins > 0 && (
                      <span className="muted">({st.hintAssistedWins} w/ hints)</span>
                    )}
                  </div>
                </div>
                <div className="stats-card">
                  <div className="label">Best time (no hints)</div>
                  <div className="value">{fmtMs(st.bestMs)}</div>
                </div>
                <div className="stats-card">
                  <div className="label">Daily streak</div>
                  <div className="value">
                    {st.currentStreak} <span className="muted">/ {st.bestStreak} best</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
