import { useEffect } from 'preact/hooks';
import { useAppStore } from '../store/appStore';
import { AppHeader } from './AppHeader';
import { Workspace } from './Workspace';
import { ToolsPanel } from './panels/ToolsPanel';
import { ColorPanel } from './panels/ColorPanel';
import { LayersPanel } from './panels/LayersPanel';
import { FramesPanel } from './panels/FramesPanel';
import { ExportMenu } from './panels/ExportMenu';
import styles from './App.module.css';

export function App() {
  const initSprite = useAppStore((s) => s.initSprite);

  useEffect(() => {
    initSprite(32, 32);
  }, [initSprite]);

  return (
    <div class={styles.app}>
      <AppHeader />
      <div class={styles.main}>
        <ToolsPanel />
        <Workspace />
        <div class={styles.rightPanel}>
          <ColorPanel />
          <LayersPanel />
          <FramesPanel />
          <ExportMenu />
        </div>
      </div>
    </div>
  );
}
