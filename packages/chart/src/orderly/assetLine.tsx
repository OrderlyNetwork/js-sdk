import { useMemo } from "react";
import { getThemeColors } from "../utils/theme";
import { useColors } from "./useColors";
// import { Line } from "../line/line";
import { Box, Text } from "@orderly.network/ui";
import {
  LineChart,
  XAxis,
  YAxis,
  Line,
  CartesianGrid,
  Tooltip,
  Label,
  ResponsiveContainer,
} from "recharts";

import type { TooltipProps } from "recharts";
import { OrderlyChartTooltip } from "./customTooltip";

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
};

const CustomTooltip = (props: TooltipProps<any, any>) => {
  const { active, payload, label } = props;
  if (active && payload && payload.length) {
    return <OrderlyChartTooltip label={label} value={payload[0].value} />;
  }

  return null;
};

const AssetLineChart = (props: PnlLineChartProps) => {
  const colors = useColors(props.colors);

  // const dataTransfer = (data: any[]) => {
  //   const series: any[] = [];

  //   data.reduce((acc, item) => {
  //     acc += item.pnl;
  //     series.push({ ...item, pnl: acc, _pnl: item.pnl });
  //     return acc;
  //   }, 0);

  //   return series;
  // };

  // const data = useMemo(() => dataTransfer(props.data), [props.data]);

  return (
    // @ts-ignore
    <ResponsiveContainer className={props.invisible ? "chart-invisible" : ""}>
      {/* @ts-ignore */}
      <LineChart
        width={530}
        height={150}
        data={props.data}
        margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
      >
        <CartesianGrid vertical={false} stroke="#FFFFFF" strokeOpacity={0.04} />
        {/* @ts-ignore */}
        <XAxis
          dataKey="date"
          interval={props.data.length - 2}
          tick={{ fontSize: 10, fill: "rgba(255,255,255,0.54)" }}
          stroke="#FFFFFF"
          strokeOpacity={0.04}
        ></XAxis>
        {/* @ts-ignore */}
        <YAxis
          dataKey="account_value"
          tick={{ fontSize: 10, fill: "rgba(255,255,255,0.54)" }}
          tickLine={false}
          axisLine={false}
        />
        {/* @ts-ignore */}
        {!props.invisible && (
          // @ts-ignore
          <Tooltip
            cursor={{ strokeDasharray: "3 2", strokeOpacity: 0.16 }}
            content={<CustomTooltip />}
          />
        )}

        {/* <Legend />  */}
        {/* @ts-ignore */}
        {!props.invisible && (
          // @ts-ignore
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
