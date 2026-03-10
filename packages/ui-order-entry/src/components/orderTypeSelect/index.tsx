import { useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { OrderSide, OrderType } from "@orderly.network/types";
import { cn, Select, Text, useScreen } from "@orderly.network/ui";

export const OrderTypeSelect = (props: {
  type: OrderType;
  onChange: (type: OrderType) => void;
  side: OrderSide;
  canTrade: boolean;
}) => {
  const { t } = useTranslation();
  const { isMobile } = useScreen();

  const allOptions = useMemo(() => {
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

  const advancedOptions = useMemo(() => {
    return [
      {
        label: t("orderEntry.orderType.stopLimit"),
        value: OrderType.STOP_LIMIT,
      },
      {
        label: t("orderEntry.orderType.stopMarket"),
        value: OrderType.STOP_MARKET,
      },
      { label: t("orderEntry.orderType.scaledOrder"), value: OrderType.SCALED },
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
      [OrderType.TRAILING_STOP]: t("orderEntry.orderType.trailingStop"),
    };
  }, [t]);

  if (!isMobile) {
    const baseButtonClassName =
      "oui-flex oui-flex-1 oui-items-center oui-justify-center oui-gap-x-1 oui-rounded oui-px-3 oui-py-0.5 oui-text-xs oui-font-semibold oui-h-8";

    const selectedButtonClassName = cn(
      baseButtonClassName,
      "oui-bg-base-5 oui-text-base-contrast",
    );
    const unselectedButtonClassName = cn(
      baseButtonClassName,
      "oui-bg-base-7 oui-text-base-contrast-36",
    );

    const handleChange = (type: OrderType) => {
      props.onChange(type);
    };

    return (
      <div
        className="oui-flex oui-w-full oui-gap-1"
        data-testid="oui-testid-orderEntry-orderType-desktop"
      >
        <button
          type="button"
          className={
            props.type === OrderType.LIMIT
              ? selectedButtonClassName
              : unselectedButtonClassName
          }
          aria-pressed={props.type === OrderType.LIMIT}
          onClick={() => handleChange(OrderType.LIMIT)}
          disabled={!props.canTrade}
          data-testid="oui-testid-orderEntry-orderType-limit"
        >
          <Text size="xs">{t("orderEntry.orderType.limit")}</Text>
        </button>

        <button
          type="button"
          className={
            props.type === OrderType.MARKET
              ? selectedButtonClassName
              : unselectedButtonClassName
          }
          aria-pressed={props.type === OrderType.MARKET}
          onClick={() => handleChange(OrderType.MARKET)}
          disabled={!props.canTrade}
          data-testid="oui-testid-orderEntry-orderType-market"
        >
          <Text size="xs">{t("orderEntry.orderType.market")}</Text>
        </button>

        <div
          className="oui-flex-1"
          data-testid="oui-testid-orderEntry-orderType-advanced"
        >
          <Select.options
            testid="oui-testid-orderEntry-orderType-advanced-select"
            currentValue={props.type}
            value={props.type}
            options={advancedOptions}
            onValueChange={props.onChange}
            placeholder={t("trading.layout.advanced")}
            disabled={!props.canTrade}
            contentProps={{
              className: "oui-bg-base-8",
            }}
            classNames={{
              trigger: "oui-bg-base-7 oui-border-none oui-h-8 oui-rounded-md",
            }}
            valueFormatter={(value, option) => {
              const isAdvanced =
                value === OrderType.STOP_LIMIT ||
                value === OrderType.STOP_MARKET ||
                value === OrderType.SCALED ||
                value === OrderType.TRAILING_STOP;
              if (!isAdvanced) {
                return (
                  <Text size="xs" className="oui-text-base-contrast-80">
                    {option.placeholder}
                  </Text>
                );
              }
              const label =
                displayLabelMap[value as keyof typeof displayLabelMap];
              return (
                <Text size="xs" className="oui-text-base-contrast-80">
                  {label}
                </Text>
              );
            }}
            size="md"
          />
        </div>
      </div>
    );
  }

  return (
    <Select.options
      testid="oui-testid-orderEntry-orderType-button"
      currentValue={props.type}
      value={props.type}
      options={allOptions}
      onValueChange={props.onChange}
      contentProps={{
        className: cn(
          "oui-orderEntry-orderTypeSelect-content",
          "oui-bg-base-8",
        ),
      }}
      classNames={{
        trigger: cn(
          "oui-orderEntry-orderTypeSelect-btn",
          "oui-bg-base-7 oui-border-line-12 oui-h-8 oui-rounded-md",
        ),
      }}
      valueFormatter={(value, option) => {
        const item = allOptions.find((o) => o.value === value);
        if (!item) {
          return <Text size={"xs"}>{option.placeholder}</Text>;
        }

        const label = displayLabelMap[value as keyof typeof displayLabelMap];

        return (
          <Text size={"xs"} className="oui-text-base-contrast-80">
            {label}
          </Text>
        );
      }}
      size={"md"}
    />
  );
};
