import { FC, useMemo, useState } from "react";
import { DepositForm } from "./depositForm";
import {
  useDeposit,
  useChains,
  useWalletConnector,
  useWS,
  useDebounce,
  useConfig,
} from "@orderly.network/hooks";
import { API, CurrentChain } from "@orderly.network/types";
import { DepositProvider } from "./DepositProvider";
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
  const { enableSwapDeposit } = useContext(OrderlyAppContext);
  const networkId = useConfig("networkId");
  const ws = useWS();

  // @ts-ignore
  const [chains, { findByChainId }] = useChains(networkId, {
    wooSwapEnabled: enableSwapDeposit,
    pick: "network_infos",
    filter: (chain: any) =>
      chain.network_infos?.bridge_enable || chain.network_infos?.bridgeless,
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
  });

  return (
    <DepositProvider>
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
