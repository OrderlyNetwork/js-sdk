import { AccountStatusBar } from "@/block/accountStatus";
import { ChainIdSwtich } from "@/block/accountStatus/sections/chainIdSwitch";
import { GetTestUSDC } from "@/block/operation/getTestUSDC";
import { WalletConnectSheet } from "@/block/walletConnect";
import { modal } from "@/modal";
import { OrderlyAppContext } from "@/provider";
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
      <div className="orderly-fixed orderly-left-0 orderly-bottom-0 orderly-w-screen orderly-bg-base-800 orderly-p-[14px] orderly-pb-[20px] orderly-border-t orderly-border-base-contrast/10 orderly-z-30 orderly-h-[64px] orderly-flex orderly-justify-between orderly-items-center">
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
