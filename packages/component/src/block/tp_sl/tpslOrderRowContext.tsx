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

  getRelatedPosition: (symbol: string) => API.PositionTPSLExt | undefined;

  position?: API.PositionTPSLExt;
};

export const tpslOrderRowContext = createContext(
  {} as TPSLOrderRowContextState
);

export const useTPSLOrderRowContext = () => {
  return useContext(tpslOrderRowContext);
};

export const TPSLOrderRowProvider: FC<
  PropsWithChildren<{
    order: API.AlgoOrderExt;
  }>
> = (props) => {
  const [position, setPosition] = useState<API.PositionTPSLExt>();

  const [doDeleteOrder] = useMutation("/v1/algo/order", "DELETE");

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

  const getRelatedPosition = (
    symbol: string
  ): API.PositionTPSLExt | undefined => {
    const positions = config.cache.get(positionKey);

    return positions?.data.rows.find(
      (p: API.PositionTPSLExt) => p.symbol === symbol
    );
  };

  const { sl_trigger_price, tp_trigger_price } = useMemo(() => {
    if (!("algo_type" in props.order)) {
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
    <tpslOrderRowContext.Provider
      value={{
        order: props.order,
        sl_trigger_price,
        tp_trigger_price,
        onCancelOrder,
        getRelatedPosition,
        position,
      }}
    >
      {props.children}
    </tpslOrderRowContext.Provider>
  );
};
