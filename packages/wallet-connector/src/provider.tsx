import InitSolana from "./initSolana";
import { Main } from "./main";
import React, { type PropsWithChildren, useState } from "react";
import { EvmInitialProps, SolanaInitialProps } from "./types";
import { InitEvm } from "./initEvm";

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
        <Main>{props.children}</Main>
      </InitEvm>
    </InitSolana>
  );
}
