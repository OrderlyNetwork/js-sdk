import { useCallback, useEffect, useMemo } from "react";
import {
  useAccount,
  useConfig,
  useDeposit,
  useIndexPrice,
  useIndexPricesStream,
} from "@orderly.network/hooks";
import { account } from "@orderly.network/perp";
import { useAppContext } from "@orderly.network/react-app";
import { API, NetworkId, ChainNamespace } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
import { feeDecimalsOffset } from "../../utils";
import {
  useActionType,
  useChainSelect,
  useDepositAction,
  useInputStatus,
  useToken,
} from "./hooks";

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

  const { tokens, fromToken, toToken, onFromTokenChange, onToTokenChange } =
    useToken({ currentChain });

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
    address: fromToken?.address,
    decimals: fromToken?.decimals,
    srcChainId: currentChain?.id,
    srcToken: fromToken?.symbol,
  });

  const maxQuantity = useMemo(
    () =>
      new Decimal(balance || 0)
        .todp(fromToken?.precision ?? 2, Decimal.ROUND_DOWN)
        .toString(),
    [balance, fromToken],
  );

  const { inputStatus, hintMessage } = useInputStatus({
    quantity,
    maxQuantity,
  });

  const cleanData = useCallback(() => {
    setQuantity("");
  }, [setQuantity]);

  const onSuccess = useCallback(() => {
    cleanData();
    options.onClose?.();
  }, [cleanData, options.onClose]);

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
    !fromToken ||
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

  const toQuantity = useCollateralValue({
    token: fromToken,
    qty: quantity,
  });

  useEffect(() => {
    cleanData();
  }, [fromToken, currentChain?.id]);

  return {
    fromToken,
    toToken,
    tokens,
    onFromTokenChange,
    onToTokenChange,
    amount,
    fromQty: quantity,
    toQty: toQuantity,
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
  const { account } = useAccount();

  const nativeSymbol = nativeToken?.symbol;

  const { data: symbolPrice } = useIndexPrice(`SPOT_${nativeSymbol}_USDC`);

  const feeProps = useMemo(() => {
    const dstGasFee = new Decimal(depositFee.toString())
      // todo solana is 9, evm is 18
      .div(
        new Decimal(10).pow(
          account.walletAdapter?.chainNamespace === ChainNamespace.solana
            ? 9
            : 18,
        ),
      )
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

const useCollateralValue = (params: { token?: API.TokenInfo; qty: string }) => {
  const { token, qty } = params;

  const { data: indexPrices } = useIndexPricesStream();

  const indexPrice = useMemo(() => {
    if (token?.symbol === "USDC") {
      return 1;
    }
    const symbol = `PERP_${token?.symbol}_USDC`;
    return indexPrices[symbol] ?? 0;
  }, [token, indexPrices]);

  const collateralRatio = account.collateralRatio({
    baseWeight: 2, // from API v1/public/token
    discountFactor: 3, // from API v1/public/token
    collateralQty: Number(qty),
    indexPrice: indexPrice,
  });

  const toQuantity = account.collateralContribution({
    collateralQty: Number(qty),
    collateralRatio: collateralRatio,
    indexPrice: indexPrice,
  });

  return toQuantity;
};
