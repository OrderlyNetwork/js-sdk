export type ChainItem = {
  name: string;
  id: number;
  lowestFee?: boolean;
  isTestnet?: boolean;
};

export enum ChainSelectorType {
  Mainnet = 'Mainnet',
  Testnet = 'Testnet'
}
