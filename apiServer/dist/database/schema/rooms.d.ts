import { Generated, Insertable, Selectable, Updateable } from 'kysely';
export type RoomStatus = 'active' | 'inactive';
export interface RoomsTable {
    id: Generated<string>;
    code: string;
    name: string | null;
    status: RoomStatus;
    currentParticipants: number;
    maxParticipants: number;
    customization: {
        environment?: {
            furniture?: any[];
            decorations?: any[];
            wallMaterial?: {
                color?: string;
                texture?: string;
            };
            floorMaterial?: {
                color?: string;
                texture?: string;
            };
        };
        lighting?: {
            preset?: string;
            customLights?: any[];
        };
    } | null;
    lastActivityAt: Date | null;
    createdAt: Generated<Date>;
    updatedAt: Date;
}
export type Room = Selectable<RoomsTable>;
export type NewRoom = Insertable<RoomsTable>;
export type RoomUpdate = Updateable<RoomsTable>;
