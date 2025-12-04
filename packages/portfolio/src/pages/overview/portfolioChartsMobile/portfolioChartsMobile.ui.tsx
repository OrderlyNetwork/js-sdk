/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useId } from "react";
import { Area, AreaChart } from "@veltodefi/chart";
import { useTranslation } from "@veltodefi/i18n";
import { EMPTY_LIST } from "@veltodefi/types";
import { ChevronRightIcon, cn, Flex, Text } from "@veltodefi/ui";
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
  const colorId = useId();
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
          <Text.pnl coloring size="base" weight="semibold" visible={visible}>
            {unrealPnL}
          </Text.pnl>
          <Text.roi
            coloring
            rule="percentages"
            size="sm"
            weight="semibold"
            prefix={"("}
            suffix={")"}
            visible={visible}
          >
            {unrealROI}
          </Text.roi>
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
        <AreaChart data={data || EMPTY_LIST} width={160} height={52}>
          {!invisible && (
            <>
              <defs>
                <linearGradient id={colorId} x1="0" y1="0" x2="0" y2="1">
                  <stop stopColor="#00B49E" offset="0%" stopOpacity={0.5} />
                  <stop stopColor="#00B49E" offset="100%" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="natural"
                dataKey="account_value"
                stroke={"rgb(41, 233, 169)"}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
                fill={`url(#${colorId})`}
              />
            </>
          )}
        </AreaChart>
      </Flex>
    </Flex>
  );
};
