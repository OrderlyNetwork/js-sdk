import { CSSProperties, useMemo } from "react";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
import { BBOOrderType } from "@kodiak-finance/orderly-types";
import { Box, Select, Text } from "@kodiak-finance/orderly-ui";

export const BBOOrderTypeSelect = (props: {
  value?: BBOOrderType;
  onChange: (value: BBOOrderType) => void;
  contentStyle?: CSSProperties;
}) => {
  const { t } = useTranslation();

  const options = useMemo(
    () => [
      {
        label: t("orderEntry.bbo.counterparty1"),
        value: BBOOrderType.COUNTERPARTY1,
      },
      {
        label: t("orderEntry.bbo.counterparty5"),
        value: BBOOrderType.COUNTERPARTY5,
      },
      {
        label: t("orderEntry.bbo.queue1"),
        value: BBOOrderType.QUEUE1,
      },
      {
        label: t("orderEntry.bbo.queue5"),
        value: BBOOrderType.QUEUE5,
      },
    ],
    [],
  );

  return (
    <Select.options
      testid="oui-testid-orderEntry-bbo-orderType-button"
      currentValue={props.value}
      value={props.value}
      options={options}
      onValueChange={props.onChange}
      contentProps={{
        className: "oui-bg-base-8 oui-w-full",
        style: props.contentStyle,
      }}
      size={"sm"}
      classNames={{
        trigger: "oui-border-none oui-bg-transparent",
      }}
      valueFormatter={(value, option) => {
        const item = options.find((item) => item.value === value);

        return (
          <Box>
            <Text size="sm">{item?.label}</Text>
          </Box>
        );
      }}
    />
  );
};
