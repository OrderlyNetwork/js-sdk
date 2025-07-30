import { findTPSLFromOrder } from "@orderly.network/hooks";
import { API } from "@orderly.network/types";
import { Flex, Text } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { FlexCell } from "../components/common";
import { useTPSLDetailContext } from "../tpslDetailProvider";

export const QtyRender = ({ order }: { order: API.AlgoOrder }) => {
  const { position, base_dp } = useTPSLDetailContext();
  const { tp_trigger_price, sl_trigger_price } = findTPSLFromOrder(order);
  return (
    <Flex
      direction={"column"}
      justify={"start"}
      itemAlign={"start"}
      className="oui-text-2xs oui-h-full"
    >
      <FlexCell>
        <Text.numeral dp={base_dp} rm={Decimal.ROUND_DOWN} padding={false}>
          {order.quantity === 0 ? position.position_qty : order.quantity}
        </Text.numeral>
      </FlexCell>
      {tp_trigger_price && sl_trigger_price && (
        <FlexCell>
          <div />
        </FlexCell>
      )}
    </Flex>
  );
};
