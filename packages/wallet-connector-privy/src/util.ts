import { Connector } from "wagmi";

// evm wallets icon map
const WALLET_ICONS: Record<string, string> = {
  'metamask': 'https://oss.orderly.network/static/sdk/evm_wallets/metamask.png',
  'walletconnect': 'https://oss.orderly.network/static/sdk/evm_wallets/walletConnect.png',
  'binance': 'https://oss.orderly.network/static/sdk/evm_wallets/binance.png',
  'ledger': 'https://oss.orderly.network/static/sdk/evm_wallets/ledger.png',
  'coinbase': 'https://oss.orderly.network/static/sdk/evm_wallets/coinbase.png',
  'magic': 'https://oss.orderly.network/static/sdk/evm_wallets/magic.png',
  'trezor': 'https://oss.orderly.network/static/sdk/evm_wallets/trezor.png',
  'exodus': 'https://oss.orderly.network/static/sdk/evm_wallets/exodus.png',
  'frame': 'https://oss.orderly.network/static/sdk/evm_wallets/frame.png',
  'rabby': 'https://oss.orderly.network/static/sdk/evm_wallets/rabby.png',
  
};
export const getWalletIcon = (connector: Connector): string | undefined => {
  // inject wallet icon
  if (connector.type === 'injected') {
    // 检查是否是MetaMask
    if (typeof window !== 'undefined' && window.ethereum?.isMetaMask) {
      return 'https://oss.orderly.network/static/sdk/evm_wallets/metamask.png';
    }
    // 检查是否是Coinbase Wallet
    if (typeof window !== 'undefined' && window.ethereum?.isCoinbaseWallet) {
      return 'https://oss.orderly.network/static/sdk/evm_wallets/coinbase.png';
    }
    // 其他注入钱包
    return 'https://oss.orderly.network/static/sdk/evm_wallets/default.png';
  }

  return WALLET_ICONS[connector.type.toLowerCase()]
};