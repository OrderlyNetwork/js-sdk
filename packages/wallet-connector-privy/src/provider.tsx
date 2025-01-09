import React, { type PropsWithChildren } from "react";
import { Main } from "./main";
import { InitSolana } from "./initSolana";
import { InitWagmi } from "./initWagmi";
import { InitPrivy } from "./initPrivy";

export function WalletConnectorPrivyProvider(props: PropsWithChildren) {
  return (
    <InitPrivy>
      <InitWagmi>
        <InitSolana>
          <Main>
            {props.children}
          </Main>
        </InitSolana>
      </InitWagmi>
    </InitPrivy>
  );
}
