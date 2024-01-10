import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { API } from "@orderly.network/types";
import { Decimal, zero } from "@orderly.network/utils";
import { MarkPrices } from "./misc";
import { parseNumber } from "@/utils/num";
import { InfoIcon } from "@/icon";
import { modal } from "@/modal";
import { Divider } from "@/divider";
import { SlippageSetting } from "./slippageSetting";
import { feeDecimalsOffset } from "../utils";

export interface SummaryProps {
  onSlippageChange?: (slippage: number) => void;
  slippage: number;
  needSwap?: boolean;
  needCrossChain?: boolean;
  isNativeToken?: boolean;
  nativeToken?: API.TokenInfo;
  src?: API.TokenInfo;
  dst: Partial<API.TokenInfo>;
  price?: number;
  markPrices: MarkPrices;
  fee?: string;
  swapFee?: string;
  destinationGasFee?: string;
  bridgeFee?: string;
  symbolPrice: Record<string, number>;
  depositFee?: bigint;
}

export const Summary: FC<SummaryProps> = (props) => {
  const {
    needCrossChain,
    needSwap,
    fee,
    // markPrice,
    swapFee = "0",
    bridgeFee = "0",
    nativeToken,
    markPrices,
    destinationGasFee = "0",
    slippage,
    onSlippageChange,
    symbolPrice,
    depositFee = 0n,
  } = props;

  const { from_token: markPrice, native_token: nativeMarkPrice } = markPrices;

  const feeElement = useMemo(() => {
    let dstGasFee = new Decimal(depositFee.toString())
      ?.div(new Decimal(10).pow(18))
      .toString();
    if (needSwap && needCrossChain) {
      dstGasFee = destinationGasFee;
    }

    if (!needSwap && !needCrossChain) {
      const tokenPrice = symbolPrice?.[nativeToken?.symbol!];
      const totalFee = new Decimal(dstGasFee)
        ?.mul(tokenPrice || 0)
        ?.toFixed(3, Decimal.ROUND_UP);
      return `Fee ≈ $ ${totalFee || 0} ${
        Number(depositFee)
          ? `(${new Decimal(dstGasFee).toFixed(
              feeDecimalsOffset(nativeToken?.woofi_dex_precision ?? 2),
              Decimal.ROUND_UP
            )} ETH)`
          : ""
      }`;
    }

    if (!fee || fee === "0") {
      return `Fee ≈ $0`;
    }

    if (!markPrice || !nativeMarkPrice) {
      return `Fee ≈ - ${props.src?.symbol}`;
    }

    let text = "";
    let textArr = [];
    let d = zero;

    if (props.isNativeToken) {
      if (!!dstGasFee) {
        const total = new Decimal(dstGasFee).plus(fee ?? 0);
        text = `${total.todp(
          (nativeToken?.woofi_dex_precision ?? 2) + 3,
          Decimal.ROUND_HALF_EVEN
        )} ${nativeToken?.symbol}`;

        d = total.mul(nativeMarkPrice ?? 1);
      }
    } else {
      if (!!dstGasFee && dstGasFee !== "0") {
        textArr.push(
          `${parseNumber(dstGasFee, {
            precision: (nativeToken?.woofi_dex_precision ?? 2) + 3,
            truncate: "round",
          })} ${nativeToken?.symbol}`
        );

        d = d.plus(new Decimal(dstGasFee).mul(nativeMarkPrice ?? 1));
      }

      if (!!fee) {
        textArr.push(
          `${parseNumber(fee, {
            precision: (props.src?.woofi_dex_precision ?? 2) + 3,
            truncate: "round",
          })} ${props.src?.symbol}`
        );

        d = d.plus(new Decimal(fee).mul(markPrice ?? 1));
      }

      text = textArr.join(" + ");
    }

    return `Fee ≈ $${d.toFixed(3, Decimal.ROUND_UP)} (${text})`;
  }, [
    needCrossChain,
    needSwap,
    fee,
    props.src?.symbol,
    markPrice,
    nativeMarkPrice,
    nativeToken?.symbol,
    symbolPrice,
  ]);

  const onShowFee = useCallback(() => {
    const message = [];
    let dstGasFee = new Decimal(depositFee.toString())
      ?.div(new Decimal(10).pow(18))
      .toString();
    if (needSwap && needCrossChain) {
      dstGasFee = destinationGasFee;
    }

    if (dstGasFee) {
      message.push(
        <>
          <div>
            Destination gas fee:
            <span className="orderly-text-base-contrast/60 orderly-mx-2">{`${parseNumber(
              dstGasFee.toString(),
              {
                precision: feeDecimalsOffset(
                  nativeToken?.woofi_dex_precision ?? 2
                ),
                truncate: "round",
              }
            )} ${nativeToken?.symbol}`}</span>
          </div>
          <div>
            Additional gas tokens are required to cover operations on the
            destination chain.
          </div>
          <Divider />
        </>
      );
    }

    if (swapFee && Number(swapFee) !== 0) {
      message.push(
        <>
          <div>
            Swap fee:
            <span className="orderly-text-base-contrast/60 orderly-mx-2">{`${parseNumber(
              swapFee,
              {
                precision: feeDecimalsOffset(props.src?.woofi_dex_precision),
                truncate: "round",
              }
            )} ${props.src?.symbol}`}</span>
          </div>
          <div>WOOFi charges a 0.025% on each swap.</div>
          <Divider />
        </>
      );
    }

    if (bridgeFee && Number(bridgeFee) !== 0) {
      message.push(
        <>
          <div>
            Bridge fee:
            <span className="orderly-text-base-contrast/60 orderly-mx-2">{`${parseNumber(
              bridgeFee,
              {
                precision: feeDecimalsOffset(props.src?.woofi_dex_precision),
                truncate: "round",
              }
            )} ${props.src?.symbol}`}</span>
          </div>
          <div>Stargate charges a fee to bridge your assets.</div>
          <Divider />
        </>
      );
    }

    modal.alert({
      title: "Fee",
      message: (
        <div className="orderly-text-base-contrast/30 orderly-space-y-3 orderly-text-3xs desktop:orderly-text-xs">
          {message}
        </div>
      ),
    });
  }, [
    destinationGasFee,
    swapFee,
    bridgeFee,
    nativeToken?.symbol,
    props.src?.symbol,
    depositFee,
  ]);

  return (
    <div className="orderly-flex-1 orderly-text-4xs orderly-text-base-contrast-36 desktop:orderly-text-3xs">
      <div className="orderly-flex orderly-items-center orderly-justify-between">
        <div>
          {`1 ${props.src?.symbol} = ${
            props.price
              ? parseNumber(props.price, {
                  precision: 3,
                  rule: "price",
                })
              : "-"
          } ${props.dst.symbol}`}
        </div>
        {needSwap ? (
          <SlippageSetting
            slippage={slippage}
            onSlippageChange={onSlippageChange}
          />
        ) : null}
      </div>
      <div
        className="orderly-mt-1 orderly-inline-flex orderly-items-center"
        onClick={onShowFee}
      >
        <InfoIcon size={14} className="orderly-mr-1" />

        <span>{feeElement}</span>
      </div>
    </div>
  );
};
