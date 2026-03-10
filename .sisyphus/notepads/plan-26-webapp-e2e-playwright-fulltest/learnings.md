# Learnings

- `minioClient.presignedGetObject()` builds URLs from the MinIO client endpoint (`MINIO_ENDPOINT`/`MINIO_PORT`), so host-local config like `localhost:9000` leaks into API responses unless explicitly rewritten for container consumers.
- A safe compatibility pattern is to rewrite only the presigned URL origin via `ASSET_PRESIGN_PUBLIC_ORIGIN` while leaving path/query/signature intact.
- WebSocket console failures are often secondary: if the API server is down/crashed (or token invalid), Socket.IO connect attempts can surface as browser-level WebSocket errors. With a healthy server + fresh token, `/zoom` connects cleanly.
