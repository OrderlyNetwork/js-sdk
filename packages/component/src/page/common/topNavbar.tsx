import {
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  StatusContext,
  WsNetworkStatus,
  useAccount,
  // useMaintenanceStatus,
} from "@orderly.network/hooks";
import { AccountStatus } from "@/block/accountStatus/desktop/accountStatus.desktop";
import { AccountStatusEnum } from "@orderly.network/types";
import { OrderlyAppContext } from "@/provider/appProvider";
import { showAccountConnectorModal } from "@/block/walletConnect/walletModal";
import { ChainIdSwtich } from "@/block/accountStatus/sections/chainIdSwitch";
import { Logo } from "@/logo";
import { WsStatus } from "@/block/accountStatus/sections/WsStatus";
import TopTips from "@/block/accountStatus/sections/topTips";

export type TopNavbarProps = {
  left?: ReactNode;
  right?: ReactNode;
  nav?: ReactNode;
};

export const TopNavbar: FC = (props) => {
  const { state } = useAccount();
  const {
    errors,
    accountMenuItems,
    onClickAccountMenuItem,
    topBar,
    topBarProps,
  } = useContext(OrderlyAppContext);

  const { left, nav, right } = topBarProps || {};

  const { ws: wsStatus } = useContext(StatusContext);

  const { onWalletConnect, onSetChain, onWalletDisconnect } =
    useContext(OrderlyAppContext);

  const onConnect = useCallback(() => {
    onWalletConnect().then(
      (result: { wallet: any; status: AccountStatusEnum }) => {
        if (result && result.status < AccountStatusEnum.EnableTrading) {
          showAccountConnectorModal({
            status: result.status,
          }).catch((err: any) => {
            console.log("cancel", err);
          });
        }
      }
    );
  }, []);

  return (
    <>
      {topBar || (
        <div className="orderly-h-[48px] orderly-flex">
          <div className="orderly-flex orderly-flex-1">
            <Logo />
            {left}
            <div className="orderly-flex-1">{nav}</div>
          </div>

          {right || (
            <AccountStatus
              status={state.status}
              address={state.address}
              accountInfo={undefined}
              className="orderly-mr-3"
              onConnect={onConnect}
              dropMenuItem={accountMenuItems}
              onClickDropMenuItem={onClickAccountMenuItem}
            />
          )}
        </div>
      )}

      <TopTips />
    </>
  );
};
