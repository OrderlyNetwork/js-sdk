import { useMarkPricesStream, utils } from "@orderly.network/hooks";
import { API } from "@orderly.network/types";
import { useMemo } from "react";
import { Flex, Tooltip, Text, cn } from "@orderly.network/ui";
import { useSymbolContext } from "../symbolProvider";

export const BarcketOrderPrice = (props: { order: API.AlgoOrder }) => {
  const { order } = props;
  const markPrices = useMarkPricesStream();
  const markPrice = useMemo(() => {
    return markPrices.data[order.symbol];
  }, [markPrices.data[order.symbol]]);
  const { quote_dp, base_dp } = useSymbolContext();

  const { sl_trigger_price, tp_trigger_price } = useMemo(() => {
    if (!("algo_type" in order) || !Array.isArray(order.child_orders)) {
      return {};
    }
    return utils.findTPSLFromOrder(props.order.child_orders[0]);
  }, [props.order]);

  const pnl = useMemo(() => {
    const entryPrice = order.trigger_price ?? order.price;
    if (
      order?.algo_type &&
      order?.algo_type === "BRACKET" &&
      entryPrice &&
      markPrice
    ) {
      return utils.priceToPnl(
        {
          qty: order.quantity,
          price: markPrice,
          entryPrice: entryPrice,
          // @ts-ignore
          orderSide: order.side,
          // @ts-ignore
          orderType: order.algo_type,
        },
        {
          symbol: { quote_dp: quote_dp },
        }
      );
    }
    return undefined;
  }, [markPrice]);
  const roi = useMemo(() => {
    if (pnl) {
      return utils.calcTPSL_ROI({
        pnl: pnl,
        qty: order.quantity,
        price: markPrice,
      });
    }
    return undefined;
  }, [markPrice, pnl]);

  if (!tp_trigger_price && !sl_trigger_price) {
    return "--";
  }

  return (
    <Tooltip
      // @ts-ignore
      content={
        <Flex direction={"column"} itemAlign={"start"} gap={1}>
          {roi && (
            <Text.numeral
              // @ts-ignore
              prefix={<Text intensity={54}>{"Est. ROI: "}</Text>}
              dp={quote_dp}
              rule="percentages"
              coloring
            >
              {roi}
            </Text.numeral>
          )}
          {pnl && (
            <Text.numeral
              // @ts-ignore
              prefix={<Text intensity={54}>{"Est. PnL: "}</Text>}
              dp={quote_dp}
              coloring
            >
              {pnl}
            </Text.numeral>
          )}
        </Flex>
      }
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
        "oui-gap-0 oui-decoration-white/20 oui-border-b oui-border-dashed oui-border-base-contrast-36",
        type === "TP" ? "oui-text-trade-profit" : "oui-text-trade-loss"
      )}
      key={"tp"}
      rule="price"
      precision={quote_dp}
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
