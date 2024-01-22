import { FC, useCallback, useContext, useMemo } from "react";
import { useAccount } from "@orderly.network/hooks";
import { AccountStatus } from "@/block/accountStatus/desktop/accountStatus.desktop";
import { AccountStatusEnum } from "@orderly.network/types";
import { WalletConnectSheet } from "@/block/walletConnect";
import { OrderlyAppContext } from "@/provider/appProvider";
import { showAccountConnectorModal } from "@/block/walletConnect/walletModal";
import { ChainIdSwtich } from "@/block/accountStatus/sections/chainIdSwitch";
import { Logo } from "@/logo";
import { CopyIcon } from "@/icon";

interface Props {
  // logo?: ReactNode;
}

export const TopNavbar: FC<Props> = (props) => {
  const { state } = useAccount();
  const { errors, appIcons: logos } = useContext(OrderlyAppContext);
  const { onWalletConnect, onSetChain, onWalletDisconnect } =
    useContext(OrderlyAppContext);
  const onConnect = useCallback(() => {
    onWalletConnect().then(
      (result: { wallet: any; status: AccountStatusEnum }) => {
        if (result && result.status < AccountStatusEnum.EnableTrading) {
          showAccountConnectorModal({
            status: result.status,
          });
        }
      }
    );
  }, []);

  const logoElement = useMemo(() => {
    if (logos?.main?.component) {
      return logos?.main?.component;
    }
    if (logos?.main?.img) {
      return <img src={logos?.main?.img} />;
    }
    return null;
  }, [logos?.main]);

  return (
    <>
      <div className="orderly-h-[48px] orderly-flex">
        <div className="orderly-flex-1">
          <Logo />
        </div>

        <AccountStatus
          status={state.status}
          address={state.address}
          chains={[]}
          accountInfo={undefined}
          className="orderly-mr-3"
          onConnect={onConnect}
          // dropMenuItem={
          //   <div className="orderly-flex orderly-h-[56px] orderly-items-center">
          //     Custom Menu
          //   </div>
          // }
          // dropMenuItem={[
          //   { icon: <CopyIcon size={20} />, title: "Menu 1", key: "1" },
          //   { icon: <CopyIcon size={20} />, title: "Menu 2", key: "2" },
          // ]}
          // onClickDropMenuItem={(item) => {
          //   console.log("onClickDropMenuItem", item);
          // }}
        />
      </div>
      {errors.ChainNetworkNotSupport && (
        <ChainIdSwtich onSetChain={onSetChain} />
      )}
    </>
  );
};
