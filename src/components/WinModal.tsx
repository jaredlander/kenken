import type { Mode, Size } from "../game/types";

interface WinModalProps {
  size: Size;
  mode: Mode;
  dateKey?: string;
  elapsedMs: number;
  hintsUsed: number;
  newBest: boolean;
  streakIncremented: boolean;
  onMenu: () => void;
  onNext: () => void;
}

function fmt(ms: number): string {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function WinModal({
  size,
  mode,
  dateKey,
  elapsedMs,
  hintsUsed,
  newBest,
  streakIncremented,
  onMenu,
  onNext,
}: WinModalProps) {
  const handleShare = async () => {
    const text =
      mode === "daily"
        ? `KenKen ${size}×${size} daily ${dateKey} — ${fmt(elapsedMs)}${hintsUsed ? " (hints)" : ""}`
        : `KenKen ${size}×${size} — ${fmt(elapsedMs)}${hintsUsed ? " (hints)" : ""}`;
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
    } catch {
      /* user cancel or unsupported */
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <h2>You won! 🎉</h2>
        <div>
          {size}×{size} {mode === "daily" ? `daily (${dateKey})` : "unlimited"}
        </div>
        <div style={{ fontSize: "1.5rem", margin: "0.5rem 0", fontVariantNumeric: "tabular-nums" }}>
          {fmt(elapsedMs)}
        </div>
        <div className="badges">
          {newBest && <span className="badge">⭐ New best</span>}
          {streakIncremented && <span className="badge">🔥 Streak</span>}
          {hintsUsed > 0 && <span className="badge">💡 {hintsUsed} hint{hintsUsed === 1 ? "" : "s"}</span>}
        </div>
        <div className="actions">
          <button onClick={handleShare}>Share</button>
          <button onClick={onMenu}>Menu</button>
          <button onClick={onNext}>Next puzzle</button>
        </div>
      </div>
    </div>
  );
}
