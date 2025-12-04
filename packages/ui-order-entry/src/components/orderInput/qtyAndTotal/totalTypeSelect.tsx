import { FC, memo, useMemo } from "react";
import { useTranslation } from "@veltodefi/i18n";
import { cn, Select } from "@veltodefi/ui";

export enum OrderTotalType {
  OrderSize = "orderSize",
  InitialMargin = "initialMargin",
}

type TotalTypeSelectProps = {
  value: OrderTotalType;
  onChange: (value: OrderTotalType) => void;
};

export const TotalTypeSelect: FC<TotalTypeSelectProps> = memo((props) => {
  const { t } = useTranslation();

  const options = useMemo(() => {
    return [
      {
        label: t("orderEntry.orderSize"),
        value: OrderTotalType.OrderSize,
      },
      {
        label: t("orderEntry.initialMargin"),
        value: OrderTotalType.InitialMargin,
      },
    ];
  }, [t]);

  return (
    <Select.options
      size={"xs"}
      value={props.value}
      valueFormatter={(value, option) => {
        const item = options.find((o) => o.value === value);
        return item?.label + "≈";
      }}
      classNames={{
        trigger: cn(
          "oui-w-auto oui-border-none oui-bg-transparent",
          "oui-absolute oui-left-0 oui-top-[5px] oui-text-2xs oui-text-base-contrast-36",
        ),
      }}
      onValueChange={props.onChange}
      options={options}
    />
  );
});

TotalTypeSelect.displayName = "TotalTypeSelect";
