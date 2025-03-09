import { useMemo } from "react";
import { CardTitle, Flex, Select, Text } from "@orderly.network/ui";
import { useTranslation } from "@orderly.network/i18n";
import { PeriodType } from "./useAssetHistory";

export const PeriodTitle = (props: {
  onPeriodChange: (period: PeriodType) => void;
  periodTypes: string[];
  period: PeriodType;
  title: string;
}) => {
  const { t } = useTranslation();

  const periodLabel = useMemo(() => {
    return {
      [PeriodType.WEEK]: t("portfolio.select.7d"),
      [PeriodType.MONTH]: t("portfolio.select.30d"),
      [PeriodType.QUARTER]: t("portfolio.select.90d"),
    };
  }, [t]);

  return (
    <Flex justify={"between"}>
      <CardTitle>{props.title}</CardTitle>

      <div className={"oui-min-w-14"}>
        <Select.options
          size={"xs"}
          value={props.period}
          onValueChange={props.onPeriodChange}
          options={props.periodTypes.map((item) => ({
            value: item,
            label: periodLabel[item as PeriodType],
          }))}
        />
      </div>
    </Flex>
  );
};
