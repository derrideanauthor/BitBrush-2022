import type { Tool, ToolContext, ToolOptions } from './Tool';
import { drawRect } from '../canvas/CanvasEngine';

interface RectState {
  startX: number;
  startY: number;
  active: boolean;
}

const state: RectState = { startX: 0, startY: 0, active: false };

export const RectTool: Tool = {
  name: 'rect',
  onPointerDown(_ctx: ToolContext, x: number, y: number, _opts: ToolOptions): void {
    state.startX = x;
    state.startY = y;
    state.active = true;
  },
  onPointerMove(ctx: ToolContext, x: number, y: number, opts: ToolOptions): void {
    if (!state.active) return;
    const previewCtx = ctx.previewCanvas.getContext('2d');
    if (!previewCtx) return;
    previewCtx.clearRect(0, 0, ctx.previewCanvas.width, ctx.previewCanvas.height);
    drawRect(previewCtx, state.startX, state.startY, x, y, opts.size, opts.color.getHex(), opts.filled ?? false, opts.fromCenter ?? false);
  },
  onPointerUp(ctx: ToolContext, x: number, y: number, opts: ToolOptions): void {
    if (!state.active) return;
    state.active = false;
    const canvasCtx = ctx.canvas.getContext('2d');
    if (!canvasCtx) return;
    const previewCtx = ctx.previewCanvas.getContext('2d');
    if (previewCtx) previewCtx.clearRect(0, 0, ctx.previewCanvas.width, ctx.previewCanvas.height);
    drawRect(canvasCtx, state.startX, state.startY, x, y, opts.size, opts.color.getHex(), opts.filled ?? false, opts.fromCenter ?? false);
  },
};
