declare global {
  interface Window {
    __ORDERLY_VERSION__?: {
      [key: string]: string;
    };
  }
}
if (typeof window !== "undefined") {
  window.__ORDERLY_VERSION__ = window.__ORDERLY_VERSION__ || {};
  window.__ORDERLY_VERSION__["@orderly.network/ui-connector"] =
    "2.5.1-internal-fix-multi-collateral.1";
}

export default "2.5.1-internal-fix-multi-collateral.1";
