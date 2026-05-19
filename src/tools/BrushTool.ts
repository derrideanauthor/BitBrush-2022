import type { Tool, ToolContext, ToolOptions } from './Tool';
import { drawLine } from '../canvas/CanvasEngine';

let lastX = 0;
let lastY = 0;
let drawing = false;

export const BrushTool: Tool = {
  name: 'brush',
  onPointerDown(ctx: ToolContext, x: number, y: number, opts: ToolOptions): void {
    const canvasCtx = ctx.canvas.getContext('2d');
    if (!canvasCtx) return;
    drawing = true;
    lastX = x;
    lastY = y;
    const hex = opts.color.getHex();
    canvasCtx.fillStyle = hex;
    canvasCtx.fillRect(
      x - Math.floor(opts.size / 2),
      y - Math.floor(opts.size / 2),
      opts.size,
      opts.size
    );
  },
  onPointerMove(ctx: ToolContext, x: number, y: number, opts: ToolOptions): void {
    if (!drawing) return;
    const canvasCtx = ctx.canvas.getContext('2d');
    if (!canvasCtx) return;
    const hex = opts.color.getHex();
    drawLine(canvasCtx, lastX, lastY, x, y, opts.size, hex);
    lastX = x;
    lastY = y;
  },
  onPointerUp(_ctx: ToolContext, _x: number, _y: number, _opts: ToolOptions): void {
    drawing = false;
  },
};
