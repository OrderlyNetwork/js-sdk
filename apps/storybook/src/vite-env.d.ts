/// <reference types="vite/client" />
interface ImportMetaEnv {
  VITE_NETWORK_ID: string;
  VITE_BROKER_ID: string;
  VITE_BROKER_NAME: string;
  VITE_ENV: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
