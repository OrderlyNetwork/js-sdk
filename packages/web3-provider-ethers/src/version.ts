declare global {
  interface Window {
    __ORDERLY_VERSION__?: {
      [key: string]: string;
    };
  }
}
if (typeof window !== "undefined") {
  window.__ORDERLY_VERSION__ = window.__ORDERLY_VERSION__ || {};
  window.__ORDERLY_VERSION__["@kodiak-finance/orderly-web3-provider-ethers"] = "2.7.3";
}

export default "2.7.3";
