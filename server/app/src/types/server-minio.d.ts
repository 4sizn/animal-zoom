declare module "@animal-zoom/server-minio" {
	export interface MinioConnectionConfig {
		endpoint: string;
		port: number;
		useSSL: boolean;
		accessKey: string;
		secretKey: string;
		bucket: string;
	}

	export function loadMinioConfig(
		env?: Record<string, string | undefined>,
	): MinioConnectionConfig;
}
