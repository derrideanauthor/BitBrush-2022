import { useAppStore } from '../../store/appStore';
import styles from './ToolsPanel.module.css';

const TOOLS = [
  { id: 'brush', label: '✏️', title: 'Brush' },
  { id: 'eraser', label: '⬜', title: 'Eraser' },
  { id: 'fill', label: '🪣', title: 'Fill' },
  { id: 'line', label: '╱', title: 'Line' },
  { id: 'rect', label: '▭', title: 'Rectangle' },
  { id: 'ellipse', label: '◯', title: 'Ellipse' },
  { id: 'select', label: '⬚', title: 'Select' },
];

export function ToolsPanel() {
  const currentTool = useAppStore((s) => s.currentTool);
  const setCurrentTool = useAppStore((s) => s.setCurrentTool);

  return (
    <div class={styles.panel}>
      {TOOLS.map((tool) => (
        <button
          key={tool.id}
          class={`${styles.toolBtn} ${currentTool === tool.id ? styles.toolBtnActive : ''}`}
          onClick={() => setCurrentTool(tool.id)}
          title={tool.title}
        >
          {tool.label}
        </button>
      ))}
    </div>
  );
}
