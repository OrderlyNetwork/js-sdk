import React, { useCallback, useContext } from "react";
import { PositionHeader } from "./positionHeader";
import { PositionsView } from "@/block/positions";
import { usePositionStream } from "@orderly.network/hooks";
import { modal } from "@/modal";
import { ClosePositionPane } from "@/block/positions/sections/closeForm";
import {
  API,
  AccountStatusEnum,
  OrderEntity,
  OrderSide,
  OrderType,
} from "@orderly.network/types";
import { LimitConfirm } from "@/block/positions/sections/limitConfirm";
import { MarkPriceConfirm } from "@/block/positions/sections/markPriceConfirm";
import { PositionLimitCloseDialog } from "@/block/positions/sections/closeDialog";
import { useMutation, useAccount } from "@orderly.network/hooks";
import { TradingPageContext } from "@/page";
import { toast } from "@/toast";

export const PositionPane = () => {
  const context = useContext(TradingPageContext);
  const [symbol, setSymbol] = React.useState("");
  // console.log("********", data, info.maintenance_margin_ratio());

  const onShowAllSymbolChange = (isAll: boolean) => {
    setSymbol(isAll ? "" : context.symbol);
  };

  const [data, info, { loading }] = usePositionStream(symbol);
  const { state } = useAccount();

  const [postOrder] = useMutation<OrderEntity, any>("/order");

  const onLimitClose = useCallback(async (position: API.Position) => {
    console.log("onLimitClose", position);

    modal
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
      .catch((e) => {
        console.log("cancel");
      });
  }, []);

  const onMarketClose = useCallback(async (position: API.Position) => {
    modal
      .confirm({
        title: "Market Close",
        content: <MarkPriceConfirm position={position} />,
        onOk: () => {
          return postOrder({
            symbol: position.symbol,
            side: position.position_qty > 0 ? OrderSide.SELL : OrderSide.BUY,
            order_type: OrderType.MARKET,
            order_quantity: Math.abs(position.position_qty),
          })
            .then((res: any) => {
              console.log("postOrder", res);
            })
            .catch((err: Error) => {
              // console.log("postOrder", e);
              toast.error(err.message);
            });
        },
      })
      .catch(() => {
        console.log("cancel");
      });
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
      showAllSymbol={symbol === ""}
      onShowAllSymbolChange={onShowAllSymbolChange}
    />
  );
};
