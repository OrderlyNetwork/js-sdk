declare global {
  interface Window {
    __ORDERLY_VERSION__?: {
      [key: string]: string;
    };
  }
}
if (typeof window !== "undefined") {
  window.__ORDERLY_VERSION__ = window.__ORDERLY_VERSION__ || {};
  window.__ORDERLY_VERSION__["@orderly.network/utils"] =
    "2.4.2-internal-multi-collateral.12";
}

export default "2.4.2-internal-multi-collateral.12";
