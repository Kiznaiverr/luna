import { createCanvas, Canvas, Image } from "@napi-rs/canvas";
import { CanvasContext } from "../types";

export class CanvasUtils {
  public static createCanvas(width: number, height: number): CanvasContext {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");
    return { canvas, ctx };
  }

  public static drawText(
    ctx: any,
    text: string,
    x: number,
    y: number,
    options: {
      font?: string;
      fontSize?: number;
      color?: string;
      align?: "left" | "center" | "right";
      maxWidth?: number;
    } = {},
  ): void {
    const {
      font = "Genshin Impact",
      fontSize = 20,
      color = "#FFFFFF",
      align = "left",
      maxWidth,
    } = options;

    ctx.save();
    ctx.font = `${fontSize}px "${font}"`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = "middle";

    if (maxWidth) {
      ctx.fillText(text, x, y, maxWidth);
    } else {
      ctx.fillText(text, x, y);
    }

    ctx.restore();
  }

  public static getTextWidth(
    ctx: any,
    text: string,
    fontSize: number = 20,
    font: string = "Genshin Impact",
  ): number {
    ctx.save();
    ctx.font = `${fontSize}px "${font}"`;
    const width = ctx.measureText(text).width;
    ctx.restore();
    return width;
  }

  public static drawImage(
    ctx: any,
    image: Image | Canvas,
    x: number,
    y: number,
    width?: number,
    height?: number,
  ): void {
    if (width && height) {
      ctx.drawImage(image, x, y, width, height);
    } else {
      ctx.drawImage(image, x, y);
    }
  }

  public static applyMask(
    ctx: any,
    maskImage: Image,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    ctx.save();
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(maskImage, x, y, width, height);
    ctx.globalCompositeOperation = "source-over";
    ctx.restore();
  }

  public static createGradient(
    ctx: any,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    colors: string[],
  ): any {
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    colors.forEach((color, index) => {
      gradient.addColorStop(index / (colors.length - 1), color);
    });
    return gradient;
  }

  public static drawRoundedRect(
    ctx: any,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    fillColor?: string,
    strokeColor?: string,
    strokeWidth?: number,
  ): void {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);

    if (fillColor) {
      ctx.fillStyle = fillColor;
      ctx.fill();
    }

    if (strokeColor && strokeWidth) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
    }

    ctx.restore();
  }

  // Composite two canvases
  public static composite(
    baseCanvas: Canvas,
    overlayCanvas: Canvas,
    x: number,
    y: number,
    operation: string = "source-over",
  ): Canvas {
    const ctx = baseCanvas.getContext("2d");
    ctx.save();
    ctx.globalCompositeOperation = operation as any;
    ctx.drawImage(overlayCanvas as any, x, y);
    ctx.restore();
    return baseCanvas;
  }

  // Convert canvas to buffer
  public static toBuffer(
    canvas: Canvas,
    format: "png" | "jpeg" = "png",
    quality?: number,
  ): Buffer {
    if (format === "jpeg" && quality) {
      return canvas.toBuffer("image/jpeg", quality);
    }
    return canvas.toBuffer(`image/${format}` as any);
  }

  // Convert canvas to base64
  public static toBase64(
    canvas: Canvas,
    format: "png" | "jpeg" = "png",
    quality?: number,
  ): string {
    const buffer = this.toBuffer(canvas, format, quality);
    return buffer.toString("base64");
  }

  // Helper: Add shadow effect
  public static addShadow(
    ctx: any,
    options: {
      color?: string;
      blur?: number;
      offsetX?: number;
      offsetY?: number;
    } = {},
  ): void {
    const { color = "#000000", blur = 5, offsetX = 2, offsetY = 2 } = options;

    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    ctx.shadowOffsetX = offsetX;
    ctx.shadowOffsetY = offsetY;
  }

  // Reset shadow
  public static resetShadow(ctx: any): void {
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }
}
