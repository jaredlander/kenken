interface TimerProps {
  ms: number;
  paused?: boolean;
}

function fmt(ms: number): string {
  const s = Math.floor(ms / 1000);
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export function Timer({ ms, paused }: TimerProps) {
  return (
    <span className="timer" aria-label="Timer">
      {fmt(ms)}
      {paused && " ⏸"}
    </span>
  );
}
