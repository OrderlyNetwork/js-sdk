import { OrdersView } from "@/block/orders";
import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useOrderStream,
  useAccount,
  useSessionStorage,
} from "@orderly.network/hooks";
import { TradingPageContext } from "@/page/trading/context/tradingPageContext";
import {
  API,
  AccountStatusEnum,
  AlgoOrderRootType,
  OrderEntity,
} from "@orderly.network/types";
import { TabContext } from "@/tab";
import { OrderStatus } from "@orderly.network/types";

interface Props {
  // symbol: string;
  excludes?: AlgoOrderRootType[];
  includes?: AlgoOrderRootType[];
}

export const OrdersPane: FC<Props> = (props) => {
  // const {
  //   excludes = [AlgoOrderRootType.POSITIONAL_TP_SL, AlgoOrderRootType.TP_SL],
  // } = props;
  const context = useContext(TradingPageContext);
  const tabContext = useContext(TabContext);

  const [showAllSymbol, setShowAllSymbol] = useSessionStorage(
    "showAllSymbol_orders",
    true
  );

  const [symbol, setSymbol] = useState(() =>
    showAllSymbol ? "" : context.symbol
  );

  const [
    data,
    {
      isLoading,
      loadMore,
      cancelOrder,
      updateOrder,
      cancelAlgoOrder,
      updateAlgoOrder,
      cancelAllOrders,
      cancelAllTPSLOrders,
    },
  ] = useOrderStream({
    status: OrderStatus.INCOMPLETE,
    symbol: symbol,
    excludes: props.excludes,
    includes: props.includes,
  });

  const onShowAllSymbolChange = (isAll: boolean) => {
    setSymbol(isAll ? "" : context.symbol);
    setShowAllSymbol(isAll);
  };

  const { state } = useAccount();

  const isStopOrder = useMemo(() => {
    return (
      props.includes?.includes(AlgoOrderRootType.POSITIONAL_TP_SL) ||
      props.includes?.includes(AlgoOrderRootType.TP_SL)
    );
  }, [props.includes]);

  const cancelAllOrdersHandler = () => {
    if (isStopOrder) {
      return cancelAllTPSLOrders();
    } else {
      return cancelAllOrders();
    }
  };

  return (
    <OrdersView
      // @ts-ignore
      dataSource={state.status < AccountStatusEnum.EnableTrading ? [] : data}
      isLoading={isLoading}
      symbol={context.symbol}
      showAllSymbol={showAllSymbol}
      cancelOrder={cancelOrder}
      onCancelAll={cancelAllOrdersHandler}
      cancelAlgoOrder={cancelAlgoOrder}
      onShowAllSymbolChange={onShowAllSymbolChange}
      editOrder={updateOrder}
      editAlgoOrder={updateAlgoOrder}
      onSymbolChange={context.onSymbolChange}
      loadMore={loadMore}
      isStopOrder={isStopOrder}
    />
  );
};
