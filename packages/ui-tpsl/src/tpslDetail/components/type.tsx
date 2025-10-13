import { findTPSLFromOrder } from "@kodiak-finance/orderly-hooks";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
import { API } from "@kodiak-finance/orderly-types";
import { Flex, Text } from "@kodiak-finance/orderly-ui";
import { FlexCell } from "../components/common";

export const TypeRender = ({ order }: { order: API.AlgoOrder }) => {
  const { tp_trigger_price, sl_trigger_price } = findTPSLFromOrder(order);
  const { t } = useTranslation();

  return (
    <Flex
      direction={"column"}
      justify={"between"}
      itemAlign={"start"}
      className="oui-text-2xs"
    >
      {tp_trigger_price && (
        <FlexCell>
          <Text className="oui-text-trade-profit">{t("tpsl.tp")}</Text>
        </FlexCell>
      )}

      {sl_trigger_price && (
        <FlexCell>
          <Text className="oui-text-trade-loss">{t("tpsl.sl")}</Text>
        </FlexCell>
      )}
    </Flex>
  );
};
