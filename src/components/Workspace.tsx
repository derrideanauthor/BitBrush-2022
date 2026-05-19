import { useRef, useEffect } from 'preact/hooks';
import { useAppStore } from '../store/appStore';
import styles from './Workspace.module.css';

export function Workspace() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const artWidth = useAppStore((s) => s.artWidth);
  const artHeight = useAppStore((s) => s.artHeight);
  const artScale = useAppStore((s) => s.artScale);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
  }, []);

  const displayWidth = artWidth * artScale;
  const displayHeight = artHeight * artScale;

  return (
    <div class={styles.workspace}>
      <div
        class={styles.canvasContainer}
        style={{ width: `${displayWidth}px`, height: `${displayHeight}px` }}
      >
        <canvas
          ref={canvasRef}
          class={styles.artCanvas}
          width={artWidth}
          height={artHeight}
          style={{ width: `${displayWidth}px`, height: `${displayHeight}px` }}
        />
        <canvas
          ref={previewRef}
          class={styles.previewCanvas}
          width={artWidth}
          height={artHeight}
          style={{ width: `${displayWidth}px`, height: `${displayHeight}px` }}
        />
      </div>
    </div>
  );
}
