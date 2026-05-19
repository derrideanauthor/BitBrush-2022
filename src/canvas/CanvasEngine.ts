import { floodFill } from '../utils/floodFill';

export function drawLine(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  strokeWidth: number,
  color: string
): void {
  ctx.fillStyle = color;
  let dx = Math.abs(x1 - x0);
  let dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  let cx = x0;
  let cy = y0;

  while (true) {
    ctx.fillRect(
      cx - Math.floor(strokeWidth / 2),
      cy - Math.floor(strokeWidth / 2),
      strokeWidth,
      strokeWidth
    );
    if (cx === x1 && cy === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      cx += sx;
    }
    if (e2 < dx) {
      err += dx;
      cy += sy;
    }
    dx = Math.abs(x1 - cx);
    dy = Math.abs(y1 - cy);
  }
}

export function drawRect(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  strokeWidth: number,
  color: string,
  filled: boolean,
  fromCenter: boolean
): void {
  ctx.fillStyle = color;
  let rx0 = x0;
  let ry0 = y0;
  let rx1 = x1;
  let ry1 = y1;

  if (fromCenter) {
    const w = Math.abs(x1 - x0);
    const h = Math.abs(y1 - y0);
    rx0 = x0 - w;
    ry0 = y0 - h;
    rx1 = x0 + w;
    ry1 = y0 + h;
  }

  const left = Math.min(rx0, rx1);
  const top = Math.min(ry0, ry1);
  const width = Math.abs(rx1 - rx0);
  const height = Math.abs(ry1 - ry0);

  if (filled) {
    ctx.fillRect(left, top, width, height);
  } else {
    ctx.fillRect(left, top, width, strokeWidth);
    ctx.fillRect(left, top + height - strokeWidth, width, strokeWidth);
    ctx.fillRect(left, top, strokeWidth, height);
    ctx.fillRect(left + width - strokeWidth, top, strokeWidth, height);
  }
}

export function centerEllipse(
  ctx: CanvasRenderingContext2D,
  xc: number,
  yc: number,
  a: number,
  b: number,
  strokeWidth: number,
  clear: boolean
): void {
  let x = 0;
  let y = b;
  let d1 = b * b - a * a * b + 0.25 * a * a;
  let dx = 2 * b * b * x;
  let dy = 2 * a * a * y;

  const plot = (px: number, py: number): void => {
    if (clear) {
      ctx.clearRect(xc + px - Math.floor(strokeWidth / 2), yc + py - Math.floor(strokeWidth / 2), strokeWidth, strokeWidth);
      ctx.clearRect(xc - px - Math.floor(strokeWidth / 2), yc + py - Math.floor(strokeWidth / 2), strokeWidth, strokeWidth);
      ctx.clearRect(xc + px - Math.floor(strokeWidth / 2), yc - py - Math.floor(strokeWidth / 2), strokeWidth, strokeWidth);
      ctx.clearRect(xc - px - Math.floor(strokeWidth / 2), yc - py - Math.floor(strokeWidth / 2), strokeWidth, strokeWidth);
    } else {
      ctx.fillRect(xc + px - Math.floor(strokeWidth / 2), yc + py - Math.floor(strokeWidth / 2), strokeWidth, strokeWidth);
      ctx.fillRect(xc - px - Math.floor(strokeWidth / 2), yc + py - Math.floor(strokeWidth / 2), strokeWidth, strokeWidth);
      ctx.fillRect(xc + px - Math.floor(strokeWidth / 2), yc - py - Math.floor(strokeWidth / 2), strokeWidth, strokeWidth);
      ctx.fillRect(xc - px - Math.floor(strokeWidth / 2), yc - py - Math.floor(strokeWidth / 2), strokeWidth, strokeWidth);
    }
  };

  while (dx < dy) {
    plot(x, y);
    if (d1 < 0) {
      x++;
      dx += 2 * b * b;
      d1 += dx + b * b;
    } else {
      x++;
      y--;
      dx += 2 * b * b;
      dy -= 2 * a * a;
      d1 += dx - dy + b * b;
    }
  }

  let d2 = b * b * ((x + 0.5) * (x + 0.5)) + a * a * ((y - 1) * (y - 1)) - a * a * b * b;

  while (y >= 0) {
    plot(x, y);
    if (d2 > 0) {
      y--;
      dy -= 2 * a * a;
      d2 += a * a - dy;
    } else {
      y--;
      x++;
      dx += 2 * b * b;
      dy -= 2 * a * a;
      d2 += dx - dy + a * a;
    }
  }
}

export function drawEllipse(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  strokeWidth: number,
  color: string,
  fromCenter: boolean
): void {
  ctx.fillStyle = color;
  let cx: number;
  let cy: number;
  let a: number;
  let b: number;

  if (fromCenter) {
    cx = x0;
    cy = y0;
    a = Math.abs(x1 - x0);
    b = Math.abs(y1 - y0);
  } else {
    cx = Math.floor((x0 + x1) / 2);
    cy = Math.floor((y0 + y1) / 2);
    a = Math.floor(Math.abs(x1 - x0) / 2);
    b = Math.floor(Math.abs(y1 - y0) / 2);
  }

  centerEllipse(ctx, cx, cy, a, b, strokeWidth, false);
}

export function reflectRotate(
  canvasElement: HTMLCanvasElement,
  mode: string,
  _direction: string
): void {
  const width = canvasElement.width;
  const height = canvasElement.height;
  const ctx = canvasElement.getContext('2d');
  if (!ctx) return;

  const imageData = ctx.getImageData(0, 0, width, height);
  const src = imageData.data;
  const dst = new Uint8ClampedArray(src.length);

  if (mode === 'flipH') {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcIdx = (y * width + x) * 4;
        const dstIdx = (y * width + (width - 1 - x)) * 4;
        dst[dstIdx] = src[srcIdx];
        dst[dstIdx + 1] = src[srcIdx + 1];
        dst[dstIdx + 2] = src[srcIdx + 2];
        dst[dstIdx + 3] = src[srcIdx + 3];
      }
    }
    imageData.data.set(dst);
    ctx.putImageData(imageData, 0, 0);
  } else if (mode === 'flipV') {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcIdx = (y * width + x) * 4;
        const dstIdx = ((height - 1 - y) * width + x) * 4;
        dst[dstIdx] = src[srcIdx];
        dst[dstIdx + 1] = src[srcIdx + 1];
        dst[dstIdx + 2] = src[srcIdx + 2];
        dst[dstIdx + 3] = src[srcIdx + 3];
      }
    }
    imageData.data.set(dst);
    ctx.putImageData(imageData, 0, 0);
  } else if (mode === 'rotateCW') {
    const newCanvas = document.createElement('canvas');
    newCanvas.width = height;
    newCanvas.height = width;
    const newCtx = newCanvas.getContext('2d');
    if (!newCtx) return;
    newCtx.translate(height, 0);
    newCtx.rotate(Math.PI / 2);
    newCtx.drawImage(canvasElement, 0, 0);
    canvasElement.width = height;
    canvasElement.height = width;
    ctx.drawImage(newCanvas, 0, 0);
  } else if (mode === 'rotateCCW') {
    const newCanvas = document.createElement('canvas');
    newCanvas.width = height;
    newCanvas.height = width;
    const newCtx = newCanvas.getContext('2d');
    if (!newCtx) return;
    newCtx.translate(0, width);
    newCtx.rotate(-Math.PI / 2);
    newCtx.drawImage(canvasElement, 0, 0);
    canvasElement.width = height;
    canvasElement.height = width;
    ctx.drawImage(newCanvas, 0, 0);
  }
}

export function colorFill(
  canvasElement: HTMLCanvasElement,
  x: number,
  y: number,
  color: string
): void {
  const ctx = canvasElement.getContext('2d');
  if (!ctx) return;

  const temp = document.createElement('canvas');
  temp.width = 1;
  temp.height = 1;
  const tempCtx = temp.getContext('2d');
  if (!tempCtx) return;
  tempCtx.fillStyle = color;
  tempCtx.fillRect(0, 0, 1, 1);
  const d = tempCtx.getImageData(0, 0, 1, 1).data;

  const imageData = ctx.getImageData(0, 0, canvasElement.width, canvasElement.height);
  floodFill(imageData.data, x, y, { r: d[0], g: d[1], b: d[2], a: d[3] }, 0, canvasElement.width, canvasElement.height);
  ctx.putImageData(imageData, 0, 0);
}
