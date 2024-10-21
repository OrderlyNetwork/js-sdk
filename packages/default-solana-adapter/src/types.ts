import {Connection} from "@solana/web3.js";
import {type WalletAdapterProps} from '@solana/wallet-adapter-base';

export interface SolanaAdapterOption{
  provider: SolanaWalletProvider,
  address: string;
  chain: {id: number};

}

export interface SolanaWalletProvider{
  connection: Connection,
  signMessage: (message: Uint8Array) => Promise<Uint8Array>
  sendTransaction: WalletAdapterProps['sendTransaction'];
}