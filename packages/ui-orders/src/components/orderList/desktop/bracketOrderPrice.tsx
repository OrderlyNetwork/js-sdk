import { useMarkPricesStream, utils } from "@orderly.network/hooks";
import { API } from "@orderly.network/types";
import { useMemo } from "react";
import { Flex, Tooltip, Text, cn } from "@orderly.network/ui";
import { useSymbolContext } from "../symbolProvider";
import { calcBracketRoiAndPnL } from "../../../utils/util";

export const BracketOrderPrice = (props: { order: API.AlgoOrderExt }) => {
  const { order } = props;
  const { quote_dp, base_dp } = useSymbolContext();

  const { sl_trigger_price, tp_trigger_price } = useMemo(() => {
    if (!("algo_type" in order) || !Array.isArray(order.child_orders)) {
      return {};
    }
    return utils.findTPSLFromOrder(props.order.child_orders[0]);
  }, [props.order]);

  const { pnl, roi } = calcBracketRoiAndPnL(order);

  if (!tp_trigger_price && !sl_trigger_price) {
    return "--";
  }

  return (
    <Tooltip
      // @ts-ignore
      content={
        <Flex direction={"column"} itemAlign={"start"} gap={1}>
          {typeof pnl.tpPnL !== "undefined" && (
            <Text.numeral
              // @ts-ignore
              prefix={<Text intensity={80}>TP PnL: &nbsp;</Text>}
              suffix={<Text intensity={20}>{" USDC"}</Text>}
              dp={quote_dp}
              color="buy"
              showIdentifier
            >
              {pnl.tpPnL}
            </Text.numeral>
          )}
          {typeof pnl.slPnL !== "undefined" && (
            <Text.numeral
              // @ts-ignore
              prefix={<Text intensity={80}>SL PnL: &nbsp;</Text>}
              suffix={<Text intensity={20}>{" USDC"}</Text>}
              dp={quote_dp}
              color="sell"
            >
              {pnl.slPnL}
            </Text.numeral>
          )}
        </Flex>
      }
      className="oui-bg-base-6"
    >
      <Flex
        direction={"column"}
        width={"100%"}
        justify={"start"}
        itemAlign={"start"}
      >
        <Price type="TP" value={tp_trigger_price} quote_dp={quote_dp} />
        <Price type="SL" value={sl_trigger_price} quote_dp={quote_dp} />
      </Flex>
    </Tooltip>
  );
};

const Price = (props: {
  type: "TP" | "SL";
  value?: number | string;
  quote_dp: number;
}) => {
  const { type, value, quote_dp } = props;
  return value ? (
    <Text.numeral
      className={cn(
        "oui-gap-0 oui-decoration-white/20 oui-border-b oui-border-dashed oui-border-base-contrast-12",
        type === "TP" ? "oui-text-trade-profit" : "oui-text-trade-loss"
      )}
      key={"tp"}
      rule="price"
      dp={quote_dp}
      // @ts-ignore
      prefix={
        <span className={"oui-text-base-contrast-54"}>
          {`${type}`}&nbsp;-&nbsp;
        </span>
      }
    >
      {value}
    </Text.numeral>
  ) : (
    <></>
  );
};
