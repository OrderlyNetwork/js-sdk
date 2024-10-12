import InitSolana from "./initSolana";
import { Main } from "./main";
import React, { type PropsWithChildren, useState } from "react";

export interface WalletConnectorProviderProps {
  apiKey?: string;
  // options?: ConnectorInitOptions;
  // skip board configuration if already initialized
  skipInit?: boolean;
}

export function WalletConnectorProvider(
  props: PropsWithChildren<WalletConnectorProviderProps>
) {

  return (
    <InitSolana>

      <Main>
        {props.children}
      </Main>

    </InitSolana>
  );
}