/// <reference types="vite/client" />

interface ImportMetaEnv {
  // API Configuration
  readonly VITE_API_URL: string;
  readonly VITE_WS_URL: string;
  readonly VITE_API_PREFIX: string;

  // Application Info
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;

  // Debug & Logging
  readonly VITE_DEBUG: string;
  readonly VITE_LOG_LEVEL: 'trace' | 'debug' | 'info' | 'warn' | 'error';

  // Feature Flags
  readonly VITE_ENABLE_INSPECTOR: string;
  readonly VITE_ENABLE_CONSOLE_LOGS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
