import { findTPSLFromOrder } from "@orderly.network/hooks";
import { API } from "@orderly.network/types";
import { Flex, Text } from "@orderly.network/ui";
import { FlexCell } from "../components/common";

export const TypeRender = ({ order }: { order: API.AlgoOrder }) => {
  const { tp_trigger_price, sl_trigger_price } = findTPSLFromOrder(order);

  return (
    <Flex
      direction={"column"}
      justify={"between"}
      itemAlign={"start"}
      className="oui-text-2xs"
    >
      {tp_trigger_price && (
        <FlexCell>
          <Text className="oui-text-trade-profit">TP</Text>
        </FlexCell>
      )}

      {sl_trigger_price && (
        <FlexCell>
          <Text className="oui-text-trade-loss">SL</Text>
        </FlexCell>
      )}
    </Flex>
  );
};
