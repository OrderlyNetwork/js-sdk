import React, { useCallback, useContext } from "react";
import { PositionsView } from "@/block/positions";
import { usePositionStream, useSessionStorage } from "@orderly.network/hooks";
import { modal } from "@/modal";
import {
  API,
  AccountStatusEnum,
  OrderEntity,
  OrderSide,
  OrderType,
} from "@orderly.network/types";
import { MarkPriceConfirm } from "@/block/positions/sections/markPriceConfirm";
import { PositionLimitCloseDialog } from "@/block/positions/sections/closeDialog";
import { useMutation, useAccount } from "@orderly.network/hooks";
import { TradingPageContext } from "@/page";
import { toast } from "@/toast";
import { TabContext } from "@/tab";

export const PositionPane = () => {
  const context = useContext(TradingPageContext);

  //

  const [showAllSymbol, setShowAllSymbol] = useSessionStorage(
    "showAllSymbol_position",
    true
  );

  const [symbol, setSymbol] = React.useState(() =>
    showAllSymbol ? "" : context.symbol
  );

  const onShowAllSymbolChange = (isAll: boolean) => {
    setSymbol(isAll ? "" : context.symbol);
    setShowAllSymbol(isAll);
  };

  const [data, info, { loading }] = usePositionStream(symbol);
  const { state } = useAccount();

  const [postOrder] = useMutation<OrderEntity, any>("/v1/order");

  const onLimitClose = useCallback(async (position: API.Position) => {
    return modal
      .sheet({
        title: "Limit Close",
        content: (
          <PositionLimitCloseDialog
            positions={position}
            side={position.position_qty > 0 ? OrderSide.SELL : OrderSide.BUY}
          />
        ),
      })
      .then(() => {})
      .catch((e) => {});
  }, []);

  const onMarketClose = useCallback(async (position: API.Position) => {
    return modal
      .confirm({
        title: "Market Close",
        content: <MarkPriceConfirm position={position} />,
        onCancel: () => {
          return Promise.reject();
        },
        onOk: () => {
          return postOrder({
            symbol: position.symbol,
            side: position.position_qty > 0 ? OrderSide.SELL : OrderSide.BUY,
            order_type: OrderType.MARKET,
            order_quantity: Math.abs(position.position_qty),
            reduce_only: true,
          })
            .then((res: any) => {
              // toast.success("success");
            })
            .catch((err: Error) => {
              //
              toast.error(err.message);
            });
        },
      })
      .catch(() => {});
  }, []);

  return (
    <PositionsView
      dataSource={
        state.status < AccountStatusEnum.EnableTrading ? [] : data.rows
      }
      aggregated={data.aggregated}
      isLoading={loading}
      onLimitClose={onLimitClose}
      onMarketClose={onMarketClose}
      showAllSymbol={showAllSymbol}
      onShowAllSymbolChange={onShowAllSymbolChange}
      onSymbolChange={context.onSymbolChange}
    />
  );
};
