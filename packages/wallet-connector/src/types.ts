import type {PropsWithChildren} from "react";
import {Adapter, WalletAdapterNetwork} from "@solana/wallet-adapter-base";

export interface  SolanaInitialProps extends PropsWithChildren{
    network?: WalletAdapterNetwork;
    endPoint?: string;
    wallets?:Adapter[];

}

export interface EvmInitialProps extends PropsWithChildren{
    apiKey?: string;
    // options?: ConnectorInitOptions;
    // skip board configuration if already initialized
    skipInit?: boolean;
}