import { findTPSLOrderPriceFromOrder } from "@orderly.network/hooks";
import { API, OrderType } from "@orderly.network/types";
import { Flex, Text } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { FlexCell } from "../components/common";
import { useTPSLDetailContext } from "../tpslDetailProvider";

export const OrderPriceRender = ({ order }: { order: API.AlgoOrder }) => {
  const { quote_dp } = useTPSLDetailContext();
  const { tp_order_price, sl_order_price } = findTPSLOrderPriceFromOrder(order);
  return (
    <Flex
      gap={2}
      direction={"column"}
      justify={"between"}
      itemAlign={"start"}
      className="oui-text-2xs"
    >
      {tp_order_price && (
        <FlexCell>
          {tp_order_price === OrderType.MARKET ? (
            <Text>Market</Text>
          ) : (
            <Text.numeral dp={quote_dp} rm={Decimal.ROUND_DOWN} padding={false}>
              {tp_order_price}
            </Text.numeral>
          )}
        </FlexCell>
      )}
      {sl_order_price && (
        <FlexCell>
          {sl_order_price === OrderType.MARKET ? (
            <Text>Market</Text>
          ) : (
            <Text.numeral dp={quote_dp} rm={Decimal.ROUND_DOWN} padding={false}>
              {sl_order_price}
            </Text.numeral>
          )}
        </FlexCell>
      )}
    </Flex>
  );
};
