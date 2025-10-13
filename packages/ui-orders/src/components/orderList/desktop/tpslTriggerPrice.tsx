import { FC, useMemo } from "react";
import { useSymbolsInfo, utils } from "@kodiak-finance/orderly-hooks";
import { API, AlgoOrderType } from "@kodiak-finance/orderly-types";
import { OrderSide } from "@kodiak-finance/orderly-types";
import { cn, Text, Tooltip } from "@kodiak-finance/orderly-ui";
import { useTPSLOrderRowContext } from "../tpslOrderRowContext";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
export const OrderTriggerPrice = () => {
  const { sl_trigger_price, tp_trigger_price, order, position } =
    useTPSLOrderRowContext();

  return (
    <TPSLTriggerPrice
      stopLossPrice={sl_trigger_price}
      takeProfitPrice={tp_trigger_price}
      direction={"column"}
      order={order}
      position={position}
      tooltip
    />
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
      if (order.child_orders?.[0].type === "CLOSE_POSITION") {
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
    if (props.takeProfitPrice) {
      children.push(
        <Text.numeral
          className={cn(
            "oui-text-trade-profit oui-gap-0  oui-decoration-white/20 oui-border-b oui-border-dashed oui-border-base-contrast-12"
          )}
          key={"tp"}
          rule="price"
          dp={symbolInfo[order!.symbol]("quote_dp", 2)}
          children={props.takeProfitPrice}
          // @ts-ignore
          prefix={
            !props.stopLossPrice || direction === "column" ? (
              <span className={"oui-text-base-contrast-54"}>
                {`${t("tpsl.tp")} -`}&nbsp;
              </span>
            ) : (
              ""
            )
          }
        />
      );
    }
    if (props.stopLossPrice) {
      children.push(
        <Text.numeral
          key={"sl"}
          className={cn(
            "oui-text-trade-loss oui-gap-0 oui-decoration-white/20 oui-border-b oui-border-dashed oui-border-base-contrast-12"
          )}
          rule={"price"}
          dp={symbolInfo[order!.symbol]("quote_dp", 2)}
          children={props.stopLossPrice}
          // @ts-ignore
          prefix={
            !props.takeProfitPrice || direction === "column" ? (
              <span className={"oui-text-base-contrast-54"}>
                {`${t("tpsl.sl")} -`}&nbsp;
              </span>
            ) : (
              ""
            )
          }
        />
      );
    }

    if (children.length === 0) return <span>-</span>;

    if (children.length === 2 && direction === "row") {
      children.splice(1, 0, <span key={"split"}>/</span>);
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

  if (props.tooltip) {
    // @ts-ignore
    return (
      <Tooltip
        // @ts-ignore
        content={pnl}
        className="oui-bg-base-5"
        arrow={{ className: "oui-fill-base-5" }}
      >
        {content}
      </Tooltip>
    );
  }

  return content;
};

const TriggerPriceItem: FC<{
  qty: number;
  price: number;
  entryPrice: number;
  orderSide: OrderSide;
  orderType: AlgoOrderType;
  symbolInfo: API.SymbolExt;
}> = (props) => {
  const { qty, price, entryPrice, orderSide, orderType, symbolInfo } = props;
  const { t } = useTranslation();

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
  const label = type === "TP" ? `${t("tpsl.tpPnl")}:` : `${t("tpsl.slPnl")}:`;

  // console.log("trigger price item", "dp", symbolInfo.quote_dp);

  return (
    <div className="oui-flex oui-items-center">
      <span className="oui-text-base-contrast-54 oui-mr-1">{label}</span>
      <Text.numeral
        rule="price"
        dp={symbolInfo.quote_dp}
        padding={false}
        className={
          pnl === 0
            ? "oui-text-base-contrast-36"
            : pnl > 0
            ? "oui-text-trade-profit oui-gap-0"
            : "oui-text-trade-loss oui-gap-0"
        }
        // @ts-ignore
        prefix={
          // @ts-ignore
          <span>{pnl === 0 ? "" : pnl > 0 ? "+" : "-"}</span>
        }
        suffix={
          <span className="oui-text-base-contrast-36 oui-ml-1">USDC</span>
        }
      >{`${Math.abs(pnl)}`}</Text.numeral>
    </div>
  );
};
