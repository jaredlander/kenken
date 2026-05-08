interface ControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onCheck: () => void;
  onReveal: () => void;
}

export function Controls({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onCheck,
  onReveal,
}: ControlsProps) {
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
    </div>
  );
}
