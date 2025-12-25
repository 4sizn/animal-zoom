export interface DatabaseConfig {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
}
declare const _default: (() => DatabaseConfig) & import("@nestjs/config").ConfigFactoryKeyHost<DatabaseConfig>;
export default _default;
