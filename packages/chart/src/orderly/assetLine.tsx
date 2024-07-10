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
  Tooltip,
  Label,
  ResponsiveContainer,
} from "recharts";

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
    <ResponsiveContainer>
      <LineChart
        width={530}
        height={150}
        data={props.data}
        margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
      >
        <CartesianGrid
          vertical={false}
          vertical={false}
          stroke="#FFFFFF"
          strokeOpacity={0.04}
        />
        <XAxis
          dataKey="date"
          interval={props.data.length - 2}
          tick={{ fontSize: 10, fill: "rgba(255,255,255,0.54)" }}
          stroke="#FFFFFF"
          strokeOpacity={0.04}
        ></XAxis>
        <YAxis
          dataKey="account_value"
          tick={{ fontSize: 10, fill: "rgba(255,255,255,0.54)" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip cursor={{ strokeDasharray: "3 2", strokeOpacity: 0.16 }} />
        {/* <Legend />  */}
        <Line
          type="natural"
          dataKey="account_value"
          stroke={colors.profit}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export { AssetLineChart };
