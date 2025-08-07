import { useMemo, ReactNode } from "react";
import { PnLBarChart, PnlLineChart } from "@orderly.network/chart";
import { useTranslation } from "@orderly.network/i18n";
import { EMPTY_LIST } from "@orderly.network/types";
import {
  Card,
  Grid,
  Box,
  Statistic,
  Text,
  Flex,
  Tooltip,
  cn,
} from "@orderly.network/ui";
import { PeriodTitle } from "../shared/periodHeader";
import { PeriodType } from "../shared/useAssetHistory";
import { UsePerformanceScriptReturn } from "./performance.script";

export type PerformanceUIProps = {
  // periodTypes: string[];
  // period: string;
  // onPeriodChange: (period: string) => void;
} & UsePerformanceScriptReturn;

export const PerformanceUI = (props: PerformanceUIProps) => {
  const {
    periodTypes,
    period,
    onPeriodChange,
    aggregateValue,
    invisible,
    visible,
    volumeUpdateDate,
  } = props;
  const { t } = useTranslation();

  const periodLabel = useMemo(() => {
    return {
      [PeriodType.WEEK]: t("common.select.7d"),
      [PeriodType.MONTH]: t("common.select.30d"),
      [PeriodType.QUARTER]: t("common.select.90d"),
    };
  }, [t]);
  return (
    <Card
      // @ts-ignore
      title={
        <PeriodTitle
          onPeriodChange={onPeriodChange}
          periodTypes={periodTypes}
          period={period}
          title={t("portfolio.overview.performance")}
        />
      }
      id="portfolio-overview-performance"
    >
      <Grid cols={3} gap={4}>
        <Box
          gradient="neutral"
          r="md"
          px={4}
          py={2}
          angle={184}
          border
          borderColor={6}
        >
          <Statistic
            label={
              <LabelWithHint
                label={t("portfolio.overview.performance.roi", {
                  period: periodLabel[period as PeriodType],
                })}
                hint={t("portfolio.overview.performance.roi.tooltip")}
              />
            }
            // @ts-ignore
            valueProps={{
              rule: "percentages",
              coloring: true,
              visible,
            }}
          >
            {invisible ? "--" : aggregateValue.roi}
          </Statistic>
        </Box>
        <Box
          gradient="neutral"
          r="md"
          px={4}
          py={2}
          angle={184}
          border
          borderColor={6}
        >
          <Statistic
            label={
              <LabelWithHint
                label={t("portfolio.overview.performance.pnl", {
                  period: periodLabel[period as PeriodType],
                })}
                hint={t("portfolio.overview.performance.pnl.tooltip")}
              />
            }
            // @ts-ignore
            valueProps={{
              coloring: true,
              showIdentifier: true,
              visible,
            }}
          >
            {invisible ? "--" : aggregateValue.pnl}
          </Statistic>
        </Box>
        <Box
          gradient="neutral"
          r="md"
          px={4}
          py={2}
          angle={184}
          border
          borderColor={6}
        >
          <Statistic
            classNames={{
              label: "oui-w-full",
            }}
            label={
              <Flex justify={"between"}>
                <span>
                  <LabelWithHint
                    label={t("portfolio.overview.performance.volume", {
                      period: periodLabel[period as PeriodType],
                    })}
                    hint={t("portfolio.overview.performance.volume.tooltip")}
                  />
                </span>
                <span>{volumeUpdateDate}</span>
              </Flex>
            }
          >
            {invisible ? "--" : aggregateValue.vol}
          </Statistic>
        </Box>
      </Grid>
      <Grid cols={2} gap={4}>
        <PerformancePnL
          data={props.data ?? EMPTY_LIST}
          invisible={props.invisible}
        />
        <CumulativePnlChart
          data={props.data ?? EMPTY_LIST}
          invisible={props.invisible || (props.data?.length ?? 0) <= 2}
        />
      </Grid>
    </Card>
  );
};

type LabelWithHintProps = {
  label: string;
  hint?: ReactNode;
};

const LabelWithHint: React.FC<LabelWithHintProps> = (props) => {
  const { label, hint } = props;
  return (
    <Tooltip
      open={hint ? undefined : false}
      content={hint}
      className="oui-max-w-[240px] oui-bg-base-6 "
      arrow={{ className: "oui-fill-base-6" }}
      delayDuration={300}
    >
      <Text
        size="xs"
        intensity={36}
        className={cn(
          hint &&
            "oui-cursor-pointer oui-border-b oui-border-dashed oui-border-line-12",
        )}
      >
        {label}
      </Text>
    </Tooltip>
  );
};

export const PerformancePnL = (props: {
  data: ReadonlyArray<any> | any[];
  invisible: boolean;
}) => {
  // console.log(props.data);
  // const tickValues = useMemo(() => {
  //   if (!Array.isArray(props.data) || !props.data.length) return;
  //   return [props.data[0].date, props.data[props.data?.length - 1].date];
  // }, [props.data]);
  const { t } = useTranslation();
  return (
    <Box mt={4} height={"188px"}>
      <Text as="div" size="sm" className="oui-mb-3">
        {t("portfolio.overview.performance.dailyPnl")}
      </Text>
      <Box r="md" className="oui-border oui-border-line-4 oui-h-[188px]">
        <PnLBarChart
          data={props.data}
          invisible={props.invisible || (props.data?.length ?? 0) <= 2}
        />
      </Box>
    </Box>
  );
};

export const CumulativePnlChart = (props: {
  data: ReadonlyArray<any> | any[];
  invisible: boolean;
}) => {
  const { t } = useTranslation();

  return (
    <Box mt={4}>
      <Text as="div" size="sm" className="oui-mb-3">
        {t("portfolio.overview.performance.cumulativePnl")}
      </Text>
      <Box r="md" className="oui-border oui-border-line-4 oui-h-[188px]">
        <PnlLineChart
          data={props.data}
          invisible={props.invisible || (props.data?.length ?? 0) <= 2}
        />
        {/* <Chart data={props.data} x={"date"} y={"pnl"}>
          <Axis orientation="left" />
        </Chart> */}
      </Box>
    </Box>
  );
};
