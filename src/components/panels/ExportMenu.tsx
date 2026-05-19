import { useAppStore } from '../../store/appStore';
import { exportPNG, exportZIP } from '../../utils/exportUtils';
import styles from './ExportMenu.module.css';

export function ExportMenu() {
  const sprite = useAppStore((s) => s.sprite);
  const projectName = useAppStore((s) => s.projectName);

  const handleExportPNG = () => {
    if (sprite.frame) {
      sprite.makeLayerMixdown();
      exportPNG(sprite.frame.mixdown, projectName);
    }
  };

  const handleExportZIP = async () => {
    const frames = sprite.frameData.map((f) => f.mixdown);
    await exportZIP(frames, projectName);
  };

  return (
    <div class={styles.panel}>
      <div class={styles.title}>Export</div>
      <button class={styles.exportBtn} onClick={handleExportPNG}>
        Export PNG
      </button>
      <button class={styles.exportBtn} onClick={handleExportZIP}>
        Export ZIP
      </button>
    </div>
  );
}
