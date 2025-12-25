import { Generated, Insertable, Selectable, Updateable } from 'kysely';
export type UserType = 'registered' | 'guest';
export interface UsersTable {
    id: Generated<string>;
    type: UserType;
    username: string | null;
    email: string | null;
    password: string | null;
    displayName: string | null;
    avatarCustomization: {
        modelUrl?: string;
        colors?: {
            primary?: string;
            secondary?: string;
        };
        accessories?: string[];
    } | null;
    createdAt: Generated<Date>;
    updatedAt: Date;
}
export type User = Selectable<UsersTable>;
export type NewUser = Insertable<UsersTable>;
export type UserUpdate = Updateable<UsersTable>;
