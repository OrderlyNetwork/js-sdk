import { FC, memo, useCallback } from "react";
import { API } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
import { parseNumber } from "@/utils/num";
import { InfoIcon } from "@/icon";
import { modal } from "@orderly.network/ui";
import { Divider } from "@/divider";
import { feeDecimalsOffset } from "../utils";
import { useIndexPrice } from "@orderly.network/hooks";
export interface SummaryProps {
  nativeToken?: API.TokenInfo;
  src?: API.TokenInfo;
  dst: Partial<API.TokenInfo>;
  price?: number;
  depositFee?: bigint;
}

export const Summary: FC<SummaryProps> = memo((props) => {
  const { nativeToken, depositFee = 0n } = props;
  const { data: symbolPrice } = useIndexPrice(
    `SPOT_${nativeToken?.symbol}_USDC`
  );

  const dstGasFee = new Decimal(depositFee.toString())
    ?.div(new Decimal(10).pow(18))
    .toString();

  const feeAmount = `${new Decimal(dstGasFee).toFixed(
    feeDecimalsOffset(4),
    Decimal.ROUND_UP
  )} ${nativeToken?.symbol}`;

  // Using useMemo causes a delay in data display
  const getFeeElement = () => {
    const totalFee = new Decimal(dstGasFee)
      ?.mul(symbolPrice || 0)
      ?.toFixed(3, Decimal.ROUND_UP);

    return `Fee ≈ $ ${totalFee || 0} ${
      Number(depositFee) ? `(${feeAmount})` : ""
    }`;
  };

  const onShowFee = useCallback(() => {
    const message = [];
    let dstGasFee = new Decimal(depositFee.toString())
      ?.div(new Decimal(10).pow(18))
      .toString();

    if (dstGasFee) {
      message.push(
        <>
          <div>
            Destination gas fee:
            <span className="orderly-text-base-contrast/60 orderly-mx-2">
              {feeAmount}
            </span>
          </div>
          <div>
            Additional gas tokens are required to cover operations on the
            destination chain.
          </div>
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
  }, [nativeToken?.symbol, props.src?.symbol, depositFee]);

  return (
    <div className="orderly-flex-1 orderly-text-4xs orderly-text-base-contrast-36 desktop:orderly-text-3xs">
      <div className="orderly-flex orderly-items-center orderly-justify-between">
        <div>
          {`1 ${props.src?.display_name || props.src?.symbol || "USDC"} = ${
            props.price
              ? parseNumber(props.price, {
                  precision: 3,
                  rule: "price",
                })
              : "-"
          } ${props.dst.symbol || "USDC"}`}
        </div>
      </div>
      <div
        className="orderly-mt-1 orderly-inline-flex orderly-items-center"
        onClick={onShowFee}
      >
        <InfoIcon size={14} className="orderly-mr-1" />

        <span>{getFeeElement()}</span>
      </div>
    </div>
  );
});
