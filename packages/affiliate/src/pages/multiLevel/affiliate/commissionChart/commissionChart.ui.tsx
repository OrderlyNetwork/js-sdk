import { FC } from "react";
import { VolBarChart } from "@orderly.network/chart";
import { useTranslation } from "@orderly.network/i18n";
import { Flex, Select, Text } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { TitleStatisticReturns } from "./commissionChart.script";

export const CommissionChart: FC<TitleStatisticReturns> = (props) => {
  const { t } = useTranslation();

  return (
    <Flex
      id="oui-affiliate-affiliate-titleStatistic"
      r={"2xl"}
      p={6}
      width={"100%"}
      gap={4}
      direction={"column"}
      className="oui-border oui-border-line-6 oui-bg-base-9"
    >
      <Flex justify={"between"} width={"100%"}>
        <Text size="lg">{`${t("affiliate.commission")} (USDC)`}</Text>
        <div>
          <Select.options
            size={"xs"}
            value={props.period}
            onValueChange={props.onPeriodChange}
            options={props.periodTypes}
          />
        </div>
      </Flex>

      <Flex className="oui-flex oui-h-[170px] oui-w-full oui-flex-row oui-items-stretch 2xl:oui-h-[196px]">
        <VolBarChart
          data={props.dataSource!}
          colors={{ fill: "rgba(0, 180, 158, 1)" }}
          className="oui-w-full oui-flex-1"
          tooltip={{
            rm: Decimal.ROUND_DOWN,
            dp: 2,
          }}
        />
      </Flex>
    </Flex>
  );
};
