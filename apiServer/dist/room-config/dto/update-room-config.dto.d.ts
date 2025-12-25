export declare enum LightingPreset {
    DEFAULT = "default",
    BRIGHT = "bright",
    DIM = "dim",
    WARM = "warm",
    COOL = "cool",
    DRAMATIC = "dramatic"
}
export declare class UpdateRoomConfigDto {
    lightingPreset?: LightingPreset;
    floorColor?: string;
    wallColor?: string;
    furniture?: string[];
    decorations?: string[];
}
export interface RoomConfig {
    lightingPreset: LightingPreset;
    floorColor: string | null;
    wallColor: string | null;
    furniture: string[];
    decorations: string[];
}
