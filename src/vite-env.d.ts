/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_LIVE_API?: string;
  readonly VITE_API_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
