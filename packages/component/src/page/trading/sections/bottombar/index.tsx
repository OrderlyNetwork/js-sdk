import { AccountStatusBar } from "@/block/accountStatus";
import { ChainIdSwtich } from "@/block/accountStatus/sections/chainIdSwitch";
import { GetTestUSDC } from "@/block/operation/getTestUSDC";
import { WalletConnectSheet } from "@/block/walletConnect";
import { modal } from "@/modal";
import { OrderlyAppContext, WalletConnectorContext } from "@/provider";
import {
  useAccount,
  useCollateral,
  useAccountInfo,
  OrderlyContext,
} from "@orderly.network/hooks";
import { AccountStatusEnum } from "@orderly.network/types";

import { useCallback, useContext, useMemo } from "react";

export const BottomNavBar = () => {
  const { state } = useAccount();
  const { data } = useAccountInfo();
  const { totalValue } = useCollateral();
  const { errors } = useContext(OrderlyAppContext);
  const { connectedChain } = useContext(WalletConnectorContext);
  const { onlyTestnet } = useContext<any>(OrderlyContext);
  const { onWalletConnect, onSetChain, onWalletDisconnect } =
    useContext(OrderlyAppContext);

  const onConnect = useCallback(() => {
    onWalletConnect().then(
      (result: { wallet: any; status: AccountStatusEnum }) => {
        if (result && result.status < AccountStatusEnum.EnableTrading) {
          modal.show(WalletConnectSheet, {
            status: result.status,
          });
        }
      }
    );
  }, []);

  const showGetTestUSDC = useMemo(() => {
    // 在localstrange里面加ENABLE_MAINNET=true值就可以让onlyTestnet为true
    return state.status === AccountStatusEnum.EnableTrading && onlyTestnet;
  }, [state.status, onlyTestnet]);

  return (
    <>
      {showGetTestUSDC && <GetTestUSDC />}
      {errors.ChainNetworkNotSupport && (
        <ChainIdSwtich onSetChain={onSetChain} />
      )}
      <div className="fixed left-0 bottom-0 w-screen bg-base-200 p-[14px] pb-[20px] border-t border-base-contrast/10 z-30 h-[64px] flex justify-between items-center">
        <AccountStatusBar
          chains={[]}
          status={state.status}
          address={state.address}
          accountInfo={data}
          totalValue={totalValue}
          onConnect={onConnect}
          onDisconnect={onWalletDisconnect}
          showGetTestUSDC={showGetTestUSDC}
        />
      </div>
    </>
  );
};
