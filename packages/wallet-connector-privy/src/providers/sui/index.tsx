import React, { PropsWithChildren } from "react";
import { useWalletConnectorPrivy } from "../../provider";
import { InitSui } from "../../types";
import { SuiWalletProvider, useSuiWallet } from "./suiWalletProvider";

export function SuiWallet(props: PropsWithChildren<{ suiConfig?: InitSui }>) {
  const { connectorWalletType } = useWalletConnectorPrivy();
  const disabled = connectorWalletType.disableSui === true || !props.suiConfig;

  return (
    <SuiWalletProvider disabled={disabled} suiConfig={props.suiConfig}>
      {props.children}
    </SuiWalletProvider>
  );
}

export { SuiWalletProvider, useSuiWallet };
