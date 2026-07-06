import { Stage } from "@layerzerolabs/lz-definitions";
import { SuiNetworkName, SuiWalletProvider } from "./types";

export type ResolvedSuiDepositContext = {
  vaultPackage: string;
  vaultConfig: string;
  oapp: string;
  executionGas: bigint;
  network: SuiNetworkName;
  stage: Stage;
};

export type SuiDepositData = {
  accountId?: string;
  brokerHash: string;
  tokenHash: string;
  tokenAmount: string;
  tokenAddress?: string;
  vaultConfig?: string;
  oapp?: string;
};

export type SuiSelectedDepositCoins = {
  primaryCoinId: string;
  mergeCoinIds: string[];
  totalBalance: bigint;
};

export type SuiSignatureMessage = Record<
  string,
  string | number | bigint | undefined
>;

export type SuiDAppKitBridge = NonNullable<SuiWalletProvider["dAppKit"]>;
