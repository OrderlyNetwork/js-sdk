declare global {
  interface Window {
    __ORDERLY_VERSION__?: {
      [key: string]: string;
    };
  }
}
if (typeof window !== "undefined") {
  window.__ORDERLY_VERSION__ = window.__ORDERLY_VERSION__ || {};
  window.__ORDERLY_VERSION__["@orderly.network/perp"] =
    "4.10.3-internal-20260317-hotfix-iso.0";
}

export default "4.10.3-internal-20260317-hotfix-iso.0";
