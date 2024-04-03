import { Numeral } from "@/text/numeral";
import { utils } from "@orderly.network/hooks";
import { API, AlgoOrderType, OrderSide } from "@orderly.network/types";
import { Minus, Plus } from "lucide-react";
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
      <span className="orderly-text-base-contrast-54 orderly-mr-1">
        {`${type} PNL:`}
      </span>
      <Numeral
        rule="price"
        className={
          pnl > 0
            ? "orderly-text-trade-profit orderly-gap-0"
            : "orderly-text-trade-loss orderly-gap-0"
        }
        prefix={
          // @ts-ignore
          <span>{pnl > 0 ? <Plus size={10} /> : <Minus size={10} />}</span>
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
