import { FC, useMemo, useState } from "react";
import { DepositForm } from "./depositForm";
import {
  useDeposit,
  useChains,
  useWalletConnector,
} from "@orderly.network/hooks";
import { API, CurrentChain } from "@orderly.network/types";
import { DepositProvider } from "./DepositProvider";
import { useNeedSwapAndCross } from "./hooks/useNeedSwapAndCross";
import { praseChainIdToNumber } from "@orderly.network/utils";

export enum DepositStatus {
  Checking = "Checking",
  InsufficientBalance = "InsufficientBalance",
  Normal = "Normal",
}

export interface DepositProps {
  onCancel?: () => void;
  onOk?: () => void;
}

export const Deposit: FC<DepositProps> = (props) => {
  const [chains, { findByChainId }] = useChains(undefined, {
    pick: "network_infos",
  });

  const { connectedChain, wallet, setChain, settingChain } =
    useWalletConnector();

  const [token, setToken] = useState<API.TokenInfo>();

  // @ts-ignore
  const currentChain = useMemo<CurrentChain | null>(() => {
    if (!connectedChain) return null;

    const chainId = praseChainIdToNumber(connectedChain.id);
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
    depositFeeRevalidating,
    depositFee,
    quantity,
    setQuantity,
    approve,
    deposit,
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

  const { needSwap, needCrossSwap } = useNeedSwapAndCross(
    token?.symbol,
    currentChain?.id,
    dst?.chainId
  );

  return (
    <DepositProvider needSwap={needSwap} needCrossSwap={needCrossSwap}>
      <DepositForm
        dst={dst}
        allowance={allowance}
        address={wallet?.accounts?.[0].address}
        chain={currentChain}
        // @ts-ignore
        chains={chains}
        walletName={wallet?.label}
        switchChain={setChain}
        displayDecimals={2}
        switchToken={setToken}
        token={token}
        isNativeToken={isNativeToken}
        minAmount={0}
        maxAmount={balance}
        approve={approve}
        deposit={deposit}
        fetchBalance={fetchBalance}
        onOk={props.onOk}
        balanceRevalidating={balanceRevalidating}
        settingChain={settingChain}
        quantity={quantity}
        setQuantity={setQuantity}
        depositFee={depositFee}
        depositFeeRevalidating={depositFeeRevalidating}
      />
    </DepositProvider>
  );
};

export default Deposit;
