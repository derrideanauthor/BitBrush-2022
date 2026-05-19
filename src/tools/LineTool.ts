import type { Tool, ToolContext, ToolOptions } from './Tool';
import { drawLine } from '../canvas/CanvasEngine';

interface LineState {
  startX: number;
  startY: number;
  active: boolean;
}

const state: LineState = { startX: 0, startY: 0, active: false };

export const LineTool: Tool = {
  name: 'line',
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
    drawLine(previewCtx, state.startX, state.startY, x, y, opts.size, opts.color.getHex());
  },
  onPointerUp(ctx: ToolContext, x: number, y: number, opts: ToolOptions): void {
    if (!state.active) return;
    state.active = false;
    const canvasCtx = ctx.canvas.getContext('2d');
    if (!canvasCtx) return;
    const previewCtx = ctx.previewCanvas.getContext('2d');
    if (previewCtx) previewCtx.clearRect(0, 0, ctx.previewCanvas.width, ctx.previewCanvas.height);
    drawLine(canvasCtx, state.startX, state.startY, x, y, opts.size, opts.color.getHex());
  },
};
