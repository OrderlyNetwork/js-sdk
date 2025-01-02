import { OrderType } from "@orderly.network/types";
import { MarketOrderCreator } from "./marketOrderCreator";
import { LimitOrderCreator } from "./limitOrderCreator";
import { StopLimitOrderCreator } from "./stopLimitOrderCreator";
import { OrderCreator } from "./interface";
import { GeneralOrderCreator } from "./generalCreator";
import { StopMarketOrderCreator } from "./stopMarketOrderCreator";
import { PostOnlyOrderCreator } from "./postOnlyCreator";
import { FOKOrderCreator } from "./fokCreator";
import { IOCOrderCreator } from "./iocCreator";
import { AlgoOrderRootType } from "@orderly.network/types";

import { TPSLOrderCreator } from "./tpslOrderCreator";
import { TPSLPositionOrderCreator } from "./tpslPositionOrderCreator";
import { BracketLimitOrderCreator } from "./bracketLimitOrderCreator";
import { OrderlyOrder } from "@orderly.network/types";
import { BracketMarketOrderCreator } from "./bracketMarketOrderCreator";
import { BBOOrderCreator } from "./bboOrderCreator";

export class OrderFactory {
  static create(
    type: OrderType | AlgoOrderRootType | string
  ): OrderCreator<any> {
    // console.log("type", type);
    switch (type) {
      case `${AlgoOrderRootType.BRACKET}:${OrderType.LIMIT}`:
        return new BracketLimitOrderCreator();
      case `${AlgoOrderRootType.BRACKET}:${OrderType.MARKET}`:
        return new BracketMarketOrderCreator();
      case OrderType.LIMIT:
        return new LimitOrderCreator();
      case OrderType.MARKET:
        return new MarketOrderCreator();
      case OrderType.ASK:
      case OrderType.BID:
        return new BBOOrderCreator();
      case OrderType.IOC:
        return new IOCOrderCreator();
      case OrderType.FOK:
        return new FOKOrderCreator();
      case OrderType.POST_ONLY:
        return new PostOnlyOrderCreator();
      case OrderType.STOP_LIMIT:
        return new StopLimitOrderCreator();
      case OrderType.STOP_MARKET:
        return new StopMarketOrderCreator();

      // algo order
      case AlgoOrderRootType.TP_SL:
        return new TPSLOrderCreator();
      case AlgoOrderRootType.POSITIONAL_TP_SL:
        return new TPSLPositionOrderCreator();

      default:
        return new GeneralOrderCreator();
    }
  }
}
