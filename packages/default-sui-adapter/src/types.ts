export type SuiNetworkName = "mainnet" | "testnet";

export type SuiDepositConfig = {
  chainId?: number;
  vaultPackage?: string;
  vaultConfig?: string;
  oapp?: string;
  usdcType?: string;
  executionGas?: bigint;
};

type SuiBalanceValue = string | number | bigint;

export type SuiBalanceResponse =
  | {
      totalBalance?: SuiBalanceValue;
    }
  | {
      balance?: {
        balance?: SuiBalanceValue;
        coinBalance?: SuiBalanceValue;
        addressBalance?: SuiBalanceValue;
      };
    };

export type SuiAllBalancesResponse = Array<{
  coinType: string;
  totalBalance?: SuiBalanceValue;
  balance?: SuiBalanceValue;
  coinBalance?: SuiBalanceValue;
  addressBalance?: SuiBalanceValue;
}>;

export interface SuiWalletProvider {
  network: SuiNetworkName;
  rpcUrl?: string | null;
  client?: {
    getBalance?: (input: {
      owner: string;
      coinType?: string;
    }) => Promise<SuiBalanceResponse>;
    getAllBalances?: (input: {
      owner: string;
    }) => Promise<SuiAllBalancesResponse>;
  };
  wallet?: unknown;
  account?: {
    address: string;
    label?: string;
    publicKey?: string;
    rawPublicKey?: string;
    publicKeyScheme?: number;
  };
  depositConfig?: Partial<Record<SuiNetworkName, SuiDepositConfig>>;
  dAppKit?: {
    signAndExecuteTransaction?: (inputs: {
      transaction: unknown;
    }) => Promise<any>;
    signPersonalMessage?: (inputs: {
      message: Uint8Array;
    }) => Promise<{ bytes?: string; signature: string }>;
  };
}

export interface SuiAdapterOption {
  provider: SuiWalletProvider;
  address: string;
  chain: { id: number };
}
