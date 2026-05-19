export interface LayerProps {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  stackPos: number;
}

export interface LayerData {
  id: string;
  img: ImageData;
}

export interface FrameData {
  num: number;
  layerData: LayerData[];
  mixdown: HTMLCanvasElement;
}

export class Sprite {
  active: boolean;
  name: string;
  frameNum: number;
  frameData: FrameData[];
  frame: FrameData | null;
  layerStack: LayerProps[];
  layerId: string;
  width: number;
  height: number;
  fps: number;
  stamp: HTMLCanvasElement;
  showHiddenLayers: boolean;

  constructor() {
    this.active = false;
    this.name = 'Untitled';
    this.frameNum = 0;
    this.frameData = [];
    this.frame = null;
    this.layerStack = [];
    this.layerId = '';
    this.width = 32;
    this.height = 32;
    this.fps = 12;
    this.stamp = document.createElement('canvas');
    this.showHiddenLayers = false;
  }

  init(w: number, h: number): void {
    this.setSize(w, h);
    this.addFrame(0, false);
    this.addLayer('Layer 1');
  }

  erase(): void {
    this.active = false;
    this.name = 'Untitled';
    this.frameNum = 0;
    this.frameData = [];
    this.frame = null;
    this.layerStack = [];
    this.layerId = '';
    this.width = 32;
    this.height = 32;
    this.fps = 12;
  }

  setSize(w: number, h: number): void {
    this.width = w;
    this.height = h;
    this.stamp.width = w;
    this.stamp.height = h;
  }

  addFrame(num: number, clone: boolean): void {
    const newNum = num + 1;
    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;

    const newFrame: FrameData = {
      num: newNum,
      layerData: [],
      mixdown: canvas,
    };

    if (clone && this.frame) {
      for (const layer of this.layerStack) {
        const srcLayerData = this.frame.layerData.find((ld) => ld.id === layer.id);
        const img = new ImageData(this.width, this.height);
        if (srcLayerData) {
          img.data.set(srcLayerData.img.data);
        }
        newFrame.layerData.push({ id: layer.id, img });
      }
    } else {
      for (const layer of this.layerStack) {
        newFrame.layerData.push({
          id: layer.id,
          img: new ImageData(this.width, this.height),
        });
      }
    }

    this.frameData.splice(newNum, 0, newFrame);

    for (let i = 0; i < this.frameData.length; i++) {
      this.frameData[i].num = i + 1;
    }

    this.setFrame(newNum);
  }

  setFrame(num: number): void {
    const frame = this.frameData.find((f) => f.num === num);
    if (frame) {
      this.frame = frame;
      this.frameNum = num;
    }
  }

  addLayer(name: string): void {
    const id = `layer_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const stackPos = this.layerStack.length;

    this.layerStack.push({
      id,
      name,
      visible: true,
      opacity: 1,
      stackPos,
    });

    for (const frame of this.frameData) {
      frame.layerData.push({
        id,
        img: new ImageData(this.width, this.height),
      });
    }

    this.layerId = id;
  }

  removeLayer(id: string): void {
    this.layerStack = this.layerStack.filter((l) => l.id !== id);

    for (let i = 0; i < this.layerStack.length; i++) {
      this.layerStack[i].stackPos = i;
    }

    for (const frame of this.frameData) {
      frame.layerData = frame.layerData.filter((ld) => ld.id !== id);
    }

    if (this.layerStack.length > 0) {
      this.layerId = this.layerStack[this.layerStack.length - 1].id;
    } else {
      this.layerId = '';
    }
  }

  setLayer(id: string): void {
    const layer = this.layerStack.find((l) => l.id === id);
    if (layer) {
      this.layerId = id;
    }
  }

  makeLayerMixdown(): void {
    if (!this.frame) return;

    const canvas = this.frame.mixdown;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.layerStack.length; i++) {
      const layer = this.layerStack[i];
      if (!layer.visible && !this.showHiddenLayers) continue;

      const layerData = this.frame.layerData.find((ld) => ld.id === layer.id);
      if (!layerData) continue;

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = this.width;
      tempCanvas.height = this.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) continue;

      tempCtx.putImageData(layerData.img, 0, 0);

      ctx.globalAlpha = layer.opacity;
      ctx.drawImage(tempCanvas, 0, 0);
      ctx.globalAlpha = 1;
    }
  }

  getLayerPos(id: string): number {
    const layer = this.layerStack.find((l) => l.id === id);
    return layer ? layer.stackPos : -1;
  }
}
