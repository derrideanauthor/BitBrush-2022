import { useState } from 'preact/hooks';
import { useAppStore } from '../../store/appStore';
import { Color } from '../../utils/colors';
import styles from './ColorPanel.module.css';

export function ColorPanel() {
  const primaryColor = useAppStore((s) => s.primaryColor);
  const secondaryColor = useAppStore((s) => s.secondaryColor);
  const setPrimaryColor = useAppStore((s) => s.setPrimaryColor);
  const setSecondaryColor = useAppStore((s) => s.setSecondaryColor);
  const [active, setActive] = useState<'primary' | 'secondary'>('primary');

  const handleHexChange = (value: string) => {
    const c = new Color();
    c.setHex(value);
    if (active === 'primary') {
      setPrimaryColor(c);
    } else {
      setSecondaryColor(c);
    }
  };

  const activeColor = active === 'primary' ? primaryColor : secondaryColor;

  return (
    <div class={styles.panel}>
      <div class={styles.title}>Colors</div>
      <div class={styles.swatches}>
        <div
          class={`${styles.swatch} ${active === 'secondary' ? styles.swatchActive : ''}`}
          style={{ background: secondaryColor.getHex() }}
          onClick={() => setActive('secondary')}
          title="Secondary color"
        />
        <div
          class={`${styles.swatch} ${active === 'primary' ? styles.swatchActive : ''}`}
          style={{ background: primaryColor.getHex() }}
          onClick={() => setActive('primary')}
          title="Primary color"
        />
      </div>
      <div class={styles.hexRow}>
        <label class={styles.hexLabel}>Hex</label>
        <input
          class={styles.hexInput}
          type="text"
          value={activeColor.getHex()}
          onChange={(e) => handleHexChange((e.target as HTMLInputElement).value)}
        />
      </div>
    </div>
  );
}
