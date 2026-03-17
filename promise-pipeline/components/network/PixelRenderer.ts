/**
 * PixelRenderer — Shared utility for pixel art canvas rendering.
 *
 * Manages canvas setup, pixel-level drawing, tile patterns, and gradients.
 * All three views (Canopy, Watershed, Strata) use this renderer.
 *
 * The canvas renders at pixel resolution (32×32 or 64×64 per node tile),
 * then scales up with CSS `image-rendering: pixelated`.
 */

import { createSeededRandom } from "@/lib/rendering/pixel-prng";

export interface PixelRendererConfig {
  canvas: HTMLCanvasElement;
  resolution: 32 | 64;
  width: number;   // canvas display width in CSS pixels
  height: number;  // canvas display height in CSS pixels
  pixelScale: number; // computed: how many display pixels per pixel-art pixel
}

export class PixelRenderer {
  public ctx: CanvasRenderingContext2D;
  public config: PixelRendererConfig;
  /** Pixel-art width (number of art pixels across). */
  public pw: number;
  /** Pixel-art height (number of art pixels tall). */
  public ph: number;
  /** Size of one pixel-art pixel in display units. */
  public ps: number;

  constructor(canvas: HTMLCanvasElement, resolution: 32 | 64, width: number, height: number) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get 2d context");
    this.ctx = ctx;

    // Compute pixel scale: how many CSS pixels per art pixel
    // We target a reasonable pixel density based on resolution.
    // For 32px mode: ~4px per art pixel. For 64px mode: ~2px per art pixel.
    const baseScale = resolution === 32 ? 4 : 2;
    this.ps = baseScale;

    // Art dimensions
    this.pw = Math.ceil(width / baseScale);
    this.ph = Math.ceil(height / baseScale);

    // Set canvas internal resolution to art resolution
    canvas.width = this.pw;
    canvas.height = this.ph;

    // CSS display size
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.style.imageRendering = "pixelated";

    // Disable anti-aliasing
    ctx.imageSmoothingEnabled = false;

    this.config = {
      canvas,
      resolution,
      width,
      height,
      pixelScale: baseScale,
    };
  }

  /** Draw a single pixel at art coordinates. */
  pixel(x: number, y: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
  }

  /** Draw a filled rectangle of pixels. */
  rect(x: number, y: number, w: number, h: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(w), Math.ceil(h));
  }

  /** Draw a 1px outline rectangle. */
  outline(x: number, y: number, w: number, h: number, color: string): void {
    const fx = Math.floor(x);
    const fy = Math.floor(y);
    const fw = Math.ceil(w);
    const fh = Math.ceil(h);
    this.ctx.fillStyle = color;
    // Top
    this.ctx.fillRect(fx, fy, fw, 1);
    // Bottom
    this.ctx.fillRect(fx, fy + fh - 1, fw, 1);
    // Left
    this.ctx.fillRect(fx, fy + 1, 1, fh - 2);
    // Right
    this.ctx.fillRect(fx + fw - 1, fy + 1, 1, fh - 2);
  }

  /** Fill a region with a tiled pattern (2D array of color strings). */
  tile(x: number, y: number, w: number, h: number, pattern: string[][]): void {
    const ph = pattern.length;
    if (ph === 0) return;
    const pw = pattern[0].length;
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const color = pattern[dy % ph][dx % pw];
        if (color) {
          this.pixel(x + dx, y + dy, color);
        }
      }
    }
  }

  /** Draw a vertical gradient between two hex colors, pixel by pixel. */
  gradient(x: number, y: number, w: number, h: number, topColor: string, bottomColor: string): void {
    const top = hexToRgb(topColor);
    const bot = hexToRgb(bottomColor);
    for (let dy = 0; dy < h; dy++) {
      const t = h <= 1 ? 0 : dy / (h - 1);
      const r = Math.round(top.r + (bot.r - top.r) * t);
      const g = Math.round(top.g + (bot.g - top.g) * t);
      const b = Math.round(top.b + (bot.b - top.b) * t);
      const color = `rgb(${r},${g},${b})`;
      this.ctx.fillStyle = color;
      this.ctx.fillRect(Math.floor(x), Math.floor(y + dy), Math.ceil(w), 1);
    }
  }

  /** Clear the entire canvas. */
  clear(): void {
    this.ctx.clearRect(0, 0, this.pw, this.ph);
  }

  /** Get a seeded RNG for a given promise/element. */
  rng(seed: string): () => number {
    return createSeededRandom(seed);
  }

  /** Convert display coordinates to art pixel coordinates. */
  toPixel(displayX: number, displayY: number): { x: number; y: number } {
    return {
      x: Math.floor(displayX / this.ps),
      y: Math.floor(displayY / this.ps),
    };
  }

  /** Convert art pixel coordinates to display coordinates. */
  toDisplay(artX: number, artY: number): { x: number; y: number } {
    return {
      x: artX * this.ps,
      y: artY * this.ps,
    };
  }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}
