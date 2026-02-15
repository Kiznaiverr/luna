// Types untuk player data dari lunassets
export interface PlayerInfo {
  uid: string;
  nickname: string;
  level: number;
  signature?: string; // Made optional since it can be undefined
  worldLevel: number;
  finishAchievementNum?: number; // Made optional
  towerFloorIndex?: number; // Made optional
  towerLevelIndex?: number; // Made optional
  theaterActIndex?: number;
  theaterModeIndex?: number;
  theaterStarIndex?: number;
  isShowAvatarTalent?: boolean;
  fetterCount?: number; // Made optional
  towerStarIndex?: number; // Made optional
  stygianIndex?: number;
  stygianSeconds?: number;
  stygianId?: number;
}

export interface ProfilePicture {
  id: number;
  iconName: string;
  url: string;
}

export interface NameCard {
  id: number;
  iconName: string;
  url: string;
}

export interface ShowAvatar {
  avatarId: number;
  iconName: string;
  url: string;
  quality: number;
  level: number;
  talentLevel?: number; // Made optional
  element?: string; // Made optional
  weaponType?: string; // Made optional
}

// Input data dari lunassets
export interface PlayerAssets {
  playerInfo: PlayerInfo;
  profilePicture: ProfilePicture;
  nameCard: NameCard;
  showAvatars: ShowAvatar[];
  ttl?: number; // Made optional
  lastUpdated: string | Date; // Allow both string and Date
}

// Configuration untuk generator
export interface ProfileGeneratorOptions {
  hideUID?: boolean;
  customFontPath?: string;
  outputFormat?: "buffer" | "base64" | "path";
  outputPath?: string;
  quality?: number;
}

// Element mapping
export type ElementType =
  | "Fire"
  | "Water"
  | "Grass"
  | "Electric"
  | "Wind"
  | "Rock"
  | "Ice";

// Asset paths
export interface AssetPaths {
  profileBackground: string;
  avatar: string;
  avatarMask: string;
  bannerFrame: string;
  charter4Star: string;
  charter5Star: string;
  charterBackground: string;
  charterMask: string;
  elementIcons: Record<ElementType, string>;
  font: string;
}

// Canvas rendering context
export interface CanvasContext {
  canvas: any; // Canvas from @napi-rs/canvas
  ctx: any; // CanvasRenderingContext2D
}

// Generated profile result
export interface ProfileResult {
  buffer?: Buffer;
  base64?: string;
  path?: string;
  metadata: {
    uid: string;
    playerName: string;
    generatedAt: Date;
    dimensions: { width: number; height: number };
  };
}
