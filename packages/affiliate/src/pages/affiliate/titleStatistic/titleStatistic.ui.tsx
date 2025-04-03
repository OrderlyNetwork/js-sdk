import { FC } from "react";
import { Flex, Select, Text } from "@orderly.network/ui";
import { VolBarChart } from "@orderly.network/chart";
import { TitleStatisticReturns } from "./titleStatistic.script";
import { Decimal } from "@orderly.network/utils";
import { useTranslation } from "@orderly.network/i18n";

export const TitleStatistic: FC<TitleStatisticReturns> = (props) => {
  return (
    <Flex
      id="oui-affiliate-affiliate-titleStatistic"
      r={"2xl"}
      p={6}
      width={"100%"}
      gap={4}
      direction={"column"}
      className="oui-bg-base-9"
    >
      <Title {...props} />
      <Flex className="oui-h-[170px] 2xl:oui-h-[196px] oui-w-full oui-flex oui-flex-row oui-items-stretch">
        <VolBarChart
          data={props.dataSource || []}
          colors={{ fill: "rgba(0, 180, 158, 1)" }}
          className="oui-w-full oui-flex-1"
          tooltip={{
            rm: Decimal.ROUND_DOWN,
            dp: props.volType === "Commission" ? 6 : 2,
          }}
        />
      </Flex>
    </Flex>
  );
};

const Title: FC<TitleStatisticReturns> = (props) => {
  const { t } = useTranslation();

  return (
    <Flex direction={"row"} justify={"between"} width={"100%"}>
      <Text className="oui-text-lg">{t("affiliate.statistics")}</Text>
      <Flex direction={"row"} gap={2} className={"oui-min-w-14"}>
        <Select.options
          size={"xs"}
          value={props.period}
          onValueChange={props.onPeriodChange}
          options={props.periodTypes}
        />
        <Select.options
          size={"xs"}
          value={props.volType}
          onValueChange={props.onVolTypeChange}
          options={props.volTypes}
        />
      </Flex>
    </Flex>
  );
};
