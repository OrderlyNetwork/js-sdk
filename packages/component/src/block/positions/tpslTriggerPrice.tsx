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
  order?: API.AlgoOrderExt;
  position?: API.PositionTPSLExt;
}> = (props) => {
  const { order, position } = props;

  const pnl = useMemo(() => {
    const children = Object.create(null);

    if (!!props.takeProfitPrice) {
      children.TP = (
        <Numeral rule="price" className="orderly-text-trade-profit">
          {props.takeProfitPrice}
        </Numeral>
      );
    }

    if (!!props.stopLossPrice) {
      children.SL = (
        <Numeral rule="price" className="orderly-text-trade-loss">
          {props.stopLossPrice}
        </Numeral>
      );
    }

    const keys = Object.keys(children);

    const values = Object.values(children);

    if (keys.length === 0) return null;

    if (keys.length === 2) {
      keys.splice(1, 0, "|");
    }

    if (values.length === 2) {
      values.splice(1, 0, <span>|</span>);
    }

    return (
      <div className="orderly-text-3xs orderly-text-base-contrast-36 orderly-mt-2">
        <div className="orderly-flex orderly-gap-1">
          {keys.map((key) => {
            return <span key={key}>{key}</span>;
          })}
          <span>:</span>
          {values.map((child, index) => {
            return <>{child}</>;
          })}
        </div>
      </div>
    );
  }, [props.takeProfitPrice, props.stopLossPrice]);

  return pnl;
};
