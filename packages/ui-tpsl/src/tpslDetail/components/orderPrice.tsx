import { findTPSLOrderPriceFromOrder } from "@kodiak-finance/orderly-hooks";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
import { API, OrderType } from "@kodiak-finance/orderly-types";
import { Flex, Text } from "@kodiak-finance/orderly-ui";
import { Decimal } from "@kodiak-finance/orderly-utils";
import { FlexCell } from "../components/common";
import { useTPSLDetailContext } from "../tpslDetailProvider";

export const OrderPriceRender = ({ order }: { order: API.AlgoOrder }) => {
  const { quote_dp } = useTPSLDetailContext();
  const { tp_order_price, sl_order_price } = findTPSLOrderPriceFromOrder(order);
  const { t } = useTranslation();
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
            <Text>{t("common.market")}</Text>
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
            <Text>{t("common.market")}</Text>
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
