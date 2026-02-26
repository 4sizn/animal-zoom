export interface MinioConnectionConfig {
  endpoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  bucket: string;
}

type EnvMap = Record<string, string | undefined>;

export function loadMinioConfig(env: EnvMap = process.env as EnvMap): MinioConnectionConfig {
  return {
    endpoint: env.MINIO_ENDPOINT ?? "localhost",
    port: Number(env.MINIO_PORT ?? 9000),
    useSSL: (env.MINIO_USE_SSL ?? "false") === "true",
    accessKey: env.MINIO_ACCESS_KEY ?? "minioadmin",
    secretKey: env.MINIO_SECRET_KEY ?? "minioadmin",
    bucket: env.MINIO_BUCKET ?? "animal-zoom"
  };
}
