import { useCallback, useEffect, useMemo } from "react";
// import { console } from "inspector";
import {
  useAccount,
  useConfig,
  useDeposit,
  useHoldingStream,
  useIndexPrice,
  useIndexPricesStream,
  usePositionStream,
  useQuery,
} from "@orderly.network/hooks";
import { account } from "@orderly.network/perp";
import { useAppContext, useDataTap } from "@orderly.network/react-app";
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

  const { collateralRatio, toQuantity, ltv } = useCollateralValue({
    tokens: tokens,
    fromToken: fromToken,
    toToken: toToken,
    qty: quantity,
  });

  const {
    ltv_threshold,
    negative_usdc_threshold,
    isLoading: isConvertThresholdLoading,
  } = useConvertThreshold();

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
    collateralRatio,
    ltv,
    ltv_threshold,
    negative_usdc_threshold,
    isConvertThresholdLoading,
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

const useCollateralValue = (params: {
  tokens: API.TokenInfo[];
  fromToken?: API.TokenInfo;
  toToken?: API.TokenInfo;
  qty: string;
}) => {
  const { fromToken, toToken, qty, tokens } = params;

  const { data: holdingData, usdc } = useHoldingStream();
  const { data: indexPrices } = useIndexPricesStream();
  const [data] = usePositionStream(fromToken?.symbol);
  const aggregated = useDataTap(data.aggregated);
  const unrealPnL = aggregated?.total_unreal_pnl ?? 0;

  const usdcBalance = usdc?.holding ?? 0;

  const indexPrice = useMemo(() => {
    if (fromToken?.symbol === "USDC") {
      return 1;
    }
    const symbol = `PERP_${fromToken?.symbol}_USDC`;
    return indexPrices[symbol] ?? 0;
  }, [fromToken?.symbol, indexPrices]);

  const collateralRatio = account.collateralRatio({
    baseWeight: toToken?.base_weight ?? 0,
    discountFactor: toToken?.discount_factor ?? 0,
    collateralQty: Number(qty),
    indexPrice: indexPrice,
  });

  const toQuantity = account.collateralContribution({
    collateralQty: Number(qty),
    collateralRatio: collateralRatio,
    indexPrice: indexPrice,
  });

  const ltv = account.LTV({
    usdcBalance: usdcBalance,
    upnl: unrealPnL,
    collateralAssets: tokens.map((item) => {
      const qty = holdingData?.find((h) => h.token === item.symbol)?.holding;
      const indexPrice = item.symbol === "USDC" ? 1 : indexPrices[item.symbol];
      return {
        qty: qty ?? 0,
        indexPrice: indexPrice ?? 0,
        weight: collateralRatio,
      };
    }),
  });

  return { collateralRatio, toQuantity, ltv: ltv };
};

const useConvertThreshold = () => {
  const { data, error, isLoading } = useQuery<API.ConvertThreshold>(
    "/v1/public/auto_convert_threshold",
    {
      errorRetryCount: 3,
    },
  );
  return {
    ltv_threshold: data?.ltv_threshold,
    negative_usdc_threshold: data?.negative_usdc_threshold,
    isLoading,
    error,
  } as const;
};
