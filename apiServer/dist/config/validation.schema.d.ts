declare enum Environment {
    Development = "development",
    Production = "production",
    Test = "test"
}
declare class EnvironmentVariables {
    NODE_ENV: Environment;
    PORT: number;
    API_PREFIX: string;
    DB_HOST: string;
    DB_PORT: number;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_DATABASE: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    GUEST_TOKEN_EXPIRES_IN: string;
    WS_PORT: number;
    RESOURCE_SERVER_URL?: string;
    S3_BUCKET?: string;
    S3_REGION?: string;
    S3_ACCESS_KEY_ID?: string;
    S3_SECRET_ACCESS_KEY?: string;
    MAX_PARTICIPANTS_PER_ROOM: number;
    ROOM_IDLE_TIMEOUT_MINUTES: number;
}
export declare function validate(config: Record<string, unknown>): EnvironmentVariables;
export {};
