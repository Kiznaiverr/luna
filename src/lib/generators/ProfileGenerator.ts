import { EnkaAssetWrapper } from "lunassets";
import { Canvas, createCanvas } from "@napi-rs/canvas";
import { writeFileSync } from "fs";
import { PlayerAssets, ProfileGeneratorOptions, ProfileResult } from "../types";
import { AssetLoader } from "../utils/AssetLoader";
import { CanvasUtils } from "../utils/CanvasUtils";

export class ProfileGenerator {
  private assetLoader: AssetLoader;
  private enkaApi: EnkaAssetWrapper;

  private readonly CANVAS_WIDTH = 1200;
  private readonly CANVAS_HEIGHT = 657;

  /** Layout configuration for profile elements */
  private readonly LAYOUT = {
    leftPanel: { x: 0, y: 0, width: 574, height: 657 },
    banner: { x: 35, y: 9, width: 528, height: 201 },
    avatar: { x: 218, y: 98, width: 163, height: 163 },
    profilePictureSize: { width: 140, height: 140 },
    uid: { x: 219, y: 32 },
    playerName: { x: 299, y: 290 },
    level: { x: 522, y: 344 },
    worldLevel: { x: 522, y: 388 },
    signature: { x: 74, y: 450 },

    rightPanel: { x: 624, y: 0, width: 574, height: 644 },
    achievement: { x: 115, y: 170 },
    abyss: { x: 391, y: 170 },

    characterSlots: [
      { x: 3, y: 303 },
      { x: 142, y: 303 },
      { x: 281, y: 303 },
      { x: 420, y: 303 },
      { x: 3, y: 473 },
      { x: 142, y: 473 },
      { x: 281, y: 473 },
      { x: 420, y: 473 },
    ],
  };

  constructor() {
    this.assetLoader = AssetLoader.getInstance();
    this.enkaApi = new EnkaAssetWrapper();
    this.assetLoader.registerFonts();
  }

  /**
   * Generate profile image for player with specified UID
   * @param uid - Player UID (9-digit string)
   * @param options - Generation options
   * @returns Promise resolving to ProfileResult
   */
  public async generateProfile(
    uid: string,
    options: ProfileGeneratorOptions = {},
  ): Promise<ProfileResult> {
    try {
      const playerData = await this.enkaApi.getPlayerAssets(uid);
      const { canvas, ctx } = CanvasUtils.createCanvas(
        this.CANVAS_WIDTH,
        this.CANVAS_HEIGHT,
      );

      await this.drawBackground(ctx);
      await this.drawLeftPanel(ctx, playerData, options.hideUID || false);
      await this.drawRightPanel(ctx, playerData);

      const result = await this.generateResult(
        canvas,
        uid,
        playerData,
        options,
      );

      return result;
    } catch (error) {
      throw new Error(`Failed to generate profile for UID ${uid}: ${error}`);
    }
  }

  /** Draw main background image */
  private async drawBackground(ctx: any): Promise<void> {
    const background = await this.assetLoader.loadImage(
      this.assetLoader.getAssetPaths().profileBackground,
    );
    CanvasUtils.drawImage(
      ctx,
      background,
      0,
      0,
      this.CANVAS_WIDTH,
      this.CANVAS_HEIGHT,
    );
  }

  /** Draw left panel with player information */
  private async drawLeftPanel(
    ctx: any,
    playerData: PlayerAssets,
    hideUID: boolean,
  ): Promise<void> {
    const { playerInfo, profilePicture, nameCard } = playerData;

    // Namecard banner
    try {
      const banner = await this.assetLoader.loadImageFromUrl(nameCard.url);
      const bannerFrame = await this.assetLoader.loadImage(
        this.assetLoader.getAssetPaths().bannerFrame,
      );

      CanvasUtils.drawImage(
        ctx,
        banner,
        this.LAYOUT.banner.x,
        this.LAYOUT.banner.y,
        this.LAYOUT.banner.width,
        this.LAYOUT.banner.height,
      );
      CanvasUtils.drawImage(
        ctx,
        bannerFrame,
        this.LAYOUT.banner.x,
        this.LAYOUT.banner.y,
      );
    } catch (error) {
      console.warn("Failed to load namecard, using fallback");
    }

    // Profile picture with background and mask
    try {
      const avatarBackground = await this.assetLoader.loadImage(
        this.assetLoader.getAssetPaths().avatar,
      );
      const avatarMask = await this.assetLoader.loadImage(
        this.assetLoader.getAssetPaths().avatarMask,
      );
      const avatarImage = await this.assetLoader.loadImageFromUrl(
        profilePicture.url,
      );

      // Create temporary canvas for compositing
      const tempCanvas = createCanvas(
        this.LAYOUT.avatar.width,
        this.LAYOUT.avatar.height,
      );
      const tempCtx = tempCanvas.getContext("2d");

      // Center profile picture within avatar area
      const ppWidth = this.LAYOUT.profilePictureSize.width;
      const ppHeight = this.LAYOUT.profilePictureSize.height;
      const ppX = (this.LAYOUT.avatar.width - ppWidth) / 2;
      const ppY = (this.LAYOUT.avatar.height - ppHeight) / 2;

      tempCtx.drawImage(avatarImage, ppX, ppY, ppWidth, ppHeight);

      // Apply mask and background
      tempCtx.globalCompositeOperation = "destination-in";
      tempCtx.drawImage(
        avatarMask,
        0,
        0,
        this.LAYOUT.avatar.width,
        this.LAYOUT.avatar.height,
      );

      tempCtx.globalCompositeOperation = "destination-over";
      tempCtx.drawImage(
        avatarBackground,
        0,
        0,
        this.LAYOUT.avatar.width,
        this.LAYOUT.avatar.height,
      );

      tempCtx.globalCompositeOperation = "source-over";

      CanvasUtils.drawImage(
        ctx,
        tempCanvas,
        this.LAYOUT.avatar.x,
        this.LAYOUT.avatar.y,
      );
    } catch (error) {
      console.warn("Failed to load avatar assets, using fallback");
      // Fallback: direct draw
      try {
        const avatarImage = await this.assetLoader.loadImageFromUrl(
          profilePicture.url,
        );
        CanvasUtils.drawImage(
          ctx,
          avatarImage,
          this.LAYOUT.avatar.x,
          this.LAYOUT.avatar.y,
          this.LAYOUT.avatar.width,
          this.LAYOUT.avatar.height,
        );
      } catch (fallbackError) {
        console.warn("Failed to load profile picture");
      }
    }

    const uidText = hideUID
      ? `UID: ${this.generateRandomUID()}`
      : `UID ${playerData.playerInfo.uid}`;

    CanvasUtils.drawText(ctx, uidText, this.LAYOUT.uid.x, this.LAYOUT.uid.y, {
      fontSize: 19,
      color: "#FFFFFF",
    });

    CanvasUtils.drawText(
      ctx,
      playerInfo.nickname,
      this.LAYOUT.playerName.x,
      this.LAYOUT.playerName.y,
      {
        fontSize: 29,
        color: "#47516A",
        align: "center",
      },
    );

    CanvasUtils.drawText(ctx, `Adventure Rank`, 71, this.LAYOUT.level.y, {
      fontSize: 25,
      color: "#FFFFFF",
    });

    CanvasUtils.drawText(
      ctx,
      playerInfo.level.toString(),
      this.LAYOUT.level.x,
      this.LAYOUT.level.y,
      {
        fontSize: 25,
        color: "#FFFFFF",
        align: "right",
      },
    );

    CanvasUtils.drawText(ctx, `World Level`, 71, this.LAYOUT.worldLevel.y, {
      fontSize: 25,
      color: "#FFFFFF",
    });

    CanvasUtils.drawText(
      ctx,
      playerInfo.worldLevel.toString(),
      this.LAYOUT.worldLevel.x,
      this.LAYOUT.worldLevel.y,
      {
        fontSize: 25,
        color: "#FFFFFF",
        align: "right",
      },
    );

    // Player signature
    if (playerInfo.signature && playerInfo.signature.trim()) {
      CanvasUtils.drawText(
        ctx,
        playerInfo.signature,
        this.LAYOUT.signature.x,
        this.LAYOUT.signature.y,
        {
          fontSize: 20,
          color: "#7C7060",
          maxWidth: 450,
        },
      );
    }
  }

  /** Draw right panel with character showcase */
  private async drawRightPanel(
    ctx: any,
    playerData: PlayerAssets,
  ): Promise<void> {
    const { playerInfo, showAvatars } = playerData;

    CanvasUtils.drawText(ctx, "Main Page", 164 + this.LAYOUT.rightPanel.x, 53, {
      fontSize: 18,
      color: "#806244",
      align: "center",
    });

    CanvasUtils.drawText(ctx, "Namecard", 386 + this.LAYOUT.rightPanel.x, 53, {
      fontSize: 18,
      color: "#806244",
      align: "center",
    });

    CanvasUtils.drawText(
      ctx,
      "Achievements",
      115 + this.LAYOUT.rightPanel.x,
      144,
      {
        fontSize: 19,
        color: "#47516A",
      },
    );

    CanvasUtils.drawText(
      ctx,
      "Spiral Abyss",
      391 + this.LAYOUT.rightPanel.x,
      144,
      {
        fontSize: 19,
        color: "#47516A",
      },
    );

    CanvasUtils.drawText(
      ctx,
      (playerInfo.finishAchievementNum || 0).toString(),
      this.LAYOUT.achievement.x + this.LAYOUT.rightPanel.x,
      this.LAYOUT.achievement.y,
      {
        fontSize: 29,
        color: "#47516A",
      },
    );

    const abyssText = `${playerInfo.towerFloorIndex || 0}-${playerInfo.towerLevelIndex || 0}`;
    CanvasUtils.drawText(
      ctx,
      abyssText,
      this.LAYOUT.abyss.x + this.LAYOUT.rightPanel.x,
      this.LAYOUT.abyss.y,
      {
        fontSize: 29,
        color: "#47516A",
      },
    );

    CanvasUtils.drawText(
      ctx,
      "Character Showcase",
      43 + this.LAYOUT.rightPanel.x,
      235,
      {
        fontSize: 23,
        color: "#806244",
      },
    );

    await this.drawCharacterShowcase(ctx, showAvatars.slice(0, 8));
  }

  /** Draw character showcase grid */
  private async drawCharacterShowcase(
    ctx: any,
    characters: any[],
  ): Promise<void> {
    for (let i = 0; i < Math.min(characters.length, 8); i++) {
      const character = characters[i];
      const position = this.LAYOUT.characterSlots[i];
      const x = position.x + this.LAYOUT.rightPanel.x;
      const y = position.y;

      try {
        const charImage = await this.assetLoader.loadImageFromUrl(
          character.url,
        );
        const charBackground = await this.assetLoader.loadImage(
          this.assetLoader.getAssetPaths().charterBackground,
        );
        const qualityBg =
          character.quality === 5
            ? await this.assetLoader.loadImage(
                this.assetLoader.getAssetPaths().charter5Star,
              )
            : await this.assetLoader.loadImage(
                this.assetLoader.getAssetPaths().charter4Star,
              );

        CanvasUtils.drawImage(ctx, charBackground, x, y);
        CanvasUtils.drawImage(ctx, qualityBg, x + 5, y);
        CanvasUtils.drawImage(ctx, charImage, x + 2, y + 5, 115, 115);

        if (character.element) {
          const elementIcon = await this.assetLoader.getElementIcon(
            character.element,
          );
          CanvasUtils.drawImage(ctx, elementIcon, x + 7, y + 4, 30, 30);
        }

        CanvasUtils.drawText(ctx, `Lv. ${character.level}`, x + 63, y + 134, {
          fontSize: 17,
          color: "#4E5367",
          align: "center",
        });
      } catch (error) {
        console.warn(`Failed to load character ${character.avatarId}:`, error);
      }
    }
  }

  /** Generate random UID for privacy feature */
  private generateRandomUID(): string {
    return Math.floor(100000000 + Math.random() * 900000000).toString();
  }

  /** Generate final result based on output options */
  private async generateResult(
    canvas: Canvas,
    uid: string,
    playerData: PlayerAssets,
    options: ProfileGeneratorOptions,
  ): Promise<ProfileResult> {
    const result: ProfileResult = {
      metadata: {
        uid,
        playerName: playerData.playerInfo.nickname,
        generatedAt: new Date(),
        dimensions: { width: this.CANVAS_WIDTH, height: this.CANVAS_HEIGHT },
      },
    };

    const { outputFormat = "buffer", outputPath } = options;

    switch (outputFormat) {
      case "buffer":
        result.buffer = CanvasUtils.toBuffer(canvas, "png");
        break;

      case "base64":
        result.base64 = CanvasUtils.toBase64(canvas, "png");
        break;

      case "path":
        if (!outputPath) {
          throw new Error(
            'Output path is required when outputFormat is "path"',
          );
        }
        const buffer = CanvasUtils.toBuffer(canvas, "png");
        writeFileSync(outputPath, buffer);
        result.path = outputPath;
        break;
    }

    return result;
  }
}
