import { findTPSLFromOrder } from "@kodiak-finance/orderly-hooks";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
import { API } from "@kodiak-finance/orderly-types";
import { Flex, Text } from "@kodiak-finance/orderly-ui";
import { Decimal } from "@kodiak-finance/orderly-utils";
import { FlexCell } from "../components/common";
import { useTPSLDetailContext } from "../tpslDetailProvider";

export const TriggerPrice = ({ order }: { order: API.AlgoOrder }) => {
  const { quote_dp } = useTPSLDetailContext();
  const { tp_trigger_price, sl_trigger_price } = findTPSLFromOrder(order);
  const { t } = useTranslation();
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
            <Text className="oui-text-base-contrast-36">
              {t("common.market")}
            </Text>
            <Text.numeral dp={quote_dp} rm={Decimal.ROUND_DOWN} padding={false}>
              {tp_trigger_price}
            </Text.numeral>
          </Flex>
        </FlexCell>
      )}
      {sl_trigger_price && (
        <FlexCell>
          <Flex direction={"column"} justify={"start"} itemAlign={"start"}>
            <Text className="oui-text-base-contrast-36">
              {t("common.market")}
            </Text>
            <Text.numeral dp={quote_dp} rm={Decimal.ROUND_DOWN} padding={false}>
              {sl_trigger_price}
            </Text.numeral>
          </Flex>
        </FlexCell>
      )}
    </Flex>
  );
};
