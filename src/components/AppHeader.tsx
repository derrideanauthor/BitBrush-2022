import { useAppStore } from '../store/appStore';
import styles from './AppHeader.module.css';

export function AppHeader() {
  const projectName = useAppStore((s) => s.projectName);
  const undo = useAppStore((s) => s.undo);
  const redo = useAppStore((s) => s.redo);
  const historyIndex = useAppStore((s) => s.historyIndex);
  const undoStack = useAppStore((s) => s.undoStack);

  return (
    <header class={styles.header}>
      <div class={styles.title}>BitBrush</div>
      <div class={styles.projectName}>{projectName}</div>
      <div class={styles.actions}>
        <button
          class={styles.btn}
          onClick={undo}
          disabled={historyIndex <= 0}
          title="Undo"
        >
          ↩
        </button>
        <button
          class={styles.btn}
          onClick={redo}
          disabled={historyIndex >= undoStack.length - 1}
          title="Redo"
        >
          ↪
        </button>
      </div>
    </header>
  );
}
