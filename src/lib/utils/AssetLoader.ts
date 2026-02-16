import {
  createCanvas,
  loadImage,
  Canvas,
  Image,
  GlobalFonts,
} from "@napi-rs/canvas";
import { join } from "path";
import { AssetPaths, ElementType } from "../types";

export class AssetLoader {
  private static instance: AssetLoader;
  private assetPaths: AssetPaths;
  private loadedImages: Map<string, Image> = new Map();
  private fontRegistered = false;

  private constructor() {
    const assetsRoot = join(__dirname, "../../../src/assets");

    this.assetPaths = {
      profileBackground: join(assetsRoot, "profile/main_profile_bg.png"),
      avatar: join(assetsRoot, "profile/avatar.png"),
      avatarMask: join(assetsRoot, "profile/avatar_mask.png"),
      bannerFrame: join(assetsRoot, "profile/banner_frame.png"),
      charter4Star: join(assetsRoot, "profile/character_4.png"),
      charter5Star: join(assetsRoot, "profile/character_5.png"),
      charterBackground: join(assetsRoot, "profile/character_bg.png"),
      charterMask: join(assetsRoot, "profile/character_mask.png"),
      elementIcons: {
        Fire: join(assetsRoot, "element/pyro.png"),
        Water: join(assetsRoot, "element/hydro.png"),
        Grass: join(assetsRoot, "element/dendro.png"),
        Electric: join(assetsRoot, "element/electro.png"),
        Wind: join(assetsRoot, "element/anemo.png"),
        Rock: join(assetsRoot, "element/geo.png"),
        Ice: join(assetsRoot, "element/cryo.png"),
      },
      font: join(assetsRoot, "font/Genshin_Impact_subsetted.ttf"),
    };
  }

  public static getInstance(): AssetLoader {
    if (!AssetLoader.instance) {
      AssetLoader.instance = new AssetLoader();
    }
    return AssetLoader.instance;
  }

  public registerFonts(): void {
    if (!this.fontRegistered) {
      try {
        GlobalFonts.registerFromPath(this.assetPaths.font, "Genshin Impact");
        this.fontRegistered = true;
        console.log("Font Genshin Impact registered successfully");
      } catch (error) {
        console.warn("Failed to register font:", error);
        this.fontRegistered = false;
      }
    }
  }

  public async loadImage(path: string): Promise<Image> {
    if (this.loadedImages.has(path)) {
      return this.loadedImages.get(path)!;
    }

    try {
      const image = await loadImage(path);
      this.loadedImages.set(path, image);
      return image;
    } catch (error) {
      throw new Error(`Failed to load image: ${path}. ${error}`);
    }
  }

  public async loadImageFromUrl(
    url: string,
    fallbackPath?: string,
  ): Promise<Image> {
    try {
      return await loadImage(url);
    } catch (error) {
      if (fallbackPath) {
        console.warn(
          `Failed to load image from URL: ${url}. Using fallback: ${fallbackPath}`,
        );
        return await this.loadImage(fallbackPath);
      }
      throw new Error(`Failed to load image from URL: ${url}. ${error}`);
    }
  }

  // Get element icon
  public async getElementIcon(element: string): Promise<Image> {
    const elementKey = this.mapElementName(element) as ElementType;
    const iconPath = this.assetPaths.elementIcons[elementKey];
    return await this.loadImage(iconPath);
  }

  // Map element names
  private mapElementName(element: string): ElementType {
    const mapping: Record<string, ElementType> = {
      Fire: "Fire",
      Pyro: "Fire",
      Water: "Water",
      Hydro: "Water",
      Grass: "Grass",
      Dendro: "Grass",
      Electric: "Electric",
      Electro: "Electric",
      Wind: "Wind",
      Anemo: "Wind",
      Rock: "Rock",
      Geo: "Rock",
      Ice: "Ice",
      Cryo: "Ice",
    };
    return mapping[element] || "Wind";
  }

  public getAssetPaths(): AssetPaths {
    return { ...this.assetPaths };
  }

  public clearCache(): void {
    this.loadedImages.clear();
  }

  // Helper: Resize image with optional aspect ratio preservation
  public async resizeImage(
    image: Image,
    width: number,
    height: number,
  ): Promise<Canvas> {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, width, height);
    return canvas;
  }

  // Helper: Apply circular mask to image
  public async applyCircularMask(image: Image, size: number): Promise<Canvas> {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext("2d");

    // Create circular clipping path
    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    // Draw image
    ctx.drawImage(image, 0, 0, size, size);
    ctx.restore();

    return canvas;
  }
}
