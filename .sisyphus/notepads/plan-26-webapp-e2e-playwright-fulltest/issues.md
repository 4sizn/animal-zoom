# Issues

- Playwright browser in Docker cannot reach host-loopback origins in presigned URLs (`http://localhost:9000/...`), causing asset fetch failures unless a container-reachable origin is returned.
- Misconfigured public-origin env values must be treated as non-fatal; invalid values are ignored to avoid breaking presign responses.
- When spinning up ad-hoc server instances, ensure `DOTENV_CONFIG_PATH` points to the repo root `.env` (not a non-existent path). Missing DB env caused runtime crashes on auth/register calls, which then cascaded into client fetch + websocket errors.
