declare global {
  interface Window {
    __ORDERLY_VERSION__?: {
      [key: string]: string;
    };
  }
}
if (typeof window !== "undefined") {
  window.__ORDERLY_VERSION__ = window.__ORDERLY_VERSION__ || {};
  window.__ORDERLY_VERSION__["@orderly.network/core"] =
    "2.6.2-internal-hotfix-avgPrice.2";
}

export default "2.6.2-internal-hotfix-avgPrice.2";
