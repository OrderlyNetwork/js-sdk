export interface SolanaAdapterOption{
  provider: SolanaWalletProvider,
  address: string;
  chain: {id: number};

}

export interface SolanaWalletProvider{

  signMessage: (message: Uint8Array) => Promise<Uint8Array>
}