import { useAppStore } from '../../store/appStore';
import styles from './FramesPanel.module.css';

export function FramesPanel() {
  const sprite = useAppStore((s) => s.sprite);
  const activeFrameNum = useAppStore((s) => s.activeFrameNum);
  const setActiveFrame = useAppStore((s) => s.setActiveFrame);
  const updateSprite = useAppStore((s) => s.updateSprite);
  useAppStore((s) => s.spriteVersion); // subscribe to re-render

  const handleAddFrame = () => {
    sprite.addFrame(activeFrameNum, false);
    setActiveFrame(sprite.frameNum);
    updateSprite();
  };

  return (
    <div class={styles.panel}>
      <div class={styles.header}>
        <span class={styles.title}>Frames</span>
        <button class={styles.addBtn} onClick={handleAddFrame} title="Add frame">+</button>
      </div>
      <ul class={styles.list}>
        {sprite.frameData.map((frame) => (
          <li
            key={frame.num}
            class={`${styles.item} ${frame.num === activeFrameNum ? styles.itemActive : ''}`}
            onClick={() => { sprite.setFrame(frame.num); setActiveFrame(frame.num); }}
          >
            Frame {frame.num}
          </li>
        ))}
      </ul>
    </div>
  );
}
