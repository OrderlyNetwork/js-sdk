declare global {
  interface Window {
    __ORDERLY_VERSION__?: {
      [key: string]: string;
    };
  }
}
if (typeof window !== "undefined") {
  window.__ORDERLY_VERSION__ = window.__ORDERLY_VERSION__ || {};
  window.__ORDERLY_VERSION__["@orderly.network/ui-share"] =
    "2.8.1-internal-20251020-hotfix.2";
}

export default "2.8.1-internal-20251020-hotfix.2";
