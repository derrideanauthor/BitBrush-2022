export interface FillColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

function pixelCompare(
  data: Uint8ClampedArray,
  idx: number,
  target: FillColor,
  tolerance: number
): boolean {
  return (
    Math.abs(data[idx] - target.r) <= tolerance &&
    Math.abs(data[idx + 1] - target.g) <= tolerance &&
    Math.abs(data[idx + 2] - target.b) <= tolerance &&
    Math.abs(data[idx + 3] - target.a) <= tolerance
  );
}

function pixelCompareAndSet(
  data: Uint8ClampedArray,
  idx: number,
  target: FillColor,
  fill: FillColor,
  tolerance: number
): boolean {
  if (pixelCompare(data, idx, target, tolerance)) {
    data[idx] = fill.r;
    data[idx + 1] = fill.g;
    data[idx + 2] = fill.b;
    data[idx + 3] = fill.a;
    return true;
  }
  return false;
}

export function floodFill(
  data: Uint8ClampedArray,
  x: number,
  y: number,
  fillColor: FillColor,
  tolerance: number,
  width: number,
  height: number
): Uint8ClampedArray {
  const idx = (y * width + x) * 4;
  const target: FillColor = {
    r: data[idx],
    g: data[idx + 1],
    b: data[idx + 2],
    a: data[idx + 3],
  };

  if (
    target.r === fillColor.r &&
    target.g === fillColor.g &&
    target.b === fillColor.b &&
    target.a === fillColor.a
  ) {
    return data;
  }

  const stack: number[] = [x + y * width];
  const visited = new Uint8Array(width * height);

  while (stack.length > 0) {
    const pos = stack.pop()!;
    const px = pos % width;
    const py = Math.floor(pos / width);

    if (px < 0 || px >= width || py < 0 || py >= height) continue;
    if (visited[pos]) continue;

    const dataIdx = pos * 4;
    if (!pixelCompare(data, dataIdx, target, tolerance)) continue;

    visited[pos] = 1;
    pixelCompareAndSet(data, dataIdx, target, fillColor, tolerance);

    stack.push(pos + 1);
    stack.push(pos - 1);
    stack.push(pos + width);
    stack.push(pos - width);
  }

  return data;
}

export function fillContext(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  fillColor: FillColor,
  tolerance: number,
  width: number,
  height: number
): void {
  const imageData = ctx.getImageData(0, 0, width, height);
  floodFill(imageData.data, x, y, fillColor, tolerance, width, height);
  ctx.putImageData(imageData, 0, 0);
}
