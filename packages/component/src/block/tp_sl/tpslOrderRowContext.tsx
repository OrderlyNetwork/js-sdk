import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { API } from "@orderly.network/types";
import {
  unstable_serialize,
  useAccount,
  useMutation,
  useSWRConfig,
  utils,
} from "@orderly.network/hooks";

export type TPSLOrderRowContextState = {
  order: API.AlgoOrderExt;
  tp_trigger_price?: number;
  sl_trigger_price?: number;

  onCancelOrder: (order: API.AlgoOrderExt) => Promise<void>;
  onUpdateOrder: (order: API.AlgoOrderExt, params: any) => Promise<void>;

  getRelatedPosition: (symbol: string) => API.PositionTPSLExt | undefined;

  position?: API.PositionTPSLExt;
};

export const TPSLOrderRowContext = createContext(
  {} as TPSLOrderRowContextState
);

export const useTPSLOrderRowContext = () => {
  return useContext(TPSLOrderRowContext);
};

export const TPSLOrderRowProvider: FC<
  PropsWithChildren<{
    order: API.AlgoOrderExt;
  }>
> = (props) => {
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
    console.log("onUpdateOrder", order, position);
    return doUpdateOrder({
      order_id: order.algo_order_id,
      child_orders: order.child_orders.map((order) => ({
        order_id: order.algo_order_id,
        quantity: params.order_quantity,
      })),
    });
  };

  const getRelatedPosition = (
    symbol: string
  ): API.PositionTPSLExt | undefined => {
    const positions = config.cache.get(positionKey);

    return positions?.data.rows.find(
      (p: API.PositionTPSLExt) => p.symbol === symbol
    );
  };

  const { sl_trigger_price, tp_trigger_price } = useMemo(() => {
    if (
      !("algo_type" in props.order) ||
      !Array.isArray(props.order.child_orders)
    ) {
      return {};
    }
    return utils.findTPSLFromOrder(props.order);
  }, [props.order]);

  useEffect(() => {
    if ("algo_type" in props.order) {
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
