// Types untuk player data dari lunassets
export interface PlayerInfo {
  uid: string;
  nickname: string;
  level: number;
  signature?: string; // Made optional since it can be undefined
  worldLevel: number;
  finishAchievementNum?: number; 
  towerFloorIndex?: number; 
  towerLevelIndex?: number; 
  theaterActIndex?: number;
  theaterModeIndex?: number;
  theaterStarIndex?: number;
  isShowAvatarTalent?: boolean;
  fetterCount?: number; 
  towerStarIndex?: number; 
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
  talentLevel?: number; 
  element?: string;
  weaponType?: string; 
}

// Input data from lunassets
export interface PlayerAssets {
  playerInfo: PlayerInfo;
  profilePicture: ProfilePicture;
  nameCard: NameCard;
  showAvatars: ShowAvatar[];
  ttl?: number; 
  lastUpdated: string | Date; // Allow both string and Date for flexibility
}

// Configuration options for profile generation
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
