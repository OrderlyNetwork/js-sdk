import {useCallback, useEffect, useMemo} from "react";
import {useAccount, useConfig, useDeposit, useIndexPrice} from "@orderly.network/hooks";
import {API, NetworkId, ChainNamespace} from "@orderly.network/types";
import {Decimal} from "@orderly.network/utils";
import {useAppContext} from "@orderly.network/react-app";
import {feeDecimalsOffset} from "../../utils";
import {useActionType, useChainSelect, useDepositAction, useInputStatus, useToken,} from "./hooks";

export type UseDepositFormScriptReturn = ReturnType<
  typeof useDepositFormScript
>;

export type UseDepositFormScriptOptions = {
  onClose?: () => void;
};

export const useDepositFormScript = (options: UseDepositFormScriptOptions) => {
  const { wrongNetwork } = useAppContext();

  const networkId = useConfig("networkId") as NetworkId;

  const { chains, currentChain, settingChain, onChainChange } =
    useChainSelect();

  const { token, tokens, onTokenChange } = useToken({ currentChain });

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

  const maxQuantity = useMemo(
    () =>
      new Decimal(balance || 0)
        .todp(token?.precision ?? 2, Decimal.ROUND_DOWN)
        .toString(),
    [balance, token]
  );

  const { inputStatus, hintMessage } = useInputStatus({
    quantity,
    maxQuantity,
  });

  const cleanData = () => {
    setQuantity("");
  };

  const onSuccess = useCallback(() => {
    cleanData();
    options.onClose?.();
  }, [options.onClose]);

  const { submitting, onApprove, onDeposit } = useDepositAction({
    quantity,
    allowance,
    approve,
    deposit,
    onSuccess,
  });

  const loading = submitting || depositFeeRevalidating!;

  const disabled =
    !quantity ||
    Number(quantity) === 0 ||
    !token ||
    inputStatus === "error" ||
    depositFeeRevalidating!;

  const amount = useMemo(() => {
    const markPrice = 1;
    return new Decimal(quantity || 0).mul(markPrice).toNumber();
  }, [quantity]);

  const actionType = useActionType({
    isNativeToken,
    allowance,
    quantity,
    maxQuantity,
  });

  const fee = useDepositFee({
    nativeToken: currentChain?.info?.nativeToken,
    depositFee,
  });

  useEffect(() => {
    cleanData();
  }, [token, currentChain?.id]);

  return {
    token,
    tokens,
    onTokenChange,
    amount,
    quantity,
    maxQuantity,
    onQuantityChange: setQuantity,
    hintMessage,
    inputStatus,
    chains,
    currentChain,
    settingChain,
    onChainChange,
    actionType,
    onDeposit,
    onApprove,
    fetchBalance,
    dst,
    wrongNetwork,
    balanceRevalidating,
    loading,
    disabled,
    networkId,
    fee,
  };
};

export type UseFeeReturn = ReturnType<typeof useDepositFee>;

export function useDepositFee(options: {
  nativeToken?: API.TokenInfo;
  depositFee?: bigint;
}) {
  const { nativeToken, depositFee = 0 } = options;
  const {account} = useAccount();

  const nativeSymbol = nativeToken?.symbol;

  const { data: symbolPrice } = useIndexPrice(`SPOT_${nativeSymbol}_USDC`);

  const feeProps = useMemo(() => {
    const dstGasFee = new Decimal(depositFee.toString())
        // todo solana is 9, evm is 18
      .div(new Decimal(10).pow(account.walletAdapter?.chainNamespace === ChainNamespace.solana ? 9:18))
      .toString();

    const feeAmount = new Decimal(dstGasFee).mul(symbolPrice || 0).toString();

    return {
      dstGasFee,
      feeQty: dstGasFee,
      feeAmount,
      dp: feeDecimalsOffset(4),
    };
  }, [depositFee, symbolPrice]);

  return { ...feeProps, nativeSymbol };
}
