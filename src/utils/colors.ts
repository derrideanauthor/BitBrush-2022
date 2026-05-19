export class Color {
  r: number;
  g: number;
  b: number;
  a: number;
  h: number;
  s: number;
  l: number;
  v: number;
  hex: string;
  mode: string;

  constructor() {
    this.r = 0;
    this.g = 0;
    this.b = 0;
    this.a = 1;
    this.h = 0;
    this.s = 0;
    this.l = 0;
    this.v = 0;
    this.hex = '#000000';
    this.mode = 'rgba';
  }

  RGBtoHSL(): void {
    const r = this.r;
    const g = this.g;
    const b = this.b;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    this.h = h;
    this.s = s;
    this.l = l;
  }

  HSLtoRGB(): void {
    const h = this.h;
    const s = this.s;
    const l = this.l;

    if (s === 0) {
      this.r = l;
      this.g = l;
      this.b = l;
      return;
    }

    const hue2rgb = (p: number, q: number, t: number): number => {
      let tt = t;
      if (tt < 0) tt += 1;
      if (tt > 1) tt -= 1;
      if (tt < 1 / 6) return p + (q - p) * 6 * tt;
      if (tt < 1 / 2) return q;
      if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    this.r = hue2rgb(p, q, h + 1 / 3);
    this.g = hue2rgb(p, q, h);
    this.b = hue2rgb(p, q, h - 1 / 3);
  }

  RGBtoHSV(): void {
    const r = this.r;
    const g = this.g;
    const b = this.b;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    const s = max === 0 ? 0 : d / max;
    const v = max;

    if (max !== min) {
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    this.h = h;
    this.s = s;
    this.v = v;
  }

  HSVtoRGB(): void {
    const h = this.h;
    const s = this.s;
    const v = this.v;
    let r = 0;
    let g = 0;
    let b = 0;

    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    switch (i % 6) {
      case 0:
        r = v; g = t; b = p;
        break;
      case 1:
        r = q; g = v; b = p;
        break;
      case 2:
        r = p; g = v; b = t;
        break;
      case 3:
        r = p; g = q; b = v;
        break;
      case 4:
        r = t; g = p; b = v;
        break;
      case 5:
        r = v; g = p; b = q;
        break;
    }

    this.r = r;
    this.g = g;
    this.b = b;
  }

  toRGB(r: number, g: number, b: number): void {
    this.r = r / 255;
    this.g = g / 255;
    this.b = b / 255;
  }

  setRGBA(r: number, g: number, b: number, a: number): void {
    this.r = r / 255;
    this.g = g / 255;
    this.b = b / 255;
    this.a = a;
    this.RGBtoHSL();
    this.RGBtoHSV();
    this.hex = this.getHex();
  }

  setHSL(h: number, s: number, l: number): void {
    this.h = h;
    this.s = s;
    this.l = l;
    this.HSLtoRGB();
    this.RGBtoHSV();
    this.hex = this.getHex();
  }

  setHex(value: string): void {
    let hex = value.replace('#', '');
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    this.r = r / 255;
    this.g = g / 255;
    this.b = b / 255;
    this.hex = '#' + hex.toLowerCase();
    this.RGBtoHSL();
    this.RGBtoHSV();
  }

  getHex(): string {
    const r = Math.round(this.r * 255).toString(16).padStart(2, '0');
    const g = Math.round(this.g * 255).toString(16).padStart(2, '0');
    const b = Math.round(this.b * 255).toString(16).padStart(2, '0');
    return '#' + r + g + b;
  }

  getRGBA(): { r: number; g: number; b: number; a: number } {
    return {
      r: Math.round(this.r * 255),
      g: Math.round(this.g * 255),
      b: Math.round(this.b * 255),
      a: this.a,
    };
  }

  getHSLA(): { h: number; s: number; l: number; a: number } {
    return {
      h: this.h,
      s: this.s,
      l: this.l,
      a: this.a,
    };
  }
}
