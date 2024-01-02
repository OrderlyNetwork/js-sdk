import type { FC, PropsWithChildren } from "react";
import { WalletConnectorContext } from "@orderly.network/hooks";

export const Main: FC<PropsWithChildren> = (props) => {
  return (
    <WalletConnectorContext.Provider value={{}}>
      {props.children}
    </WalletConnectorContext.Provider>
  );
};
