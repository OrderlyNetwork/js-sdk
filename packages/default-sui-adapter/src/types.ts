export type SuiNetworkName = "mainnet" | "testnet";

export interface SuiWalletProvider {
  network: SuiNetworkName;
  rpcUrl?: string | null;
  client?: {
    getBalance?: (input: {
      owner: string;
      coinType?: string;
    }) => Promise<{ totalBalance: string | number | bigint }>;
    getAllBalances?: (input: { owner: string }) => Promise<
      Array<{
        coinType: string;
        totalBalance: string | number | bigint;
      }>
    >;
  };
  wallet?: unknown;
  account?: {
    address: string;
    label?: string;
  };
  dAppKit?: unknown;
}

export interface SuiAdapterOption {
  provider: SuiWalletProvider;
  address: string;
  chain: { id: number };
}
