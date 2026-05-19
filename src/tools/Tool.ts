import type { Color } from '../utils/colors';

export interface ToolOptions {
  color: Color;
  size: number;
  filled?: boolean;
  fromCenter?: boolean;
  tolerance?: number;
}

export interface ToolContext {
  canvas: HTMLCanvasElement;
  previewCanvas: HTMLCanvasElement;
}

export interface Tool {
  name: string;
  onPointerDown(ctx: ToolContext, x: number, y: number, opts: ToolOptions): void;
  onPointerMove(ctx: ToolContext, x: number, y: number, opts: ToolOptions): void;
  onPointerUp(ctx: ToolContext, x: number, y: number, opts: ToolOptions): void;
}
