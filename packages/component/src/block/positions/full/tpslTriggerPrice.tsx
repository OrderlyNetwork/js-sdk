import { FC, useMemo } from "react";
import { Numeral } from "@/text";
import { cn } from "@/utils";
import { Tooltip } from "@/tooltip";

export const TPSLTriggerPrice: FC<{
  takeProfitPrice: number | undefined;
  stopLossPrice: number | undefined;
  className?: string;
  direction?: "row" | "column";
  tooltip?: boolean;
}> = (props) => {
  const { direction = "row" } = props;

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
    return <Tooltip content={"sssss"}>{content}</Tooltip>;
  }

  return content;
};
