import {
	loadMinioConfig,
	type MinioConnectionConfig,
} from "@animal-zoom/server-minio";

export function getMinioConfig(): MinioConnectionConfig {
	return loadMinioConfig();
}
