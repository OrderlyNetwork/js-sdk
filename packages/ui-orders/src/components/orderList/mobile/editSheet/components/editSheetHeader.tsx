import { useTranslation } from "@veltodefi/i18n";
import { API, OrderSide } from "@veltodefi/types";
import { Badge, Flex, Text } from "@veltodefi/ui";
import { parseBadgesFor } from "../../../../../utils/util";

type EditSheetHeaderProps = {
  item: API.AlgoOrderExt;
};

export const EditSheetHeader = (props: EditSheetHeaderProps) => {
  const { item } = props;
  const { t } = useTranslation();

  return (
    <Flex width={"100%"} justify={"between"}>
      <Text.formatted rule={"symbol"} showIcon intensity={80}>
        {item.symbol}
      </Text.formatted>
      <Flex direction={"row"} gap={1}>
        {parseBadgesFor(props.item)?.map((e, index) => (
          <Badge
            key={index}
            color={e.toLocaleLowerCase() === "position" ? "primary" : "neutral"}
            size="xs"
          >
            {e}
          </Badge>
        ))}
        {item.side === OrderSide.BUY ? (
          <Badge color="success" size="xs">
            {t("common.buy")}
          </Badge>
        ) : (
          <Badge color="danger" size="xs">
            {t("common.sell")}
          </Badge>
        )}
      </Flex>
    </Flex>
  );
};
