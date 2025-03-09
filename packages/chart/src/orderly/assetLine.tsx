import { useColors } from "./useColors";
// import { Line } from "../line/line";
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
import { OrderlyChartTooltip } from "./customTooltip";
import { XAxisLabel } from "./xAxisLabel";
import { useRef } from "react";
import { tickFormatter } from "../utils/yTickFormatter";
import { useTranslation } from "@orderly.network/i18n";

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
        height={180}
        data={props.data}
        margin={{ top: 20, right: 10, left: -20, bottom: -10 }}
      >
        <CartesianGrid vertical={false} stroke="#FFFFFF" strokeOpacity={0.04} />
        {/* @ts-ignore */}
        <XAxis
          dataKey="date"
          interval={props.data.length - 2}
          // tick={{ fontSize: 10, fill: "rgba(255,255,255,0.54)" }}
          tick={<XAxisLabel />}
          stroke="#FFFFFF"
          strokeOpacity={0.04}
        ></XAxis>
        {/* @ts-ignore */}
        <YAxis
          dataKey="account_value"
          tick={{ fontSize: 10, fill: "rgba(255,255,255,0.54)" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => tickFormatter(value)}
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
