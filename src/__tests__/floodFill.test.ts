import { describe, it, expect } from 'vitest';
import { floodFill } from '../utils/floodFill';

function makeImageData(width: number, height: number, fill: number[] = [255, 255, 255, 255]): Uint8ClampedArray {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    data[i * 4] = fill[0];
    data[i * 4 + 1] = fill[1];
    data[i * 4 + 2] = fill[2];
    data[i * 4 + 3] = fill[3];
  }
  return data;
}

describe('floodFill', () => {
  it('fills entire canvas when all pixels match', () => {
    const width = 4;
    const height = 4;
    const data = makeImageData(width, height, [255, 255, 255, 255]);
    floodFill(data, 0, 0, { r: 255, g: 0, b: 0, a: 255 }, 0, width, height);
    expect(data[0]).toBe(255);
    expect(data[1]).toBe(0);
    expect(data[2]).toBe(0);
    expect(data[3]).toBe(255);
    const lastIdx = (width * height - 1) * 4;
    expect(data[lastIdx]).toBe(255);
    expect(data[lastIdx + 1]).toBe(0);
  });

  it('does not fill when fill color matches target', () => {
    const width = 2;
    const height = 2;
    const data = makeImageData(width, height, [255, 0, 0, 255]);
    floodFill(data, 0, 0, { r: 255, g: 0, b: 0, a: 255 }, 0, width, height);
    expect(data[0]).toBe(255);
    expect(data[1]).toBe(0);
  });

  it('fills only connected region', () => {
    const width = 4;
    const height = 1;
    const data = new Uint8ClampedArray(width * 4);
    data[0] = 255; data[1] = 255; data[2] = 255; data[3] = 255;
    data[4] = 255; data[5] = 255; data[6] = 255; data[7] = 255;
    data[8] = 0;   data[9] = 0;   data[10] = 0; data[11] = 255;
    data[12] = 255; data[13] = 255; data[14] = 255; data[15] = 255;

    floodFill(data, 0, 0, { r: 255, g: 0, b: 0, a: 255 }, 0, width, height);
    expect(data[0]).toBe(255); expect(data[1]).toBe(0);
    expect(data[4]).toBe(255); expect(data[5]).toBe(0);
    expect(data[8]).toBe(0);
    expect(data[12]).toBe(255); expect(data[13]).toBe(255);
  });
});
