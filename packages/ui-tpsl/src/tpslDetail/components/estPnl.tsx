import { findTPSLFromOrder } from "@kodiak-finance/orderly-hooks";
import { positions as perpPositions } from "@kodiak-finance/orderly-perp";
import { API, OrderSide } from "@kodiak-finance/orderly-types";
import { Flex, Text } from "@kodiak-finance/orderly-ui";
import { Decimal, getTPSLDirection } from "@kodiak-finance/orderly-utils";
import { FlexCell } from "../components/common";
import { useTPSLDetailContext } from "../tpslDetailProvider";

export const EstPnlRender = ({ order }: { order: API.AlgoOrder }) => {
  const { position, base_dp, quote_dp } = useTPSLDetailContext();
  const { tp_trigger_price, sl_trigger_price } = findTPSLFromOrder(order);

  let tp_unrealPnl = undefined;
  let sl_unrealPnl = undefined;
  const qty = new Decimal(order.quantity).eq(0)
    ? position.position_qty
    : order.quantity;

  const side = position.position_qty > 0 ? OrderSide.BUY : OrderSide.SELL;
  const openPrice = position?.average_open_price;

  if (tp_trigger_price) {
    const direction = getTPSLDirection({
      side,
      type: "tp",
      closePrice: tp_trigger_price,
      orderPrice: openPrice,
    });
    tp_unrealPnl = new Decimal(
      perpPositions.unrealizedPnL({
        qty,
        openPrice,
        // markPrice: unRealizedPrice,
        markPrice: tp_trigger_price,
      }),
    )
      .abs()
      .mul(direction)
      .toNumber();
  }

  if (sl_trigger_price) {
    const direction = getTPSLDirection({
      side,
      type: "sl",
      closePrice: sl_trigger_price,
      orderPrice: openPrice,
    });
    sl_unrealPnl = new Decimal(
      perpPositions.unrealizedPnL({
        qty: qty,
        openPrice,
        // markPrice: unRealizedPrice,
        markPrice: sl_trigger_price,
      }),
    )
      .abs()
      .mul(direction)
      // .mul(-1)
      .toNumber();
  }
  return (
    <Flex
      gap={2}
      direction={"column"}
      justify={"between"}
      itemAlign={"start"}
      className="oui-text-2xs"
    >
      {tp_unrealPnl && (
        <FlexCell>
          <Text.numeral dp={2} rm={Decimal.ROUND_DOWN} coloring padding={false}>
            {tp_unrealPnl}
          </Text.numeral>
        </FlexCell>
      )}
      {sl_unrealPnl && (
        <FlexCell>
          <Text.numeral dp={2} rm={Decimal.ROUND_DOWN} coloring padding={false}>
            {sl_unrealPnl}
          </Text.numeral>
        </FlexCell>
      )}
    </Flex>
  );
};
