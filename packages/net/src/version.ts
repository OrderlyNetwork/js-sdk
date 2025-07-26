declare global {
  interface Window {
    __ORDERLY_VERSION__?: {
      [key: string]: string;
    };
  }
}
if (typeof window !== "undefined") {
  window.__ORDERLY_VERSION__ = window.__ORDERLY_VERSION__ || {};
  window.__ORDERLY_VERSION__["@orderly.network/net"] =
    "2.5.3-internal-20250724-hotfix.18";
}

export default "2.5.3-internal-20250724-hotfix.18";
