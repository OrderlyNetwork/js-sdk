import { FC, useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Flex, Text } from "@orderly.network/ui";
import { useOrderBookContext } from "../../base/orderBook/orderContext";

interface Props {
  quote: string;
  base: string;
}

export const Header: FC<Props> = (props) => {
  const { t } = useTranslation();

  const { mode, onModeChange } = useOrderBookContext();

  const currency = useMemo(() => {
    return mode === "amount" ? props.quote : props.base;
  }, [mode, props.quote, props.base]);

  return (
    <Flex
      justify={"between"}
      width={"100%"}
      className="oui-py-[5px] oui-text-2xs oui-text-base-contrast-36"
    >
      <Flex
        direction={"column"}
        itemAlign={"start"}
        id="oui-order-book-header-price"
      >
        <Text>{t("common.price")}</Text>
        <Text>{`(${props.quote})`}</Text>
      </Flex>
      <Flex
        direction={"column"}
        itemAlign={"end"}
        className="oui-cursor-pointer"
        onClick={() => {
          onModeChange?.(mode === "amount" ? "quantity" : "amount");
        }}
      >
        <Text>{t("common.total")}</Text>
        <Text>{`(${currency})`}</Text>
      </Flex>
    </Flex>
  );
};
