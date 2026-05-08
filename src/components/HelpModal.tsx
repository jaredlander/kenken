interface HelpModalProps {
  onClose: () => void;
}

const SHORTCUTS: Array<{ keys: string; desc: string }> = [
  { keys: "1–9", desc: "Enter a number (or toggle a note in notes mode)" },
  { keys: "N", desc: "Toggle notes mode" },
  { keys: "Backspace / Delete", desc: "Clear the selected cell" },
  { keys: "Arrow keys", desc: "Move the selection" },
  { keys: "Ctrl/⌘ + Z", desc: "Undo" },
  { keys: "Ctrl/⌘ + Shift + Z", desc: "Redo" },
];

export function HelpModal({ onClose }: HelpModalProps) {
  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Help"
      onClick={onClose}
    >
      <div className="modal help-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="help-title">How to play</h2>
        <ul className="help-rules">
          <li>Fill the grid so every row and column contains each number from 1 to N exactly once.</li>
          <li>Each outlined cage shows a target and an operation (e.g. <strong>12×</strong>, <strong>3−</strong>).</li>
          <li>The numbers in a cage must combine, in any order, to produce the target using that operation.</li>
          <li>Single-cell cages are givens — just place that number.</li>
        </ul>

        <h3 className="help-subtitle">Keyboard shortcuts</h3>
        <table className="help-table">
          <tbody>
            {SHORTCUTS.map((s) => (
              <tr key={s.keys}>
                <td><kbd>{s.keys}</kbd></td>
                <td>{s.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="actions">
          <button onClick={onClose} autoFocus>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
