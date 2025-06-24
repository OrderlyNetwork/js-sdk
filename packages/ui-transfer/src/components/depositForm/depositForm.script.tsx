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

// TODO: 需要替换成真实数据
const hardCode = [
  {
    token: "USDC",
    decimals: 6,
    minimum_withdraw_amount: 0.000001,
    base_weight: 1,
    discount_factor: null,
    haircut: 0,
    user_max_qty: -1,
    is_collateral: true,
    display_name: "USDC",
    address: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
    symbol: "USDC",
  },
  {
    token: "ETH",
    decimals: 6,
    minimum_withdraw_amount: 0.000001,
    base_weight: 1,
    discount_factor: null,
    haircut: 0,
    user_max_qty: -1,
    is_collateral: true,
    display_name: "ETH",
    address: "",
    symbol: "ETH",
  },
  {
    token: "USDT",
    decimals: 6,
    minimum_withdraw_amount: 0.000001,
    base_weight: 1,
    discount_factor: null,
    haircut: 0,
    user_max_qty: -1,
    is_collateral: true,
    display_name: "USDT",
    address: "0xEf54C221Fc94517877F0F40eCd71E0A3866D66C2",
    symbol: "USDT",
  },
];

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
    token: fromToken,
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

const useCollateralValue = (params: { token?: API.TokenInfo; qty: string }) => {
  const { token, qty } = params;

  const { data: holdingData, usdc } = useHoldingStream();
  const { data: indexPrices } = useIndexPricesStream();
  const [data] = usePositionStream(token?.symbol);
  const aggregated = useDataTap(data.aggregated);
  const unrealPnL = aggregated?.total_unreal_pnl ?? 0;

  const usdcBalance = usdc?.holding ?? 0;

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

  const ltv = account.LTV({
    usdcBalance: usdcBalance,
    upnl: unrealPnL,
    collateralAssets: hardCode.map((item) => {
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
