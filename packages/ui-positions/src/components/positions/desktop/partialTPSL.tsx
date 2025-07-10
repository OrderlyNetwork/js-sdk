import { FC, useMemo } from "react";
import { useSymbolsInfo } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { PositionType } from "@orderly.network/types";
import { cn, Flex, Text } from "@orderly.network/ui";
import { AddIcon, TPSLEditIcon } from "./components";
import { usePositionsRowContext } from "./positionRowContext";

export const PartialTPSL: FC<{
  orderNum?: number;
  tpTriggerPrice?: number;
  slTriggerPrice?: number;
  direction?: "column" | "row";
}> = (props) => {
  const {
    orderNum,
    tpTriggerPrice,
    slTriggerPrice,
    direction = "column",
  } = props;
  const { partialTPSLOrder: order, quoteDp, baseDp } = usePositionsRowContext();
  const symbolInfo = useSymbolsInfo();
  const { t } = useTranslation();

  const child = useMemo(() => {
    const children = [];

    if (!order?.symbol) return <AddIcon positionType={PositionType.PARTIAL} />;

    if (tpTriggerPrice) {
      children.push(
        <Text.formatted
          className={cn(
            "oui-text-trade-profit oui-gap-0 oui-decoration-white/20",
          )}
          key={"tp"}
          rule="price"
          dp={symbolInfo[order!.symbol]("quote_dp", 2)}
          children={tpTriggerPrice}
          prefix={
            !slTriggerPrice || direction === "column" ? (
              <Text intensity={54}>{`${t("tpsl.tp")} - `}</Text>
            ) : (
              ""
            )
          }
        />,
      );
    }
    if (slTriggerPrice) {
      children.push(
        <Text.formatted
          key={"sl"}
          className={cn(
            "oui-text-trade-loss oui-gap-0 oui-decoration-white/20 ",
          )}
          rule={"price"}
          dp={symbolInfo[order!.symbol]("quote_dp", 2)}
          prefix={<Text intensity={54}>{`${t("tpsl.sl")} - `}</Text>}
        >
          {slTriggerPrice}
        </Text.formatted>,
      );
    }
    if (children.length === 0)
      return <AddIcon positionType={PositionType.PARTIAL} />;

    if (children.length === 2 && direction === "row") {
      children.splice(1, 0, <Text key={"split"}>/</Text>);
    }

    return children;
  }, [tpTriggerPrice, slTriggerPrice, order?.symbol, t]);
  const hasTPSL = Array.isArray(child) ? !!child.length : !child;
  return (
    <Flex className="oui-gap-[6px]">
      <div
        className={cn(
          "oui-inline-flex oui-text-base-contrast-36",
          direction === "column" ? "oui-flex-col" : "oui-flex-row oui-gap-1",
        )}
      >
        {child}
      </div>
      {hasTPSL && (
        <>
          <Text className="oui-text-base-contrast-54">({orderNum})</Text>
          <TPSLEditIcon />
        </>
      )}
    </Flex>
  );
};
