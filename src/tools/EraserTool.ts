import type { Tool, ToolContext, ToolOptions } from './Tool';

export const EraserTool: Tool = {
  name: 'eraser',
  onPointerDown(ctx: ToolContext, x: number, y: number, opts: ToolOptions): void {
    const canvasCtx = ctx.canvas.getContext('2d');
    if (!canvasCtx) return;
    canvasCtx.clearRect(
      x - Math.floor(opts.size / 2),
      y - Math.floor(opts.size / 2),
      opts.size,
      opts.size
    );
  },
  onPointerMove(ctx: ToolContext, x: number, y: number, opts: ToolOptions): void {
    const canvasCtx = ctx.canvas.getContext('2d');
    if (!canvasCtx) return;
    canvasCtx.clearRect(
      x - Math.floor(opts.size / 2),
      y - Math.floor(opts.size / 2),
      opts.size,
      opts.size
    );
  },
  onPointerUp(_ctx: ToolContext, _x: number, _y: number, _opts: ToolOptions): void {
    // no-op
  },
};
