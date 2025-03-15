import { FC, useMemo } from "react";

import { useOrderBookContext } from "../../base/orderBook/orderContext";
import { Flex, Text } from "@orderly.network/ui";
import { useTranslation } from "@orderly.network/i18n";

interface Props {
  quote: string;
  base: string;
}

export const Header: FC<Props> = (props) => {
  const { t } = useTranslation();

  const { mode, onModeChange } = useOrderBookContext();
  const currency = useMemo(() => {
    if (mode === "amount") {
      return props.quote;
    }
    return props.base;
  }, [mode, props.quote, props.base]);

  const qtyLabel = useMemo(() => {
    return mode === "amount"
      ? t("trading.orderBook.column.value")
      : t("trading.orderBook.column.qty");
  }, [mode, t]);

  return (
    <Flex
      justify={"between"}
      width={"100%"}
      className="oui-text-base-contrast-36 oui-text-2xs oui-py-[5px]"
    >
      <Flex
        direction={"column"}
        itemAlign={"start"}
        id="oui-order-book-header-price"
      >
        <Text>{t("trading.orderBook.column.price")}</Text>
        <Text>{`(${props.quote})`}</Text>
      </Flex>
      <Flex
        direction={"column"}
        itemAlign={"end"}
        className="oui-cursor-pointer"
        onClick={() =>
          onModeChange?.(mode === "amount" ? "quantity" : "amount")
        }
      >
        <Text>{qtyLabel}</Text>
        <Text>{`(${currency})`}</Text>
      </Flex>
    </Flex>
  );
};
