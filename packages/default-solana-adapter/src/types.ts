import {Connection} from "@solana/web3.js";
import { WalletAdapterNetwork, type SignerWalletAdapterProps, type WalletAdapterProps } from "@solana/wallet-adapter-base";

export interface SolanaAdapterOption{
  provider: SolanaWalletProvider,
  address: string;
  chain: {id: number};

}

export interface SolanaWalletProvider{
  connection?: Connection,
  rpcUrl?: string,
  network: WalletAdapterNetwork,
  signMessage: (message: Uint8Array) => Promise<Uint8Array>
  signTransaction: SignerWalletAdapterProps['signTransaction']
  sendTransaction: WalletAdapterProps['sendTransaction'];
}