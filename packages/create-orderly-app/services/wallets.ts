export enum WalletConnector {
  blockNative = "blockNative",
  custom = "custom",
}
export const walletConnectoies = [
  {
    title: "@orderly.network/web3-onboard",
    value: WalletConnector.blockNative,
  },
  { title: "Custom wallet connector", value: WalletConnector.custom },
];
