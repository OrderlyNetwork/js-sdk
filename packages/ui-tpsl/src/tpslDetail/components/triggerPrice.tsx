import { findTPSLFromOrder } from "@orderly.network/hooks";
import { API } from "@orderly.network/types";
import { Flex, Text } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { FlexCell } from "../components/common";
import { useTPSLDetailContext } from "../tpslDetailProvider";

export const TriggerPrice = ({ order }: { order: API.AlgoOrder }) => {
  const { base_dp } = useTPSLDetailContext();
  const { tp_trigger_price, sl_trigger_price } = findTPSLFromOrder(order);

  return (
    <Flex
      gap={1}
      direction={"column"}
      justify={"between"}
      itemAlign={"start"}
      className="oui-text-2xs"
    >
      {tp_trigger_price && (
        <FlexCell>
          <Flex direction={"column"} justify={"start"} itemAlign={"start"}>
            <Text className="oui-text-base-contrast-36">Market</Text>
            <Text.numeral dp={base_dp} rm={Decimal.ROUND_DOWN} padding={false}>
              {tp_trigger_price}
            </Text.numeral>
          </Flex>
        </FlexCell>
      )}
      {sl_trigger_price && (
        <FlexCell>
          <Flex direction={"column"} justify={"start"} itemAlign={"start"}>
            <Text className="oui-text-base-contrast-36">Market</Text>
            <Text.numeral dp={base_dp} rm={Decimal.ROUND_DOWN} padding={false}>
              {sl_trigger_price}
            </Text.numeral>
          </Flex>
        </FlexCell>
      )}
    </Flex>
  );
};
