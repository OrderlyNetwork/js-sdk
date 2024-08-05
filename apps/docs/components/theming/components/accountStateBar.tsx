import {
  useAccount,
  useAccountInfo,
  useCollateral,
} from "@orderly.network/hooks";
import { AccountStatusBar, OrderlyAppContext } from "@orderly.network/react";
import { AccountStatusEnum } from "@orderly.network/types";
import { useCallback, useContext } from "react";

export const AccountStatusBarComponent = () => {
  const { state } = useAccount();
  const { data } = useAccountInfo();
  const { totalValue } = useCollateral();
  const { onWalletConnect, onSetChain, onWalletDisconnect } =
    useContext(OrderlyAppContext);

  const onConnect = useCallback(() => {
    onWalletConnect().then(
      (result: { wallet: any; status: AccountStatusEnum }) => {
        if (result && result.status < AccountStatusEnum.EnableTrading) {
          //   modal.show(WalletConnectSheet, {
          //     status: result.status,
          //   });
        }
      }
    );
  }, []);
  return (
    <AccountStatusBar
      status={state.status}
      accountInfo={data}
      totalValue={totalValue}
      onConnect={onConnect}
      onDisconnect={onWalletDisconnect}
    />
  );
};
