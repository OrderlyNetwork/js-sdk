declare global {
  interface Window {
    __ORDERLY_VERSION__?: {
      [key: string]: string;
    };
  }
}
if (typeof window !== "undefined") {
  window.__ORDERLY_VERSION__ = window.__ORDERLY_VERSION__ || {};
  window.__ORDERLY_VERSION__["@orderly.network/wallet-connector"] =
    "2.3.3-internal-multi-collateral.0";
}

export default "2.3.3-internal-multi-collateral.0";
