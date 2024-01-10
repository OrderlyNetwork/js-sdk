import { FC, ReactNode, useCallback, useContext, useMemo } from "react";
import { useAccount } from "@orderly.network/hooks";
import { AccountStatus } from "@/block/accountStatus/desktop/accountStatus.desktop";
import { AccountStatusEnum } from "@orderly.network/types";
import { WalletConnectSheet } from "@/block/walletConnect";
import { modal } from "@/modal";
import { OrderlyAppContext } from "@/provider/appProvider";
import { showAccountConnectorModal } from "@/block/walletConnect/walletModal";
import { ChainIdSwtich } from "@/block/accountStatus/sections/chainIdSwitch";
import { Logo } from "@/logo";

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
          // dropMenuItem={(<div className="orderly-h-[200px] orderly-bg-primary"></div>)}
          // dropMenuItem={[{title: "haha", key: "bb"}, {title: "haha1", key: "bb1"},]}
          // onClickDropMenuItem={(item) => {
          //   console.log("click item", item);

          // }}
        />
      </div>
      {errors.ChainNetworkNotSupport && (
        <ChainIdSwtich onSetChain={onSetChain} />
      )}
    </>
  );
};
