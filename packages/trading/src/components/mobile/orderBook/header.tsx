import React, { FC, useMemo } from "react";
import { useLocalStorage } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import {
  CaretDownIcon,
  CaretUpIcon,
  cn,
  Flex,
  Picker,
  Text,
} from "@orderly.network/ui";
import { SelectOption } from "@orderly.network/ui/src/select/withOptions";
import { ORDERBOOK_MOBILE_COIN_TYPE_KEY } from "../../base/orderBook/orderContext";

interface Props {
  quote: string;
  base: string;
}

export const Header: FC<Props> = (props) => {
  const { t } = useTranslation();

  const { base, quote } = props;

  const [coinType, setCoinType] = useLocalStorage(
    ORDERBOOK_MOBILE_COIN_TYPE_KEY,
    base,
  );

  // const { mode, onModeChange } = useOrderBookContext();

  const options = useMemo<SelectOption[]>(() => {
    return [
      {
        value: "qty",
        label: `${t("common.quantity")}(${base})`,
        data: [t("common.quantity"), base],
      },
      {
        value: base,
        label: `${t("common.total")}(${base})`,
        data: [t("common.total"), base],
      },
      {
        value: quote,
        label: `${t("common.total")}(${quote})`,
        data: [t("common.total"), quote],
      },
    ];
  }, [t, base, quote]);

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
        <Text>{`(${quote})`}</Text>
      </Flex>
      <Picker
        size="sm"
        value={coinType}
        onValueChange={setCoinType}
        options={options}
        valueRenderer={(_, { open, data }) => {
          return (
            <Flex justify="between" itemAlign="center" gap={1}>
              {Array.isArray(data) && (
                <Flex direction={"column"} itemAlign={"end"}>
                  {data[0] && <Text>{data[0]}</Text>}
                  {data[1] && <Text>({data[1]})</Text>}
                </Flex>
              )}
              {open ? (
                <CaretUpIcon size={14} color="inherit" />
              ) : (
                <CaretDownIcon size={14} color="inherit" />
              )}
            </Flex>
          );
        }}
      />
    </Flex>
  );
};
