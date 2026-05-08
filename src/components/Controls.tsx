interface ControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  canReset: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onCheck: () => void;
  onReveal: () => void;
  onReset: () => void;
}

export function Controls({
  canUndo,
  canRedo,
  canReset,
  onUndo,
  onRedo,
  onCheck,
  onReveal,
  onReset,
}: ControlsProps) {
  function handleReset() {
    if (!canReset) return;
    if (window.confirm("Reset puzzle? All progress on this puzzle will be lost.")) {
      onReset();
    }
  }
  return (
    <div className="controls">
      <button type="button" onClick={onUndo} disabled={!canUndo}>
        ↶ Undo
      </button>
      <button type="button" onClick={onRedo} disabled={!canRedo}>
        ↷ Redo
      </button>
      <button type="button" onClick={onCheck}>
        Check
      </button>
      <button type="button" onClick={onReveal}>
        Hint
      </button>
      <button type="button" onClick={handleReset} disabled={!canReset}>
        ⟲ Reset
      </button>
    </div>
  );
}
