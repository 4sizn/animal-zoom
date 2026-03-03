# Issues

- `task(subagent_type="explore"|"librarian")` often returns timeouts/errors in this environment; discovery work uses direct `Glob`/`Grep`/`Read` as fallback.

- Local verification blocker: Docker daemon is not running/accessible here (`Cannot connect to the Docker daemon at unix:///Users/hsshin-rsupport/.docker/run/docker.sock`). `docker compose up` cannot be executed in this environment.

- Because Docker is blocked here, Plan item #15 (webapp presign manual QA with MinIO running) cannot be performed in this environment.
