import type { Tool, ToolContext, ToolOptions } from './Tool';

interface SelectState {
  startX: number;
  startY: number;
  active: boolean;
}

const state: SelectState = { startX: 0, startY: 0, active: false };

export const SelectTool: Tool = {
  name: 'select',
  onPointerDown(_ctx: ToolContext, x: number, y: number, _opts: ToolOptions): void {
    state.startX = x;
    state.startY = y;
    state.active = true;
  },
  onPointerMove(ctx: ToolContext, x: number, y: number, _opts: ToolOptions): void {
    if (!state.active) return;
    const previewCtx = ctx.previewCanvas.getContext('2d');
    if (!previewCtx) return;
    previewCtx.clearRect(0, 0, ctx.previewCanvas.width, ctx.previewCanvas.height);
    previewCtx.strokeStyle = '#0088ff';
    previewCtx.lineWidth = 1;
    previewCtx.setLineDash([4, 2]);
    previewCtx.strokeRect(
      Math.min(state.startX, x),
      Math.min(state.startY, y),
      Math.abs(x - state.startX),
      Math.abs(y - state.startY)
    );
  },
  onPointerUp(ctx: ToolContext, _x: number, _y: number, _opts: ToolOptions): void {
    state.active = false;
    const previewCtx = ctx.previewCanvas.getContext('2d');
    if (previewCtx) previewCtx.setLineDash([]);
  },
};
