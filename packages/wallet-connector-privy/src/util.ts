import {
  AbstractChains,
  ChainNamespace,
  getChainNamespaceByChainId,
} from "@orderly.network/types";
import { WalletType } from "./types";

export const OrderlyOSS = "https://oss.orderly.network";
export const PrivyConnectorImagePath = `${OrderlyOSS}/static/sdk/privy`;
export const EVMWalletImage = `${OrderlyOSS}/static/sdk/evm_wallet`;

// evm wallets icon map
const WALLET_ICONS: Record<string, string> = {
  metamask: "https://oss.orderly.network/static/sdk/evm_wallets/metamask.png",
  walletconnect:
    "https://oss.orderly.network/static/sdk/evm_wallets/walletConnect.png",
  binance: "https://oss.orderly.network/static/sdk/evm_wallets/binance.png",
  ledger: "https://oss.orderly.network/static/sdk/evm_wallets/ledger.png",
  coinbase: "https://oss.orderly.network/static/sdk/evm_wallets/coinbase.png",
  magic: "https://oss.orderly.network/static/sdk/evm_wallets/magic.png",
  trezor: "https://oss.orderly.network/static/sdk/evm_wallets/trezor.png",
  exodus: "https://oss.orderly.network/static/sdk/evm_wallets/exodus.png",
  frame: "https://oss.orderly.network/static/sdk/evm_wallets/frame.png",
  rabby: "https://oss.orderly.network/static/sdk/evm_wallets/rabby.png",
};
export const getWalletIcon = (type: string): string | undefined => {
  return WALLET_ICONS[type.toLowerCase()];
};

export const getWalletTypeByChainId = (chainId: number): WalletType => {
  if (AbstractChains.has(chainId)) {
    return WalletType.ABSTRACT;
  }

  const namespace = getChainNamespaceByChainId(chainId);
  switch (namespace) {
    case ChainNamespace.solana:
      return WalletType.SOL;
    case ChainNamespace.sui:
      return WalletType.SUI;
    case ChainNamespace.evm:
    default:
      return WalletType.EVM;
  }
};

export const getChainType = getWalletTypeByChainId;
