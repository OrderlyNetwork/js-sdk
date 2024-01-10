import { FC, useContext, useEffect, useMemo, useState } from "react";
import { DepositForm } from "./depositForm";
// import { WalletConnectorContext } from "@/provider";
import {
  useChain,
  useDeposit,
  useChains,
  useWalletConnector,
  useWS,
} from "@orderly.network/hooks";
import {
  API,
  ARBITRUM_MAINNET_CHAINID,
  ARBITRUM_TESTNET_CHAINID,
  CurrentChain,
} from "@orderly.network/types";
import { AssetsContext } from "@/provider/assetsProvider";
import { OrderlyAppContext } from "@/provider";
import { useConfig } from "@orderly.network/hooks";

export enum DepositStatus {
  Checking = "Checking",
  InsufficientBalance = "InsufficientBalance",
  Normal = "Normal",
}

export interface DepositProps {
  onCancel?: () => void;
  onOk?: () => void;
  wooSwapEnabled?: boolean;
}

export const Deposit: FC<DepositProps> = (props) => {
  // const { dst } = props;

  const [needCrossChain, setNeedCrossChain] = useState<boolean>(false);
  const [needSwap, setNeedSwap] = useState<boolean>(false);
  const { enableSwapDeposit } = useContext(OrderlyAppContext);
  const networkId = useConfig("networkId");

  // @ts-ignore
  const [chains, { findByChainId }] = useChains(undefined, {
    wooSwapEnabled: enableSwapDeposit,
    pick: "network_infos",
  });

  const { connectedChain, wallet, setChain, settingChain } =
    useWalletConnector();

  const { onEnquiry } = useContext(AssetsContext);

  const [symbolPrice, setSymbolPrice] = useState({});

  // const { chains } = useChain("USDC");
  const [token, setToken] = useState<API.TokenInfo>();
  // @ts-ignore
  const currentChain = useMemo<CurrentChain | null>(() => {
    if (!connectedChain) return null;

    // const chainId = parseInt(connectedChain.id);
    const { id: chainId } = connectedChain;
    const chain = findByChainId(chainId);

    return {
      ...connectedChain,
      id: chainId,
      info: chain,
    };
  }, [connectedChain, findByChainId]);

  const {
    dst,
    balance,
    allowance,
    approve,
    deposit,
    getDepositFee,
    isNativeToken,
    balanceRevalidating,
    fetchBalance,
  } = useDeposit({
    address: token?.address,
    decimals: token?.decimals,
    srcChainId: currentChain?.id,
    srcToken: token?.symbol,
    crossChainRouteAddress:
      currentChain?.info?.network_infos?.woofi_dex_cross_chain_router,
    depositorAddress: currentChain?.info?.network_infos?.woofi_dex_depositor,
  });

  useEffect(() => {
    if (!token || !currentChain) return;
    /// check if need swap

    if (token.symbol !== "USDC") {
      setNeedSwap(true);
    } else {
      setNeedSwap(false);
    }

    if (currentChain?.id !== dst.chainId) {
      setNeedCrossChain(true);
      setNeedSwap(true);
    } else {
      setNeedCrossChain(false);
    }
  }, [token?.symbol, currentChain?.id, dst?.chainId]);

  const ws = useWS();

  useEffect(() => {
    const unsubscribe = ws.subscribe("indexprices", {
      onMessage: (data: any[]) => {
        const obj: Record<string, number> = {};
        data.forEach((item) => {
          const split = item.symbol.split("_");
          obj[split[1]] = item.price;
        });
        setSymbolPrice(obj);
      },
    });

    return () => {
      unsubscribe?.();
    };
  }, []);

  function getDepositFeeChainNetworkInfo() {
    const currentChainNewtorkInfo = currentChain?.info?.network_infos!;
    if (networkId === "testnet") {
      return (
        findByChainId(ARBITRUM_TESTNET_CHAINID, "network_infos") ||
        currentChainNewtorkInfo
      );
    }

    // Orderly supported chain : get the current chain deposit fee
    if (currentChain?.info?.network_infos?.bridgeless) {
      return currentChainNewtorkInfo;
    }

    // Orderly un-supported chain - get Arbitrum deposit fee
    return (
      findByChainId(ARBITRUM_MAINNET_CHAINID, "network_infos") ||
      currentChainNewtorkInfo
    );
  }

  function doGetDepositFee(amount: string) {
    return getDepositFee(amount, getDepositFeeChainNetworkInfo());
  }

  return (
    <DepositForm
      // @ts-ignore
      dst={dst}
      allowance={allowance}
      address={wallet?.accounts?.[0].address}
      chain={currentChain}
      // @ts-ignore
      chains={chains}
      walletName={wallet?.label}
      switchChain={setChain}
      // switchChain={switchChain}
      // decimals={chains?.decimals ?? 2}
      displayDecimals={2}
      switchToken={setToken}
      token={token}
      isNativeToken={isNativeToken}
      minAmount={0}
      maxAmount={balance}
      approve={approve}
      deposit={deposit}
      getDepositFee={doGetDepositFee}
      fetchBalance={fetchBalance}
      onOk={props.onOk}
      balanceRevalidating={balanceRevalidating}
      settingChain={settingChain}
      onEnquiry={onEnquiry}
      needCrossChain={needCrossChain}
      needSwap={needSwap}
      symbolPrice={symbolPrice}
    />
  );
};
