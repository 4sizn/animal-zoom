# Learnings

- Reference pattern (`/Users/hsshin-rsupport/Downloads/rfice-game/src/shared`):
  - Public entrypoint uses barrel exports: `src/shared/index.ts` re-exports `lib`, `types`, `config`, `api`, `ui`.
  - `api/` and `config/` are placeholders (currently empty exports), but the real layering shows up under `core/`.
  - `core/` introduces explicit system/network abstractions:
    - controllers: `SessionStorageController.ts` (typed sessionStorage), `WindowMessageController.ts` (postMessage + RxJS), `StompNetworkClientController.ts` (network client + env-driven brokerURL), `system/SystemController.ts` (controller<->command mapping + lifecycle)
    - abstract base classes for controllers/commands and manager singletons.
- Current web client (`client/webapp/src`) is flat: `auth/` (API + AuthContext + socket), `assets/AssetImage.tsx` (presign resolution), `pages/*`, `main.tsx`.
- Immediate extraction candidates:
  - `system/env` (typed Vite env access, base URLs)
  - `system/storage` (token persistence wrapper)
  - `network/http` (fetch + JSON + auth header)
  - `network/assets` (presign call)
