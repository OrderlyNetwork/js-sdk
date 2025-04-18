import { FC, useMemo } from "react";
import { usePositionsRowContext } from "./positionRowContext";
import { AlgoOrderType, API, OrderSide } from "@orderly.network/types";
import { useSymbolsInfo, utils } from "@orderly.network/hooks";
import { cn, Flex, Text, Tooltip } from "@orderly.network/ui";
import { TPSLEditIcon } from "./components";
import { useTranslation } from "@orderly.network/i18n";

export const TriggerPrice: FC<{
  stopLossPrice?: number;
  takeProfitPrice?: number;
}> = (props) => {
  const { stopLossPrice, takeProfitPrice } = props;
  const { tpslOrder, position } = usePositionsRowContext();

  return (
    <TPSLTriggerPrice
      stopLossPrice={stopLossPrice}
      takeProfitPrice={takeProfitPrice}
      direction={"column"}
      order={tpslOrder}
      position={position}
      tooltip
    />
  );
};

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
    <Flex>
      <Text intensity={54} className="oui-mr-1">{`${type} PnL:`}</Text>
      <Text.formatted
        rule="price"
        className={
          pnl === 0
            ? "oui-text-base-contrast-36"
            : pnl > 0
            ? "oui-text-trade-profit oui-gap-0"
            : "oui-text-trade-loss oui-gap-0"
        }
        prefix={<Text>{pnl === 0 ? "" : pnl > 0 ? "+" : "-"}</Text>}
        suffix={
          <Text intensity={36} className="oui-ml-1">
            USDC
          </Text>
        }
      >{`${Math.abs(pnl)}`}</Text.formatted>
    </Flex>
  );
};

export const TPSLTriggerPrice: FC<{
  takeProfitPrice: number | undefined;
  stopLossPrice: number | undefined;
  className?: string;
  direction?: "row" | "column";
  tooltip?: boolean;
  order?: API.AlgoOrder;
  position?: API.PositionTPSLExt;
}> = (props) => {
  const { direction = "row", order, position } = props;
  // const symbolInfo = useSymbolsInfo()[position?.symbol ?? ""]();
  const symbolInfo = useSymbolsInfo();
  const { t } = useTranslation();
  const pnl = useMemo(() => {
    const msgs = [];

    if (!props.tooltip || !order || !position) return;

    let quantity = order.quantity;

    if (quantity === 0) {
      if (order.child_orders[0].type === "CLOSE_POSITION") {
        quantity = position.position_qty;
      }
    }

    if (!!props.takeProfitPrice) {
      msgs.push(
        <TriggerPriceItem
          key={"tp"}
          qty={quantity}
          price={props.takeProfitPrice}
          entryPrice={position.average_open_price}
          orderSide={order.side as OrderSide}
          orderType={AlgoOrderType.TAKE_PROFIT}
          symbolInfo={symbolInfo[order.symbol]()}
        />
      );
    }

    if (!!props.stopLossPrice) {
      msgs.push(
        <TriggerPriceItem
          key={"sl"}
          qty={quantity}
          price={props.stopLossPrice}
          entryPrice={position.average_open_price}
          orderSide={order.side as OrderSide}
          orderType={AlgoOrderType.STOP_LOSS}
          symbolInfo={symbolInfo[order.symbol]()}
        />
      );
    }

    return <div>{msgs}</div>;
  }, [
    props.takeProfitPrice,
    props.stopLossPrice,
    position?.average_open_price,
    order?.side,
    order?.quantity,
    order?.algo_type,
  ]);

  const child = useMemo(() => {
    const children = [];

    if (!order?.symbol) return <span>-</span>;

    const Label = ({ children }: { children?: string }) => {
      return !props.stopLossPrice || direction === "column" ? (
        <Text intensity={54}>{children}</Text>
      ) : (
        ""
      );
    };

    if (props.takeProfitPrice) {
      children.push(
        <Text.formatted
          className={cn(
            "oui-text-trade-profit oui-gap-0 oui-decoration-white/20"
          )}
          key={"tp"}
          rule="price"
          dp={symbolInfo[order!.symbol]("quote_dp", 2)}
          children={props.takeProfitPrice}
          prefix={
            !props.stopLossPrice || direction === "column" ? (
              <Text intensity={54}>{`${t("tpsl.tp")} - `}</Text>
            ) : (
              ""
            )
          }
        />
      );
    }
    if (props.stopLossPrice) {
      children.push(
        <Text.formatted
          key={"sl"}
          className={cn(
            "oui-text-trade-loss oui-gap-0 oui-decoration-white/20 "
          )}
          rule={"price"}
          dp={symbolInfo[order!.symbol]("quote_dp", 2)}
          children={props.stopLossPrice}
          prefix={
            !props.takeProfitPrice || direction === "column" ? (
              <Text intensity={54}>{`${t("tpsl.sl")} - `}</Text>
            ) : (
              ""
            )
          }
        />
      );
    }

    if (children.length === 0) return <Text>-</Text>;

    if (children.length === 2 && direction === "row") {
      children.splice(1, 0, <Text key={"split"}>/</Text>);
    }

    return children;
  }, [props.takeProfitPrice, props.stopLossPrice, order?.symbol, t]);

  const content = (
    <div
      className={cn(
        "oui-inline-flex oui-text-base-contrast-36",
        props.direction === "column"
          ? "oui-flex-col"
          : "oui-flex-row oui-gap-1",
        props.className
      )}
    >
      {child}
    </div>
  );

  const showIcon = Array.isArray(child) ? !!child.length : !child;

  if (props.tooltip) {
    return (
      <Flex gapX={2}>
        <Tooltip content={pnl}>{content}</Tooltip>
        {showIcon && <TPSLEditIcon />}
      </Flex>
    );
  }

  return content;
};
