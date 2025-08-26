/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef } from "react";
import {
  LineChart,
  XAxis,
  YAxis,
  Line,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TooltipProps } from "recharts";
import type { Props as ResponsiveContainerProps } from "recharts/types/component/ResponsiveContainer";
import { useTranslation } from "@orderly.network/i18n";
import { tickFormatter } from "../utils/yTickFormatter";
import { OrderlyChartTooltip } from "./customTooltip";
import { useColors } from "./useColors";
import { XAxisLabel } from "./xAxisLabel";

export type AssetChartDataItem = {
  date: string;
  account_value: number;
};

export type PnlLineChartProps = {
  colors?: {
    profit: string;
    loss: string;
  };
  data: AssetChartDataItem[];
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
      />
    );
  }

  return null;
};

const AssetLineChart: React.FC<PnlLineChartProps> = (props) => {
  const { responsiveContainerProps } = props;
  const colors = useColors(props.colors);
  return (
    <ResponsiveContainer
      className={props.invisible ? "chart-invisible" : ""}
      {...responsiveContainerProps}
    >
      <LineChart
        width={530}
        height={180}
        data={props.data}
        margin={{ top: 20, right: 10, left: -20, bottom: -10 }}
      >
        <CartesianGrid vertical={false} stroke="#FFFFFF" strokeOpacity={0.04} />
        <XAxis
          dataKey="date"
          interval={props.data.length - 2}
          // tick={{ fontSize: 10, fill: "rgba(255,255,255,0.54)" }}
          tick={<XAxisLabel />}
          stroke="#FFFFFF"
          strokeOpacity={0.04}
        />
        <YAxis
          dataKey="account_value"
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
        {/* <Legend />  */}
        {!props.invisible && (
          <Line
            type="natural"
            dataKey="account_value"
            stroke={colors.profit}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};

export { AssetLineChart };
