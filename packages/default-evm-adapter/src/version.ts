declare global {
  interface Window {
    __ORDERLY_VERSION__?: {
      [key: string]: string;
    };
  }
}
if (typeof window !== "undefined") {
  window.__ORDERLY_VERSION__ = window.__ORDERLY_VERSION__ || {};
  window.__ORDERLY_VERSION__["@orderly.network/default-evm-adapter"] =
    "2.10.3-internal-20260317-hotfix-iso.0";
}

export default "2.10.3-internal-20260317-hotfix-iso.0";
