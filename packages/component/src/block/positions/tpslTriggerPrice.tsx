import { FC, Fragment, ReactNode, useMemo } from "react";
import { Numeral } from "@/text";
import { API } from "@orderly.network/types";

export const TPSLTriggerPrice: FC<{
  takeProfitPrice: number | undefined;
  stopLossPrice: number | undefined;
  className?: string;
  order?: API.AlgoOrderExt;
  position?: API.PositionTPSLExt;
  quote_dp: number;
}> = (props) => {
  const { order, position } = props;

  const pnl = useMemo(() => {
    const children = Object.create(null);

    if (!!props.takeProfitPrice) {
      children.TP = (
        <Numeral
          rule="price"
          className="orderly-text-trade-profit"
          precision={props.quote_dp}
        >
          {props.takeProfitPrice}
        </Numeral>
      );
    }

    if (!!props.stopLossPrice) {
      children.SL = (
        <Numeral
          rule="price"
          className="orderly-text-trade-loss"
          precision={props.quote_dp}
        >
          {props.stopLossPrice}
        </Numeral>
      );
    }

    const keys = Object.keys(children);

    const values = Object.values<ReactNode>(children);

    if (keys.length === 0) return null;

    if (keys.length === 2) {
      keys.splice(1, 0, "/");
    }

    if (values.length === 2) {
      values.splice(1, 0, <span>/</span>);
    }

    return (
      <div className="orderly-text-3xs orderly-text-base-contrast-36 orderly-mt-2">
        <div className="orderly-flex orderly-gap-1">
          {keys.map((key, index) => {
            return <span key={index}>{key}</span>;
          })}
          <span>:</span>
          {values.map((child, index) => {
            return <Fragment key={index}>{child}</Fragment>;
          })}
        </div>
      </div>
    );
  }, [props.takeProfitPrice, props.stopLossPrice]);

  return pnl;
};
