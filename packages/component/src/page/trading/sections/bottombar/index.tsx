import { AccountStatusBar } from "@/block/accountStatus";
import { ChainIdSwtich } from "@/block/accountStatus/sections/chainIdSwitch";
import { GetTestUSDC } from "@/block/operation/getTestUSDC";
import { WalletConnectSheet } from "@/block/walletConnect";
import { modal } from "@/modal";
import {
  useAccount,
  useCollateral,
  useAccountInfo,
  useAppState,
} from "@orderly.network/hooks";
import { AccountStatusEnum } from "@orderly.network/types";

import { useCallback, useContext } from "react";

export const BottomNavBar = () => {
  const { state, disconnect, connect, setChain } = useAccount();
  const { data } = useAccountInfo();
  const { totalValue } = useCollateral();
  const { errors } = useAppState();
  // const { onWalletConnect } = useContext(OrderlyContext);

  const onConnect = useCallback(() => {
    connect().then((result: { wallet: any; status: AccountStatusEnum }) => {
      console.log("onConnect", result);

      if (result && result.status < AccountStatusEnum.EnableTrading) {
        modal.show(WalletConnectSheet, {
          status: result.status,
        });
      }
    });
  }, []);

  return (
    <>
      {state.status === AccountStatusEnum.EnableTrading && <GetTestUSDC />}
      {errors.ChainNetworkNotSupport && <ChainIdSwtich onSetChain={setChain} />}
      <div className="fixed left-0 bottom-0 w-screen bg-base-200 px-2 border-t border-base-contrast/10 z-30 h-[44px] flex justify-between items-center">
        <AccountStatusBar
          chains={[]}
          status={state.status}
          address={state.address}
          accountInfo={data}
          totalValue={totalValue}
          onConnect={onConnect}
          onDisconnect={disconnect}
        />
      </div>
    </>
  );
};
