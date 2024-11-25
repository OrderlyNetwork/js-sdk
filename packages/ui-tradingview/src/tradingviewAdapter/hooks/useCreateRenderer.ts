import { useEffect, useRef, useState } from "react";
import { Renderer } from "../renderer/renderer";
import {
  useAccount,
  useOrderStream,
  usePositionStream,
} from "@orderly.network/hooks";
import { AccountStatusEnum, OrderStatus } from "@orderly.network/types";
import { AlgoType } from "../type";
import { DisplayControlSettingInterface } from "../../type";

export default function useCreateRenderer(
  symbol: string,
  displayControlSetting?: DisplayControlSettingInterface
) {
  const [renderer, setRenderer] = useState<Renderer>();
  const rendererRef = useRef<Renderer>();
  const { state } = useAccount();

  const [{ rows: positions }, positionsInfo] = usePositionStream();
  const [pendingOrders] = useOrderStream({
    status: OrderStatus.INCOMPLETE,
    symbol: symbol,
  });

  const createRenderer = useRef((instance: any, host: any, broker: any) => {
    if (rendererRef.current) {
      rendererRef.current.remove();
    }
    rendererRef.current = new Renderer(instance, host, broker);
    setRenderer(rendererRef.current);
  });
  const removeRenderer = useRef(() => {
    rendererRef.current?.remove();
    rendererRef.current = undefined;
  });

  useEffect(() => {
    if (state.status < AccountStatusEnum.EnableTrading) {
      renderer?.renderPositions([]);
      return;
    }

    if (!displayControlSetting || !displayControlSetting.position) {
      renderer?.renderPositions([]);
      return;
    }
    const positionList = (positions ?? []).filter(_ => (_.symbol === symbol)).map((item) => {
      return {
        symbol: item.symbol,
        open: item.average_open_price,
        balance: item.position_qty,
        closablePosition: 9999,
        // @ts-ignore
        unrealPnl: item.unrealized_pnl ?? 0,
        interest: 0,
        unrealPnlDecimal: 2,
        basePriceDecimal: 4,
      };
    });
    renderer?.renderPositions(positionList);
  }, [renderer, positions, symbol, displayControlSetting, state]);

  useEffect(() => {
    let tpslOrder: any = [];
    let positionTpsl: any = [];
    let limitOrder: any = [];
    let stopOrder: any = [];
    let bracketOrder: any = [];

    if (state.status < AccountStatusEnum.EnableTrading) {
      renderer?.renderPendingOrders([]);
      return;
    }

    const symbolPosition = (positions ?? []).find(
      (item) => item.symbol === symbol
    );
    pendingOrders?.forEach((order) => {
      if (symbol !== order.symbol) {
        return;
      }
      if (!order.algo_order_id) {
        limitOrder.push(order);
      } else if (order.algo_order_id) {
        if (order.algo_type === AlgoType.POSITIONAL_TP_SL) {
          for (const child_order of order.child_orders) {
            child_order.root_algo_order_algo_type = order.algo_type;
            if (
              child_order.trigger_price &&
              child_order.status !== OrderStatus.FILLED
            ) {
              positionTpsl.push(child_order);
            }
          }
        } else if (order.algo_type === AlgoType.TP_SL) {
          if (symbolPosition) {
            for (const child_order of order.child_orders) {
              child_order.root_algo_order_algo_type = order.algo_type;
              child_order.position_qty = symbolPosition.position_qty;
              if (
                child_order.trigger_price &&
                child_order.status !== OrderStatus.FILLED
              ) {
                tpslOrder.push(child_order);
              }
            }
          }
        } else if (
          order.algo_type === AlgoType.STOP_LOSS ||
          order.algo_type === AlgoType.TAKE_PROFIT
        ) {
          stopOrder.push(order);
        } else if (order.algo_type === AlgoType.BRACKET) {
          bracketOrder.push(order);
        }
      }
    });
    if (displayControlSetting) {
      if (!displayControlSetting.positionTpsl) {
        positionTpsl = [];
      }
      if (!displayControlSetting.tpsl) {
        tpslOrder = [];
      }
      if (!displayControlSetting.limitOrders) {
        limitOrder = [];
        bracketOrder = [];
      }
      if (!displayControlSetting.stopOrders) {
        stopOrder = [];
      }
    }

    renderer?.renderPendingOrders(
      tpslOrder.concat(positionTpsl).concat(limitOrder).concat(stopOrder).concat(bracketOrder)
    );
  }, [
    renderer,
    pendingOrders,
    symbol,
    displayControlSetting,
    positions,
    state.status,
  ]);

  return [createRenderer.current, removeRenderer.current] as const;
}
