import { useAppStore } from '../../store/appStore';
import styles from './LayersPanel.module.css';

export function LayersPanel() {
  const sprite = useAppStore((s) => s.sprite);
  const activeLayerId = useAppStore((s) => s.activeLayerId);
  const setActiveLayer = useAppStore((s) => s.setActiveLayer);
  const updateSprite = useAppStore((s) => s.updateSprite);
  useAppStore((s) => s.spriteVersion); // subscribe to re-render

  const handleAddLayer = () => {
    sprite.addLayer(`Layer ${sprite.layerStack.length + 1}`);
    setActiveLayer(sprite.layerId);
    updateSprite();
  };

  const handleRemoveLayer = (id: string) => {
    if (sprite.layerStack.length <= 1) return;
    sprite.removeLayer(id);
    setActiveLayer(sprite.layerId);
    updateSprite();
  };

  return (
    <div class={styles.panel}>
      <div class={styles.header}>
        <span class={styles.title}>Layers</span>
        <button class={styles.addBtn} onClick={handleAddLayer} title="Add layer">+</button>
      </div>
      <ul class={styles.list}>
        {[...sprite.layerStack].reverse().map((layer) => (
          <li
            key={layer.id}
            class={`${styles.item} ${layer.id === activeLayerId ? styles.itemActive : ''}`}
            onClick={() => setActiveLayer(layer.id)}
          >
            <span class={styles.layerName}>{layer.name}</span>
            <button
              class={styles.removeBtn}
              onClick={(e) => { e.stopPropagation(); handleRemoveLayer(layer.id); }}
              title="Remove layer"
              disabled={sprite.layerStack.length <= 1}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
