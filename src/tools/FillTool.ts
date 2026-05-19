import type { Tool, ToolContext, ToolOptions } from './Tool';
import { floodFill } from '../utils/floodFill';

export const FillTool: Tool = {
  name: 'fill',
  onPointerDown(ctx: ToolContext, x: number, y: number, opts: ToolOptions): void {
    const canvasCtx = ctx.canvas.getContext('2d');
    if (!canvasCtx) return;
    const rgba = opts.color.getRGBA();
    const imageData = canvasCtx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    floodFill(
      imageData.data,
      x,
      y,
      { r: rgba.r, g: rgba.g, b: rgba.b, a: Math.round(rgba.a * 255) },
      0,
      ctx.canvas.width,
      ctx.canvas.height
    );
    canvasCtx.putImageData(imageData, 0, 0);
  },
  onPointerMove(_ctx: ToolContext, _x: number, _y: number, _opts: ToolOptions): void {
    // no-op
  },
  onPointerUp(_ctx: ToolContext, _x: number, _y: number, _opts: ToolOptions): void {
    // no-op
  },
};
