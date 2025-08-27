import React, { useMemo, useRef } from "react";
// import { Line } from "../line/line";
import {
  LineChart,
  XAxis,
  YAxis,
  Line,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TooltipProps } from "recharts";
import type { Props as ResponsiveContainerProps } from "recharts/types/component/ResponsiveContainer";
import { useTranslation } from "@orderly.network/i18n";
import { useScreen } from "@orderly.network/ui";
import { numberToHumanStyle } from "@orderly.network/utils";
import { getThemeColors } from "../utils/theme";
import { tickFormatter } from "../utils/yTickFormatter";
import { OrderlyChartTooltip } from "./customTooltip";
import { useColors } from "./useColors";
import { XAxisLabel } from "./xAxisLabel";

export type PnlLineChartProps = {
  colors?: {
    profit: string;
    loss: string;
  };
  data: any;
  invisible?: boolean;
  responsiveContainerProps?: Omit<ResponsiveContainerProps, "children">;
};

const CustomTooltip: React.FC<TooltipProps<any, any>> = (props) => {
  const { active, payload, label } = props;
  const todayStr = useRef(new Date().toISOString().split("T")[0]);
  const { t } = useTranslation();

  if (active && payload && payload.length) {
    return (
      <OrderlyChartTooltip
        label={label === todayStr.current ? t("chart.now") : label}
        value={payload[0].value}
        coloring
      />
    );
  }

  return null;
};

const dataTransfer = (data: any[]) => {
  const series: any[] = [];
  data?.reduce((acc, item) => {
    acc += item.pnl;
    series.push({ ...item, pnl: acc, _pnl: item.pnl });
    return acc;
  }, 0);
  return series;
};

const PnlLineChart: React.FC<PnlLineChartProps> = (props) => {
  const { responsiveContainerProps } = props;
  const colors = useColors(props.colors);

  const { isMobile } = useScreen();

  const data = useMemo(() => dataTransfer(props.data), [props.data]);

  return (
    <ResponsiveContainer
      className={props.invisible ? "chart-invisible" : ""}
      {...responsiveContainerProps}
    >
      <LineChart
        data={data}
        margin={{ top: 20, right: 10, left: -10, bottom: 0 }}
      >
        <CartesianGrid vertical={false} stroke="#FFFFFF" strokeOpacity={0.04} />
        <XAxis
          dataKey="date"
          interval={props.data.length - 2}
          tick={<XAxisLabel />}
          stroke="#FFFFFF"
          strokeOpacity={0.04}
        />

        <YAxis
          dataKey="pnl"
          tick={{ fontSize: 10, fill: "rgba(255,255,255,0.54)" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => tickFormatter(value)}
        />

        {!props.invisible && (
          <Tooltip
            cursor={{ strokeDasharray: "3 2", strokeOpacity: 0.16 }}
            content={<CustomTooltip />}
          />
        )}

        {!props.invisible && (
          <Line
            type="natural"
            dataKey="pnl"
            stroke={colors.primary}
            strokeWidth={isMobile ? 1.5 : 2}
            dot={false}
            isAnimationActive={false}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};

export { PnlLineChart };
