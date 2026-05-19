import { describe, it, expect } from 'vitest';
import { Color } from '../utils/colors';

describe('Color', () => {
  it('setRGBA sets color values', () => {
    const c = new Color();
    c.setRGBA(255, 0, 0, 1);
    expect(c.r).toBeCloseTo(1);
    expect(c.g).toBeCloseTo(0);
    expect(c.b).toBeCloseTo(0);
    expect(c.a).toBe(1);
  });

  it('setHex parses hex string', () => {
    const c = new Color();
    c.setHex('#ff0000');
    expect(c.r).toBeCloseTo(1);
    expect(c.g).toBeCloseTo(0);
    expect(c.b).toBeCloseTo(0);
  });

  it('setHex parses shorthand hex', () => {
    const c = new Color();
    c.setHex('#f00');
    expect(c.r).toBeCloseTo(1);
    expect(c.g).toBeCloseTo(0);
    expect(c.b).toBeCloseTo(0);
  });

  it('getHex returns hex string', () => {
    const c = new Color();
    c.setRGBA(255, 128, 0, 1);
    expect(c.getHex()).toBe('#ff8000');
  });

  it('getRGBA returns 0-255 values', () => {
    const c = new Color();
    c.setRGBA(100, 150, 200, 0.5);
    const rgba = c.getRGBA();
    expect(rgba.r).toBe(100);
    expect(rgba.g).toBe(150);
    expect(rgba.b).toBe(200);
    expect(rgba.a).toBe(0.5);
  });

  it('getHSLA returns HSL values', () => {
    const c = new Color();
    c.setRGBA(255, 0, 0, 1);
    const hsla = c.getHSLA();
    expect(hsla.h).toBeCloseTo(0);
    expect(hsla.s).toBeCloseTo(1);
    expect(hsla.l).toBeCloseTo(0.5);
    expect(hsla.a).toBe(1);
  });

  it('setHSL and get back RGB', () => {
    const c = new Color();
    c.setHSL(0, 1, 0.5);
    expect(c.r).toBeCloseTo(1);
    expect(c.g).toBeCloseTo(0);
    expect(c.b).toBeCloseTo(0);
  });

  it('RGBtoHSL converts correctly', () => {
    const c = new Color();
    c.r = 1; c.g = 0; c.b = 0;
    c.RGBtoHSL();
    expect(c.h).toBeCloseTo(0);
    expect(c.s).toBeCloseTo(1);
    expect(c.l).toBeCloseTo(0.5);
  });

  it('HSLtoRGB converts correctly', () => {
    const c = new Color();
    c.h = 0; c.s = 1; c.l = 0.5;
    c.HSLtoRGB();
    expect(c.r).toBeCloseTo(1);
    expect(c.g).toBeCloseTo(0);
    expect(c.b).toBeCloseTo(0);
  });

  it('round-trip RGB to HSL to RGB', () => {
    const c = new Color();
    c.setRGBA(120, 80, 200, 1);
    const r = c.r;
    const g = c.g;
    const b = c.b;
    c.RGBtoHSL();
    c.HSLtoRGB();
    expect(c.r).toBeCloseTo(r, 5);
    expect(c.g).toBeCloseTo(g, 5);
    expect(c.b).toBeCloseTo(b, 5);
  });
});
