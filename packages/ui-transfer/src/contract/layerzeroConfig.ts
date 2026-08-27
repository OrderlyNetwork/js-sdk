export type OrderlyNetworkKey = "mainnet" | "testnet";

export const ORDERLY_RPC_URL = {
  mainnet: "https://rpc.orderly.network",
  testnet: "https://testnet-rpc.orderly.org",
} as const;

/** LayerZero EndpointV2 on Orderly L2. */
export const ORDERLY_ENDPOINT_V2 = {
  mainnet: "0x1a44076050125825900e736c501f859c50fE728c",
  testnet: "0x6EDCE65403992e310A62460808c4b910D972f10f",
} as const;

/** EVM RelayV2 OApp on Orderly (Deposit receiver). */
export const ORDERLY_RELAY_OAPP = {
  mainnet: "0x461C12FBa639303Da045255dd32eEa7E38AC69b0",
  testnet: "0xe907d027F6E62794021b9839B4D234618d11Ebab",
} as const;

/** Solana LZ peer OApp on Orderly. */
export const ORDERLY_SOL_PEER_OAPP = {
  mainnet: "0xCecAe061aa078e13b5e70D5F9eCee90a3F2B6AeA",
  testnet: "0x5Bf771A65d057e778C5f0Ed52A0003316f94322D",
} as const;

export function getOrderlyNetworkKey(isMainnet: boolean): OrderlyNetworkKey {
  return isMainnet ? "mainnet" : "testnet";
}
