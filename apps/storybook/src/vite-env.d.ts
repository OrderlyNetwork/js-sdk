/// <reference types="vite/client" />
interface ImportMetaEnv {
  VITE_NETWORK_ID: string;
  VITE_BROKER_ID: string;
  VITE_BROKER_NAME: string;
  VITE_ENV: string;
  VITE_DEFAULT_THEME: string;
  VITE_WATCH_PACKAGES: string;
  STORYBOOK: string;
  STORYBOOK_DEFAULT_THEME: string;
  STORYBOOK_DISABLED_ADDONS: string;
  VITE_AMPLITUDE_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
