import { useMemo } from "react";
import { findTPSLFromOrder } from "@veltodefi/hooks";
import { API } from "@veltodefi/types";
import { Flex, Text } from "@veltodefi/ui";
import { Decimal } from "@veltodefi/utils";
import { FlexCell } from "../components/common";
import { useTPSLDetailContext } from "../tpslDetailProvider";

export const QtyRender = ({ order }: { order: API.AlgoOrder }) => {
  const { position, base_dp } = useTPSLDetailContext();
  const { tp_trigger_price, sl_trigger_price } = findTPSLFromOrder(order);

  const quantity = useMemo(() => {
    if (order.quantity === 0) {
      return -position.position_qty;
    }

    return position.position_qty > 0 ? -order.quantity : order.quantity;
  }, [order.quantity, position.position_qty]);

  return (
    <Flex
      direction={"column"}
      justify={"start"}
      itemAlign={"start"}
      className="oui-h-full oui-text-2xs"
    >
      <FlexCell>
        <Text.numeral dp={base_dp} rm={Decimal.ROUND_DOWN} padding={false}>
          {quantity}
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
