import { useCallback, useEffect, useMemo } from "react";
import {
  useAccount,
  useConfig,
  useDeposit,
  useHoldingStream,
  useIndexPrice,
  useIndexPricesStream,
  useLocalStorage,
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
  useToken_v2,
} from "./hooks";

const ORDERLY_DEPOSIT_SLIPPAGE_KEY = "ORDERLY_DEPOSIT_SLIPPAGE";

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

  const {
    sourceToken,
    targetToken,
    sourceTokens,
    targetTokens,
    onSourceTokenChange,
    onTargetTokenChange,
  } = useToken_v2({ currentChain });

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
    address: sourceToken?.address,
    decimals: sourceToken?.decimals,
    srcChainId: currentChain?.id,
    srcToken: sourceToken?.symbol,
  });

  const maxQuantity = useMemo(
    () =>
      new Decimal(balance || 0)
        .todp(sourceToken?.precision ?? 2, Decimal.ROUND_DOWN)
        .toString(),
    [balance, sourceToken?.precision],
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
    !sourceToken ||
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

  const {
    collateralRatio,
    targetQuantity,
    currentLTV,
    nextLTV,
    indexPrice,
    slippage,
    setSlippage,
    minimumReceived,
  } = useCollateralValue({
    tokens: sourceTokens,
    sourceToken: sourceToken,
    targetToken: targetToken,
    qty: quantity,
  });

  const {
    ltv_threshold,
    negative_usdc_threshold,
    isLoading: isConvertThresholdLoading,
  } = useConvertThreshold();

  useEffect(() => {
    cleanData();
  }, [sourceToken, currentChain?.id]);

  return {
    sourceToken,
    targetToken,

    sourceTokens,
    targetTokens,

    onSourceTokenChange,
    onTargetTokenChange,

    amount,
    isNativeToken,
    sourceQuantity: quantity,
    targetQuantity: targetQuantity,
    maxQuantity,
    indexPrice,
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
    currentLTV,
    nextLTV,
    ltv_threshold,
    negative_usdc_threshold,
    isConvertThresholdLoading,
    slippage,
    setSlippage,
    minimumReceived,
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
  sourceToken?: API.TokenInfo;
  targetToken?: API.TokenInfo;
  qty: string;
}) => {
  const { sourceToken, targetToken, tokens } = params;

  const qty = Number(params.qty);

  const { data: holdingData, usdc } = useHoldingStream();
  const { data: indexPrices } = useIndexPricesStream();
  const [data] = usePositionStream(sourceToken?.symbol);
  const aggregated = useDataTap(data.aggregated);
  const unrealPnL = aggregated?.total_unreal_pnl ?? 0;

  const usdcBalance = usdc?.holding ?? 0;

  const indexPrice = useMemo(() => {
    if (sourceToken?.symbol === "USDC") {
      return 1;
    }
    const symbol = `PERP_${sourceToken?.symbol}_USDC`;
    return indexPrices[symbol] ?? 0;
  }, [sourceToken?.symbol, indexPrices]);

  const getCollateralRatio = useCallback(
    (collateralQty: number) => {
      return account.collateralRatio({
        baseWeight: targetToken?.base_weight ?? 0,
        discountFactor: targetToken?.discount_factor ?? 0,
        collateralQty: collateralQty,
        indexPrice: indexPrice,
      });
    },
    [targetToken, indexPrice],
  );

  const targetQuantity = account.collateralContribution({
    collateralQty: qty,
    collateralRatio: getCollateralRatio(qty),
    indexPrice: indexPrice,
  });

  const getLTV = useCallback(
    (collRatio: number) => {
      return account.LTV({
        usdcBalance: usdcBalance,
        upnl: unrealPnL,
        collateralAssets: tokens.map((item) => {
          const qtyData = holdingData?.find((h) => h.token === item.symbol);
          const indexPrice =
            item.symbol === "USDC" ? 1 : indexPrices[item.symbol];
          return {
            qty: qtyData?.holding ?? 0,
            indexPrice: indexPrice ?? 0,
            weight: collRatio,
          };
        }),
      });
    },
    [holdingData, usdcBalance, unrealPnL, tokens, indexPrices],
  );

  const [slippage, setSlippage] = useLocalStorage(
    ORDERLY_DEPOSIT_SLIPPAGE_KEY,
    "1",
    {
      parseJSON: (value: string | null) => {
        return !value || value === '""' ? "1" : JSON.parse(value);
      },
    },
  );

  const minimumReceived = account.calcMinimumReceived({
    amount: targetQuantity,
    slippage,
  });

  return {
    slippage,
    setSlippage,
    collateralRatio: getCollateralRatio(qty),
    targetQuantity,
    currentLTV: getLTV(getCollateralRatio(qty)),
    nextLTV: getLTV(getCollateralRatio(0)),
    indexPrice,
    minimumReceived,
  };
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

export const useCollateralRatio = (inputs: {
  token?: API.TokenInfo;
  indexPrice: number;
}) => {
  const { token, indexPrice } = inputs;
  return useCallback(
    (qty: number) => {
      return account.collateralRatio({
        baseWeight: token?.base_weight ?? 0,
        discountFactor: token?.discount_factor ?? 0,
        collateralQty: qty,
        indexPrice,
      });
    },
    [token, indexPrice],
  );
};

export const useTargetQuantity = () => {
  return useCallback((qty: number, ratio: number, indexPrice: number) => {
    return account.collateralContribution({
      collateralQty: qty,
      collateralRatio: ratio,
      indexPrice,
    });
  }, []);
};
