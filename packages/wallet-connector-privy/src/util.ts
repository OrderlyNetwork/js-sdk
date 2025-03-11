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
  if (connector.type === 'injected' && typeof window !== 'undefined' && window.ethereum) {
    // check if it is coinbase wallet
    if (window.ethereum.isCoinbaseWallet) {
      return 'https://oss.orderly.network/static/sdk/evm_wallets/coinbase.png';
    }
    // check if it is phantom
    if (window.ethereum.isPhantom) {
      return 'https://oss.orderly.network/static/sdk/evm_wallets/phantom.png';
    }
    // window.ethereum.isMetaMask and window.ethereum.isPantom will both return true, need put metamask last

    // check if it is metamask
    if (window.ethereum.isMetaMask) {
      return 'https://oss.orderly.network/static/sdk/evm_wallets/metamask.png';
    }
    // other injected wallets
    return 'https://oss.orderly.network/static/sdk/evm_wallets/default.png';
  }

  return WALLET_ICONS[connector.type.toLowerCase()]
};