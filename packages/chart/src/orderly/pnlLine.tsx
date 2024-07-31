import { useMemo } from "react";
import { getThemeColors } from "../utils/theme";
import { useColors } from "./useColors";
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
import { OrderlyChartTooltip } from "./customTooltip";

export type PnlLineChartProps = {
  colors?: {
    profit: string;
    loss: string;
  };
  data: any;
  invisible?: boolean;
};

const CustomTooltip = (props: TooltipProps<any, any>) => {
  const { active, payload, label } = props;

  if (active && payload && payload.length) {
    return (
      <OrderlyChartTooltip label={label} value={payload[0].value} coloring />
    );
  }

  return null;
};

const PnlLineChart = (props: PnlLineChartProps) => {
  const colors = useColors(props.colors);

  const dataTransfer = (data: any[]) => {
    const series: any[] = [];

    data?.reduce((acc, item) => {
      acc += item.pnl;
      series.push({
        ...item,
        pnl: acc,
        _pnl: item.pnl,
        // date: new Date(item.date).getTime(),
      });
      return acc;
    }, 0);

    return series;
  };

  const data = useMemo(() => dataTransfer(props.data), [props.data]);

  return (
    // @ts-ignore
    <ResponsiveContainer className={props.invisible ? "chart-invisible" : ""}>
      {/* @ts-ignore */}
      <LineChart
        data={data}
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
          // scale={"time"}
          // type="number"
          // range={}
        />
        {/* @ts-ignore */}
        <YAxis
          dataKey="pnl"
          tick={{ fontSize: 10, fill: "rgba(255,255,255,0.54)" }}
          tickLine={false}
          axisLine={false}
        />
        {/* @ts-ignore */}
        {!props.invisible && (
          <Tooltip
            cursor={{ strokeDasharray: "3 2", strokeOpacity: 0.16 }}
            content={<CustomTooltip />}
          />
        )}

        {/* <ReferenceLine y={0} stroke="#000" /> */}
        {/* @ts-ignore */}
        {!props.invisible && (
          <Line
            type="natural"
            dataKey="pnl"
            stroke={colors.primary}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};

export { PnlLineChart };
