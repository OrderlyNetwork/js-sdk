import { FC, useMemo } from "react";
import { Numeral } from "@/text";
import { cn } from "@/utils";
import { Tooltip } from "@/tooltip";
import { utils } from "@orderly.network/hooks";
import { API } from "@orderly.network/types";
import { Minus, Plus } from "lucide-react";

export const TPSLTriggerPrice: FC<{
  takeProfitPrice: number | undefined;
  stopLossPrice: number | undefined;
  className?: string;
  direction?: "row" | "column";
  tooltip?: boolean;
  order?: API.AlgoOrderExt;
  position?: API.PositionTPSLExt;
}> = (props) => {
  const { direction = "row", order, position } = props;

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
      const tp_pnl = utils.priceToPnl({
        qty: quantity,
        price: props.takeProfitPrice,
        entryPrice: position.average_open_price,
        orderSide: order.side,
        orderType: order.algo_type,
      });

      // console.log("tp_pnl:", tp_pnl, order, position);

      msgs.push(
        <div className="orderly-flex orderly-items-center">
          <span className="orderly-text-base-contrast-54">TP PNL:</span>
          <Numeral
            rule="price"
            className={
              tp_pnl > 0
                ? "orderly-text-trade-profit orderly-gap-0"
                : "orderly-text-trade-loss"
            }
            prefix={
              <span>
                {tp_pnl > 0 ? <Plus size={10} /> : <Minus size={10} />}
              </span>
            }
            surfix={<span className="orderly-text-base-contrast-36">USDC</span>}
          >{`${Math.abs(tp_pnl)}`}</Numeral>
        </div>
      );
    }

    if (!!props.stopLossPrice) {
      const sl_pnl = utils.priceToPnl({
        qty: quantity,
        price: props.stopLossPrice,
        entryPrice: position.average_open_price,
        orderSide: order.side,
        orderType: order.algo_type,
      });

      // console.log("sl_price", sl_pnl);

      msgs.push(
        <div className="orderly-flex orderly-items-center">
          <span className="orderly-text-base-contrast-54">SL PNL:</span>
          <Numeral
            rule="price"
            className={
              sl_pnl > 0
                ? "orderly-text-trade-profit orderly-gap-0"
                : "orderly-text-trade-loss orderly-gap-0"
            }
            prefix={
              <span>
                {sl_pnl > 0 ? <Plus size={10} /> : <Minus size={10} />}
              </span>
            }
            surfix={<span className="orderly-text-base-contrast-36">USDC</span>}
          >{`${Math.abs(sl_pnl)}`}</Numeral>
        </div>
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
    if (props.takeProfitPrice) {
      children.push(
        <Numeral
          className={cn(
            "orderly-text-trade-profit orderly-gap-0  orderly-decoration-white/20",
            props.tooltip &&
              "orderly-underline orderly-underline-offset-4 orderly-decoration-dashed"
          )}
          key={"tp"}
          rule="price"
          children={props.takeProfitPrice}
          prefix={
            !props.stopLossPrice || direction === "column" ? (
              <span className={"orderly-text-base-contrast-54"}>TP-</span>
            ) : (
              ""
            )
          }
        />
      );
    }
    if (props.stopLossPrice) {
      children.push(
        <Numeral
          key={"sl"}
          className={cn(
            "orderly-text-trade-loss orderly-gap-0 orderly-decoration-white/20 ",
            props.tooltip &&
              "orderly-decoration-dashed orderly-underline orderly-underline-offset-4"
          )}
          rule={"price"}
          children={props.stopLossPrice}
          prefix={
            !props.takeProfitPrice || direction === "column" ? (
              <span className={"orderly-text-base-contrast-54"}>SL-</span>
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
  }, [props.takeProfitPrice, props.stopLossPrice]);

  const content = (
    <div
      className={cn(
        "orderly-inline-flex orderly-text-base-contrast-36",
        props.direction === "column"
          ? "orderly-flex-col"
          : "orderly-flex-row orderly-gap-1",
        props.className
      )}
    >
      {child}
    </div>
  );

  if (props.tooltip) {
    // @ts-ignore
    return <Tooltip content={pnl}>{content}</Tooltip>;
  }

  return content;
};
