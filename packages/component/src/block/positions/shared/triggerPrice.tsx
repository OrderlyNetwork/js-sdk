import { Numeral } from "@/text/numeral";
import { utils } from "@orderly.network/hooks";
import { API, AlgoOrderType, OrderSide } from "@orderly.network/types";
import { FC } from "react";

export const TriggerPriceItem: FC<{
  qty: number;
  price: number;
  entryPrice: number;
  orderSide: OrderSide;
  orderType: AlgoOrderType;
  symbolInfo: API.SymbolExt;
}> = (props) => {
  const { qty, price, entryPrice, orderSide, orderType, symbolInfo } = props;
  const pnl = utils.priceToPnl(
    {
      qty,
      price,
      entryPrice,
      orderSide,
      orderType,
    },
    {
      symbol: symbolInfo,
    }
  );

  const type = orderType === AlgoOrderType.TAKE_PROFIT ? "TP" : "SL";

  return (
    <div className="orderly-flex orderly-items-center">
      <span className="orderly-text-base-contrast-54 orderly-mr-1">{`${type} PnL:`}</span>
      <Numeral
        rule="price"
        className={
          pnl === 0
            ? "orderly-text-base-contrast-36"
            : pnl > 0
            ? "orderly-text-trade-profit orderly-gap-0"
            : "orderly-text-trade-loss orderly-gap-0"
        }
        prefix={
          // @ts-ignore
          <span>{pnl === 0 ? "" : pnl > 0 ? "+" : "-"}</span>
        }
        surfix={
          <span className="orderly-text-base-contrast-36 orderly-ml-1">
            USDC
          </span>
        }
      >{`${Math.abs(pnl)}`}</Numeral>
    </div>
  );
};
