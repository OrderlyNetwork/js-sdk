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

export type PnlLineChartProps = {
  colors?: {
    profit: string;
    loss: string;
  };
  data: any;
};

const PnlLineChart = (props: PnlLineChartProps) => {
  const colors = useColors(props.colors);

  const dataTransfer = (data: any[]) => {
    const series: any[] = [];

    data.reduce((acc, item) => {
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

  console.log(data);

  return (
    <ResponsiveContainer>
      <LineChart
        data={data}
        margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
      >
        <CartesianGrid vertical={false} stroke="#FFFFFF" strokeOpacity={0.04} />
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
        <YAxis
          dataKey="pnl"
          tick={{ fontSize: 10, fill: "rgba(255,255,255,0.54)" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip cursor={{ strokeDasharray: "3 2", strokeOpacity: 0.16 }} />
        {/* <ReferenceLine y={0} stroke="#000" /> */}

        <Line
          type="natural"
          dataKey="pnl"
          stroke={colors.primary}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export { PnlLineChart };
