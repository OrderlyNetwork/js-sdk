import Button from "@/button";
import { ListTile } from "@/listView";
import { Fuel } from "lucide-react";
import { FC, useMemo } from "react";
import type { SymbolInfo } from "./symbols";
import { Numeral } from "@/text";
import { SwapMode } from "./misc";
import { parseNumber } from "@/utils/num";
import { Decimal } from "@orderly.network/utils";
import { API } from "@orderly.network/types";

export interface SwapInfo {
  // gasFee: string;
  // tradingFee: string;
  dstGasFee: string;
  swapFee: string;
  bridgeFee: string;
  price: number;
  slippage: number;
  received: string;
}

interface Props {
  onConfirm: () => void;
  mode: SwapMode;
  src: SymbolInfo;
  dst: SymbolInfo;
  info: SwapInfo;
  markPrice: number;
  nativePrice: number;
  nativeToken?: API.TokenInfo;
  // transactionData: any;
}

export const SwapDetails: FC<Props> = (props) => {
  const { info, mode, nativePrice } = props;

  return (
    <>
      <div className="orderly-text-4xs orderly-space-y-3 orderly-py-[24px]">
        <ListTile
          className="orderly-py-0 hover:orderly-bg-transparent"
          tailing={
            <div className="orderly-flex orderly-items-center orderly-gap-1 orderly-text-primary-light orderly-text-4xs">
              <Fuel size={14} />
              <Numeral
                unit={props.nativeToken?.symbol}
                precision={props.nativeToken?.woofi_dex_precision ?? 2 + 3}
                truncate="round"
                padding={false}
              >
                {info.dstGasFee}
              </Numeral>
              <span className="orderly-text-primary-light/60">{`($${new Decimal(
                info.dstGasFee
              )
                .mul(props.nativePrice)
                .toFixed(2)
                .toString()})`}</span>
            </div>
          }
        >
          <span className="orderly-text-base-contrast-36">Destination gas fee</span>
        </ListTile>

        <ListTile
          className="orderly-py-0 hover:orderly-bg-transparent"
          tailing={
            <div className="orderly-flex orderly-items-center orderly-gap-1 orderly-text-4xs">
              <Numeral
                unit={props.src.token}
                padding={false}
                precision={props.src.displayDecimals + 3}
              >
                {info.swapFee}
              </Numeral>
              <span className="orderly-text-base-contrast-36">{`($${new Decimal(
                info.swapFee
              )
                .mul(props.markPrice)
                .toFixed(2)
                .toString()})`}</span>
            </div>
          }
        >
          <span className="orderly-text-base-contrast-36">Swap fee</span>
        </ListTile>
        {mode === SwapMode.Cross && (
          <ListTile
            className="orderly-py-0 hover:orderly-bg-transparent"
            tailing={
              <div className="orderly-flex orderly-items-center orderly-gap-1 orderly-text-4xs">
                <Numeral
                  unit={props.src.token}
                  precision={props.src.displayDecimals + 3}
                  padding={false}
                >
                  {info.bridgeFee}
                </Numeral>
                <span className="orderly-text-base-contrast-36">{`($${new Decimal(
                  info.bridgeFee
                )
                  .mul(props.markPrice)
                  .toFixed(2)
                  .toString()})`}</span>
              </div>
            }
          >
            <span className="orderly-text-base-contrast-36">Bridge fee</span>
          </ListTile>
        )}

        <ListTile
          className="orderly-py-0 hover:orderly-bg-transparent"
          tailing={
            <Numeral
              unit={props.dst.token}
              padding={false}
              precision={props.dst.displayDecimals}
              className="orderly-text-4xs"
            >
              {info.received}
            </Numeral>
          }
        >
          <span className="orderly-text-base-contrast-36">Minimum received</span>
        </ListTile>
        <ListTile
          className="orderly-py-0 orderly-text-4xs hover:orderly-bg-transparent"
          tailing={`1 ${props.src.token} = ${parseNumber(info.price, {
            rule: "price",
            precision: 3,
          })} ${props.dst.token}`}
        >
          <span className="orderly-text-base-contrast-36">Price</span>
        </ListTile>
        <ListTile className="orderly-py-0 hover:orderly-bg-transparent" tailing={
          <span className="orderly-text-4xs">1%</span>
        }>
          <span className="orderly-text-base-contrast-36">Slippage tolerance</span>
        </ListTile>
      </div>
      <Button id="orderly-swap-config-button" className="orderly-text-xs" fullWidth onClick={() => props.onConfirm()}>
        Confirm swap
      </Button>
    </>
  );
};
