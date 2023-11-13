import { FC, useCallback, useMemo, useState } from "react";
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
}

export const Summary: FC<SummaryProps> = (props) => {
  const {
    needCrossChain,
    needSwap,
    fee,
    // markPrice,
    swapFee,
    bridgeFee,
    nativeToken,
    markPrices,
    destinationGasFee,
    slippage,
    onSlippageChange,
  } = props;

  const { from_token: markPrice, native_token: nativeMarkPrice } = markPrices;

  const feeElement = useMemo(() => {
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
      if (!!destinationGasFee) {
        const total = new Decimal(destinationGasFee).plus(fee ?? 0);
        text = `${total.todp(
          (nativeToken?.woofi_dex_precision ?? 2) + 3,
          Decimal.ROUND_HALF_EVEN
        )} ${nativeToken?.symbol}`;

        d = total.mul(nativeMarkPrice ?? 1);
      }
    } else {
      if (!!destinationGasFee && destinationGasFee !== "0") {
        textArr.push(
          `${parseNumber(destinationGasFee, {
            precision: (nativeToken?.woofi_dex_precision ?? 2) + 3,
            truncate: "round",
          })} ${nativeToken?.symbol}`
        );

        d = d.plus(new Decimal(destinationGasFee).mul(nativeMarkPrice ?? 1));
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

    return `Fee ≈ $${d.toFixed(2)} (${text})`;
  }, [
    needCrossChain,
    needSwap,
    fee,
    props.src?.symbol,
    markPrice,
    nativeMarkPrice,
    nativeToken?.symbol,
  ]);

  const onShowFee = useCallback(() => {
    const message = [];
    if (destinationGasFee) {
      message.push(
        <>
          <div>
            Destination gas fee:
            <span className="text-base-contrast/60 mx-2">{`${parseNumber(
              destinationGasFee,
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

    if (swapFee) {
      message.push(
        <>
          <div>
            Swap fee:
            <span className="text-base-contrast/60 mx-2">{`${parseNumber(
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

    if (bridgeFee) {
      message.push(
        <>
          <div>
            Bridge fee:
            <span className="text-base-contrast/60 mx-2">{`${parseNumber(
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
        <div className="text-base-contrast/30 space-y-3 text-3xs">{message}</div>
      ),
    });
  }, [
    destinationGasFee,
    swapFee,
    bridgeFee,
    nativeToken?.symbol,
    props.src?.symbol,
  ]);

  return (
    <div className={"flex-1"}>
      <div className="flex items-center justify-between">
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
      <div className="mt-1 inline-flex items-center" onClick={onShowFee}>
        <InfoIcon size={14} className="mr-1" />

        <span>{feeElement}</span>
      </div>
    </div>
  );
};
