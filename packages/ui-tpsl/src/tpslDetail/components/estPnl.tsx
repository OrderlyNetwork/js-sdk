import { findTPSLFromOrder } from "@orderly.network/hooks";
import { positions as perpPositions } from "@orderly.network/perp";
import { API } from "@orderly.network/types";
import { Flex, Text } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
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
  if (tp_trigger_price) {
    tp_unrealPnl = new Decimal(
      perpPositions.unrealizedPnL({
        qty,
        openPrice: position?.average_open_price,
        // markPrice: unRealizedPrice,
        markPrice: tp_trigger_price,
      }),
    )
      .abs()
      .toNumber();
  }

  if (sl_trigger_price) {
    sl_unrealPnl = new Decimal(
      perpPositions.unrealizedPnL({
        qty: qty,
        openPrice: position?.average_open_price,
        // markPrice: unRealizedPrice,
        markPrice: sl_trigger_price,
      }),
    )
      .abs()
      .mul(-1)
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
          <Text.numeral
            dp={quote_dp}
            rm={Decimal.ROUND_DOWN}
            coloring
            padding={false}
          >
            {tp_unrealPnl}
          </Text.numeral>
        </FlexCell>
      )}
      {sl_unrealPnl && (
        <FlexCell>
          <Text.numeral
            dp={quote_dp}
            rm={Decimal.ROUND_DOWN}
            coloring
            padding={false}
          >
            {sl_unrealPnl}
          </Text.numeral>
        </FlexCell>
      )}
    </Flex>
  );
};
