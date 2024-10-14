import { useMemo } from "react";
import { useIndexPrice } from "@orderly.network/hooks";
import { API } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
import { TransactionInfo } from "./useSwapEnquiry";
import { feeDecimalsOffset } from "@orderly.network/ui-transfer";

export type UseSwapFee = ReturnType<typeof useSwapFee>;

type FeeQty = {
  value: string | number;
  dp: number;
  symbol?: string;
};

export function useSwapFee(options: {
  nativeToken?: API.TokenInfo;
  isNativeToken?: boolean;
  src?: API.TokenInfo;
  depositFee?: bigint;
  transactionInfo: TransactionInfo;
  needSwap: boolean;
  needCrossSwap: boolean;
}) {
  const {
    nativeToken,
    isNativeToken,
    src,
    depositFee = 0,
    transactionInfo,
    needSwap,
    needCrossSwap,
  } = options;

  const nativeSymbol = nativeToken?.symbol;
  const srcSymbol = src?.symbol;

  const {
    fee = "0",
    swapFee = "0",
    bridgeFee = "0",
    dstGasFee: destinationGasFee = "0",
    markPrices,
  } = transactionInfo;

  const { from_token: markPrice, native_token: nativeMarkPrice } = markPrices;

  const { data: symbolPrice } = useIndexPrice(`SPOT_${nativeSymbol}_USDC`);

  const feeInfo = useMemo(() => {
    let feeAmount = "";
    let feeQtys: FeeQty[] = [];

    const nativeDp = feeDecimalsOffset(
      (nativeToken as any)?.woofi_dex_precision
    );

    const srcDp = feeDecimalsOffset((src as any)?.woofi_dex_precision);

    const dstGasFee = needCrossSwap
      ? destinationGasFee
      : new Decimal(depositFee.toString())
          .div(new Decimal(10).pow(18))
          .toString();

    if (!needSwap && !needCrossSwap) {
      feeQtys = [
        {
          value: dstGasFee,
          dp: nativeDp,
        },
      ];

      feeAmount = new Decimal(dstGasFee).mul(symbolPrice || 0).toString();
    }

    if (needSwap || needCrossSwap) {
      // if native token, Destination gas fee、fee (Swap fee + Bridge fee ) will use a same symbol unit
      if (isNativeToken) {
        const totalQuantity = new Decimal(dstGasFee).plus(fee);

        feeQtys = [
          {
            value: totalQuantity.toString(),
            dp: nativeDp,
          },
        ];

        feeAmount = totalQuantity.mul(nativeMarkPrice ?? 1).toString();
      } else {
        feeQtys = [
          {
            value: dstGasFee,
            dp: nativeDp,
            symbol: nativeSymbol,
          },
          {
            value: fee,
            dp: srcDp,
            symbol: srcSymbol,
          },
        ];

        feeAmount = new Decimal(dstGasFee)
          .mul(nativeMarkPrice ?? 1)
          .plus(new Decimal(fee).mul(markPrice ?? 1))
          .toString();
      }
    }

    feeQtys = feeQtys.filter(
      (item) => !!item.value && Number(item.value) !== 0
    );

    const feeDetails = [
      {
        title: "Destination gas fee",
        description:
          "Additional gas tokens are required to cover operations on the destination chain.",
        value: dstGasFee,
        dp: nativeDp,
        symbol: nativeSymbol,
      },
      {
        title: "Swap fee",
        description: "WOOFi charges a 0.025% on each swap.",
        value: swapFee,
        dp: srcDp,
        symbol: srcSymbol,
      },
      {
        title: "Bridge fee",
        description: "Stargate charges a fee to bridge your assets.",
        value: bridgeFee,
        dp: srcDp,
        symbol: srcSymbol,
      },
    ].filter(
      // alway show Destination gas fee
      (item, index) => index === 0 || (!!item.value && Number(item.value) !== 0)
    );

    return {
      feeAmount,
      feeQtys,
      feeDetails,
    };
  }, [
    depositFee,
    symbolPrice,
    nativeSymbol,
    srcSymbol,
    transactionInfo,
    needSwap,
    needCrossSwap,
  ]);

  return {
    ...feeInfo,
    nativeSymbol,
  };
}
