import { useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { OrderSide, OrderType } from "@orderly.network/types";
import { Select, Text } from "@orderly.network/ui";

export const OrderTypeSelect = (props: {
  type: OrderType;
  onChange: (type: OrderType) => void;
  side: OrderSide;
  canTrade: boolean;
}) => {
  const { t } = useTranslation();

  const options = useMemo(() => {
    return [
      { label: t("orderEntry.orderType.limitOrder"), value: OrderType.LIMIT },
      { label: t("orderEntry.orderType.marketOrder"), value: OrderType.MARKET },
      {
        label: t("orderEntry.orderType.stopLimit"),
        value: OrderType.STOP_LIMIT,
      },
      {
        label: t("orderEntry.orderType.stopMarket"),
        value: OrderType.STOP_MARKET,
      },
      {
        label: t("orderEntry.orderType.scaledOrder"),
        value: OrderType.SCALED,
      },
      {
        label: t("orderEntry.orderType.trailingStop"),
        value: OrderType.TRAILING_STOP,
      },
    ];
  }, [t]);

  const displayLabelMap = useMemo(() => {
    return {
      [OrderType.LIMIT]: t("orderEntry.orderType.limit"),
      [OrderType.MARKET]: t("common.marketPrice"),
      [OrderType.STOP_LIMIT]: t("orderEntry.orderType.stopLimit"),
      [OrderType.STOP_MARKET]: t("orderEntry.orderType.stopMarket"),
      [OrderType.SCALED]: t("orderEntry.orderType.scaledOrder"),
    };
  }, [t]);

  return (
    <Select.options
      testid="oui-testid-orderEntry-orderType-button"
      currentValue={props.type}
      value={props.type}
      options={options}
      onValueChange={props.onChange}
      contentProps={{
        className: "oui-bg-base-8 oui-w-full",
      }}
      valueFormatter={(value, option) => {
        const item = options.find((o) => o.value === value);
        if (!item) {
          return <Text size={"xs"}>{option.placeholder}</Text>;
        }

        const label = displayLabelMap[value as keyof typeof displayLabelMap];

        return (
          <Text
            size={"xs"}
            color={
              props.canTrade
                ? props.side === OrderSide.BUY
                  ? "buy"
                  : "sell"
                : undefined
            }
          >
            {label}
          </Text>
        );
      }}
      size={"md"}
    />
  );
};
