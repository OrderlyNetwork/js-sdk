/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Line, LineChart } from "@orderly.network/chart";
import { useTranslation } from "@orderly.network/i18n";
import { EMPTY_LIST } from "@orderly.network/types";
import { ChevronRightIcon, cn, Flex, Text } from "@orderly.network/ui";
import { usePortfolioChartsState } from ".";

export const PortfolioChartsMobileUI: React.FC<
  ReturnType<typeof usePortfolioChartsState> & {
    data: any[];
    invisible?: boolean;
  }
> = (props) => {
  const { data, invisible, unrealPnL, unrealROI, visible, onPerformanceClick } =
    props;
  const { t } = useTranslation();
  return (
    <Flex
      p={4}
      width={"100%"}
      itemAlign="center"
      justify="between"
      className={cn(
        "oui-relative oui-overflow-hidden oui-rounded-2xl oui-border oui-border-solid oui-border-line-12 oui-bg-base-9",
      )}
    >
      <Flex
        width={"100%"}
        justify={"center"}
        itemAlign={"start"}
        direction={"column"}
        gap={2}
      >
        <Text size="xs" intensity={54}>
          {t("common.unrealizedPnl")}
        </Text>
        <Flex justify={"start"} itemAlign={"center"}>
          <Text.numeral
            coloring
            size="base"
            weight="semibold"
            visible={visible}
          >
            {unrealPnL}
          </Text.numeral>
          <Text.numeral
            coloring
            rule="percentages"
            size="sm"
            weight="semibold"
            prefix={"("}
            suffix={")"}
            visible={visible}
          >
            {unrealROI}
          </Text.numeral>
        </Flex>
        <Text
          size="xs"
          intensity={54}
          className="oui-flex oui-items-center oui-justify-start oui-gap-1"
          onClick={onPerformanceClick}
        >
          {t("portfolio.overview.performance")}
          <ChevronRightIcon className="oui-text-base-contrast-54" />
        </Text>
      </Flex>
      <Flex
        width={"100%"}
        justify={"center"}
        itemAlign={"center"}
        direction={"column"}
      >
        <LineChart data={data || EMPTY_LIST} width={150} height={65}>
          {!invisible && (
            <Line
              type="natural"
              dataKey="account_value"
              stroke={"rgb(41, 233, 169)"}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          )}
        </LineChart>
      </Flex>
    </Flex>
  );
};
