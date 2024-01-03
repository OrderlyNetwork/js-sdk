import type { FC, PropsWithChildren } from "react";
import { WalletConnectorContext } from "@orderly.network/hooks";
import { useWeb3Modal } from "@web3modal/wagmi/react";

export const Main: FC<PropsWithChildren> = (props) => {
  const { open } = useWeb3Modal();
  // return null;
  return (
    <WalletConnectorContext.Provider value={{ connect: open }}>
      {props.children}
    </WalletConnectorContext.Provider>
  );
};
