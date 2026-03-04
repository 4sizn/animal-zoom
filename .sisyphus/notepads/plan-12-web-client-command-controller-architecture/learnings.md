# Learnings

- Reference (`/Users/hsshin-rsupport/Downloads/rfice-game/src/shared/core`):
  - `core/abstract/AbstractController.ts`: base `name` contract.
  - `core/abstract/AbstractCommand.ts`: command bound to controller, `execute(methodName, payload)`.
  - `core/managers/CommandManager.ts`: singleton registry + typed command dispatch.
  - `core/controllers/system/SystemController.ts`: maps controllers to commands and manages init/destroy.
- Webapp candidates for commands: assets presign (`asset:` image src), auth/login/register flows, token storage.

- Implemented core pattern in `client/webapp/src/core/`:
  - Abstracts: `client/webapp/src/core/abstract/AbstractController.ts`, `client/webapp/src/core/abstract/AbstractCommand.ts`
  - Manager: `client/webapp/src/core/managers/CommandManager.ts` (singleton)
  - System mapping: `client/webapp/src/core/controllers/system/SystemController.ts` registers commands in manager
  - Controllers/commands:
    - `StorageController` + `StorageCommand`
    - `AssetsController` + `AssetsCommand` (wraps `network/assets` presign resolver)
- UI usage: `client/webapp/src/ui/AssetImage.tsx` resolves `asset:` via `CommandManager.command("AssetsCommand", "resolveImageSrc", { src })`.
