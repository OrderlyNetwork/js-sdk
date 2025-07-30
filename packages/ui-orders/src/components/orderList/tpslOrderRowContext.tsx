import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  unstable_serialize,
  useAccount,
  useMutation,
  useSWRConfig,
  utils,
} from "@orderly.network/hooks";
import { API } from "@orderly.network/types";
import { OrderSide } from "@orderly.network/types";
import { AlgoOrderType } from "@orderly.network/types";
import { useSymbolContext } from "./symbolProvider";

export type TPSLOrderRowContextState = {
  order: API.AlgoOrderExt;
  tp_trigger_price?: number;
  sl_trigger_price?: number;
  tpPnL?: number;
  slPnL?: number;

  onCancelOrder: (order: API.AlgoOrderExt) => Promise<void>;
  onUpdateOrder: (order: API.AlgoOrderExt, params: any) => Promise<void>;

  getRelatedPosition: (symbol: string) => API.PositionTPSLExt | undefined;

  position?: API.PositionTPSLExt;
};

export const TPSLOrderRowContext = createContext<TPSLOrderRowContextState>(
  {} as TPSLOrderRowContextState,
);

export const useTPSLOrderRowContext = () => {
  return useContext(TPSLOrderRowContext);
};

export const TPSLOrderRowProvider: FC<
  PropsWithChildren<{ order: API.AlgoOrderExt }>
> = (props) => {
  const { quote_dp } = useSymbolContext();
  const [position, setPosition] = useState<API.PositionTPSLExt>();

  const [doDeleteOrder] = useMutation("/v1/algo/order", "DELETE");
  const [doUpdateOrder] = useMutation("/v1/algo/order", "PUT");

  const config = useSWRConfig();
  const { state } = useAccount();

  const positionKey = useMemo(() => {
    return unstable_serialize(() => ["/v1/positions", state.accountId]);
  }, [state.accountId]);

  const onCancelOrder = async (order: API.AlgoOrderExt) => {
    return doDeleteOrder(null, {
      order_id: order.algo_order_id,
      symbol: order.symbol,
    });
  };

  const onUpdateOrder = async (order: API.AlgoOrderExt, params: any) => {
    return doUpdateOrder({
      order_id: order.algo_order_id,
      child_orders: order.child_orders.map((order) => ({
        order_id: order.algo_order_id,
        quantity: params.order_quantity,
      })),
    });
  };

  const getRelatedPosition = (
    symbol: string,
  ): API.PositionTPSLExt | undefined => {
    const positions = config.cache.get(positionKey);

    return positions?.data.rows.find(
      (p: API.PositionTPSLExt) => p.symbol === symbol,
    );
  };

  // const { sl_trigger_price, tp_trigger_price } = useMemo(() => {
  //   if (
  //     !("algo_type" in props.order) ||
  //     !Array.isArray(props.order.child_orders)
  //   ) {
  //     return {};
  //   }
  //   return utils.findTPSLFromOrder(props.order);
  // }, [props.order]);

  const { sl_trigger_price, tp_trigger_price, tpPnL, slPnL } = calcTPSLPnL({
    order: props.order,
    position,
    quote_dp,
  });

  useEffect(() => {
    if (
      "algo_type" in props.order ||
      ((props.order as any)?.reduce_only ?? false)
    ) {
      const position = getRelatedPosition(props.order.symbol);
      if (position) {
        setPosition(position);
      }
    }
  }, [props.order.symbol]);

  return (
    <TPSLOrderRowContext.Provider
      value={{
        order: props.order,
        sl_trigger_price,
        tp_trigger_price,
        tpPnL,
        slPnL,
        onCancelOrder,
        onUpdateOrder,
        getRelatedPosition,
        position,
      }}
    >
      {props.children}
    </TPSLOrderRowContext.Provider>
  );
};

function calcTPSLPnL(props: {
  order: API.AlgoOrderExt;
  position?: API.PositionTPSLExt;
  quote_dp: number;
}) {
  const { order, position, quote_dp } = props;

  if (!position)
    return {
      sl_trigger_price: undefined,
      tp_trigger_price: undefined,
      slPnL: undefined,
      tpPnL: undefined,
    };

  const { sl_trigger_price, tp_trigger_price } =
    !("algo_type" in order) || !Array.isArray(order.child_orders)
      ? {}
      : utils.findTPSLFromOrder(order);

  let quantity = order.quantity;

  if (quantity === 0) {
    if (order.child_orders?.[0].type === "CLOSE_POSITION") {
      quantity = position.position_qty;
    }
  }

  const avgOpenPrice = position.average_open_price;
  const tpPnL =
    typeof quantity === "number" &&
    typeof tp_trigger_price === "number" &&
    typeof avgOpenPrice === "number"
      ? utils.priceToPnl(
          {
            qty: quantity,
            price: tp_trigger_price,
            entryPrice: position.average_open_price,
            orderSide: order.side as OrderSide,
            orderType: AlgoOrderType.TAKE_PROFIT,
          },
          { symbol: { quote_dp } },
        )
      : undefined;

  const slPnL =
    typeof quantity === "number" &&
    typeof sl_trigger_price === "number" &&
    typeof avgOpenPrice === "number"
      ? utils.priceToPnl(
          {
            qty: quantity,
            price: sl_trigger_price,
            entryPrice: position.average_open_price,
            orderSide: order.side as OrderSide,
            orderType: AlgoOrderType.STOP_LOSS,
          },
          { symbol: { quote_dp } },
        )
      : undefined;

  return {
    sl_trigger_price,
    tp_trigger_price,
    slPnL,
    tpPnL,
  };
}
