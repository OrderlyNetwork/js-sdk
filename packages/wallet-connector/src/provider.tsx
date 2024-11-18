import InitSolana from "./initSolana";
import { Main } from "./main";
import React, { type PropsWithChildren } from "react";
import { EvmInitialProps, SolanaInitialProps } from "./types";
import { InitEvm } from "./initEvm";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

export interface WalletConnectorProviderProps {
  solanaInitial?: SolanaInitialProps;
  evmInitial?: EvmInitialProps;
}

export function WalletConnectorProvider(
  props: PropsWithChildren<WalletConnectorProviderProps>
) {
  return (
    <InitSolana {...(props.solanaInitial ?? {})}>
      <InitEvm {...(props.evmInitial ?? {})}>
        <Main solanaNetwork={props.solanaInitial?.network ?? WalletAdapterNetwork.Devnet}>{props.children}</Main>
      </InitEvm>
    </InitSolana>
  );
}
