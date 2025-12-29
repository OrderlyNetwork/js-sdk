import { useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { OrderSide, OrderType } from "@orderly.network/types";
import {
  CaretDownIcon,
  cn,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  Select,
  Text,
  useScreen,
} from "@orderly.network/ui";

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

  const isAdvancedType = useMemo(() => {
    return (
      props.type === OrderType.STOP_LIMIT ||
      props.type === OrderType.STOP_MARKET ||
      props.type === OrderType.SCALED ||
      props.type === OrderType.TRAILING_STOP
    );
  }, [props.type]);

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

        <DropdownMenuRoot>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={
                isAdvancedType
                  ? selectedButtonClassName
                  : unselectedButtonClassName
              }
              aria-haspopup="menu"
              aria-expanded={undefined}
              aria-label={t("trading.layout.advanced")}
              disabled={!props.canTrade}
              data-testid="oui-testid-orderEntry-orderType-advanced"
            >
              <Text size="xs">{t("trading.layout.advanced")}</Text>
              <CaretDownIcon size={12} className="oui-text-inherit" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="oui-bg-base-8">
            <DropdownMenuGroup>
              {advancedOptions.map((opt) => {
                return (
                  <DropdownMenuItem
                    key={opt.value}
                    size="xs"
                    onSelect={() => handleChange(opt.value)}
                    data-testid={`oui-testid-orderEntry-orderType-advanced-${opt.value}`}
                  >
                    <span>{opt.label}</span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenuRoot>
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
        className: "oui-bg-base-8",
      }}
      classNames={{
        trigger: "oui-bg-base-7 oui-border-line-12 oui-h-8 oui-rounded-md",
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
