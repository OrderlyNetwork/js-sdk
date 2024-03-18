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
import { AlogOrderRootType } from "@orderly.network/types";
import { OrderEntity } from "@orderly.network/types";
import { AlgoOrderEntry } from "@orderly.network/types";
import { TPSLOrderCreator } from "./tpslOrderCreator";
import { TPSLPositionOrderCreator } from "./tpslPositionOrderCreator";

export class OrderFactory {
  static create(type: OrderType | AlogOrderRootType): OrderCreator<any> {
    switch (type) {
      case OrderType.LIMIT:
        return new LimitOrderCreator();
      case OrderType.MARKET:
        return new MarketOrderCreator();
      //   case OrderType.ASK:
      //     return new AskOrderCreator();
      //   case OrderType.BID:
      //     return new BidOrderCreator();
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
      case AlogOrderRootType.TP_SL:
        return new TPSLOrderCreator();
      case AlogOrderRootType.POSITIONAL_TP_SL:
        return new TPSLPositionOrderCreator();

      default:
        return new GeneralOrderCreator();
    }
  }
}
