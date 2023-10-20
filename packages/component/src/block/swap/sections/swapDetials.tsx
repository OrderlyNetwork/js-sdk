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
  nativeToken: API.TokenInfo;
  // transactionData: any;
}

export const SwapDetails: FC<Props> = (props) => {
  const { info, mode, nativePrice } = props;

  console.log("swap details", props);

  return (
    <>
      <div className="text-sm space-y-3 py-[24px]">
        <ListTile
          className="py-0"
          tailing={
            <div className="flex items-center gap-1 text-primary-light">
              <Fuel size={14} />
              <Numeral
                unit={props.nativeToken?.symbol}
                precision={props.nativeToken.woofi_dex_precision + 3}
                truncate="round"
                padding={false}
              >
                {info.dstGasFee}
              </Numeral>
              <span className="text-primary-light/50">{`($${new Decimal(
                info.dstGasFee
              )
                .mul(props.nativePrice)
                .toFixed(2)
                .toString()})`}</span>
            </div>
          }
        >
          <span className="text-base-contrast/50">Destination gas fee</span>
        </ListTile>

        <ListTile
          className="py-0"
          tailing={
            <div className="flex items-center gap-1">
              <Numeral
                unit={props.src.token}
                padding={false}
                precision={props.src.displayDecimals + 3}
              >
                {info.swapFee}
              </Numeral>
              <span className="text-base-contrast/50">{`($${new Decimal(
                info.swapFee
              )
                .mul(props.markPrice)
                .toFixed(2)
                .toString()})`}</span>
            </div>
          }
        >
          <span className="text-base-contrast/50">Swap fee</span>
        </ListTile>
        {mode === SwapMode.Cross && (
          <ListTile
            className="py-0"
            tailing={
              <div className="flex items-center gap-1">
                <Numeral
                  unit={props.src.token}
                  precision={props.src.displayDecimals + 3}
                  padding={false}
                >
                  {info.bridgeFee}
                </Numeral>
                <span className="text-base-contrast/50">{`($${new Decimal(
                  info.bridgeFee
                )
                  .mul(props.markPrice)
                  .toFixed(2)
                  .toString()})`}</span>
              </div>
            }
          >
            <span className="text-base-contrast/50">Bridge fee</span>
          </ListTile>
        )}

        <ListTile
          className="py-0"
          tailing={
            <Numeral
              unit={props.dst.token}
              padding={false}
              precision={props.dst.displayDecimals}
            >
              {info.received}
            </Numeral>
          }
        >
          <span className="text-base-contrast/50">Minimum received</span>
        </ListTile>
        <ListTile
          className="py-0"
          tailing={`1 ${props.src.token} = ${info.price} ${props.dst.token}`}
        >
          <span className="text-base-contrast/50">Price</span>
        </ListTile>
        <ListTile className="py-0" tailing="1%">
          <span className="text-base-contrast/50">Slippage tolerance</span>
        </ListTile>
      </div>
      <Button fullWidth onClick={() => props.onConfirm()}>
        Confirm to swap
      </Button>
    </>
  );
};
