import { create } from 'zustand';
import { Color } from '../utils/colors';
import { Sprite } from '../model/Sprite';

export interface AppState {
  artWidth: number;
  artHeight: number;
  artScale: number;
  bgType: 'light' | 'dark' | 'medium';
  projectName: string;
  currentTool: string;
  toolSize: number;
  primaryColor: Color;
  secondaryColor: Color;
  activeLayerId: string;
  activeFrameNum: number;
  undoStack: ImageData[][];
  maxHistory: number;
  historyIndex: number;
  zoomLevel: number;
  artX: number;
  artY: number;
  showGrid: boolean;
  gridSize: number;
  showGuides: boolean;
  sprite: Sprite;
  spriteVersion: number;
  onionSkin: boolean;
  onionSkinRange: [number, number];
  setCurrentTool: (tool: string) => void;
  setPrimaryColor: (color: Color) => void;
  setSecondaryColor: (color: Color) => void;
  setActiveLayer: (id: string) => void;
  setActiveFrame: (num: number) => void;
  setZoomLevel: (zoom: number) => void;
  setArtPos: (x: number, y: number) => void;
  toggleGrid: () => void;
  toggleOnionSkin: () => void;
  pushHistory: (layerData: ImageData[]) => void;
  undo: () => void;
  redo: () => void;
  initSprite: (width: number, height: number) => void;
  updateSprite: () => void;
}

const makePrimaryColor = (): Color => {
  const c = new Color();
  c.setHex('#000000');
  return c;
};

const makeSecondaryColor = (): Color => {
  const c = new Color();
  c.setHex('#ffffff');
  return c;
};

export const useAppStore = create<AppState>((set, get) => ({
  artWidth: 32,
  artHeight: 32,
  artScale: 8,
  bgType: 'light',
  projectName: 'Untitled',
  currentTool: 'brush',
  toolSize: 1,
  primaryColor: makePrimaryColor(),
  secondaryColor: makeSecondaryColor(),
  activeLayerId: '',
  activeFrameNum: 1,
  undoStack: [],
  maxHistory: 20,
  historyIndex: -1,
  zoomLevel: 8,
  artX: 0,
  artY: 0,
  showGrid: true,
  gridSize: 1,
  showGuides: true,
  sprite: new Sprite(),
  spriteVersion: 0,
  onionSkin: false,
  onionSkinRange: [0, 0],

  setCurrentTool: (tool) => set({ currentTool: tool }),
  setPrimaryColor: (color) => set({ primaryColor: color }),
  setSecondaryColor: (color) => set({ secondaryColor: color }),
  setActiveLayer: (id) => set({ activeLayerId: id }),
  setActiveFrame: (num) => set({ activeFrameNum: num }),
  setZoomLevel: (zoom) => set({ zoomLevel: zoom }),
  setArtPos: (x, y) => set({ artX: x, artY: y }),
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  toggleOnionSkin: () => set((s) => ({ onionSkin: !s.onionSkin })),
  updateSprite: () => set((s) => ({ spriteVersion: s.spriteVersion + 1 })),

  pushHistory: (layerData) => {
    const { undoStack, historyIndex, maxHistory } = get();
    const newStack = undoStack.slice(0, historyIndex + 1);
    newStack.push(layerData);
    if (newStack.length > maxHistory) newStack.shift();
    set({ undoStack: newStack, historyIndex: newStack.length - 1 });
  },

  undo: () => {
    const { historyIndex } = get();
    if (historyIndex > 0) {
      set({ historyIndex: historyIndex - 1 });
    }
  },

  redo: () => {
    const { historyIndex, undoStack } = get();
    if (historyIndex < undoStack.length - 1) {
      set({ historyIndex: historyIndex + 1 });
    }
  },

  initSprite: (width, height) => {
    const sprite = new Sprite();
    sprite.init(width, height);
    set({
      sprite,
      artWidth: width,
      artHeight: height,
      activeLayerId: sprite.layerId,
      activeFrameNum: 1,
      spriteVersion: 0,
    });
  },
}));
