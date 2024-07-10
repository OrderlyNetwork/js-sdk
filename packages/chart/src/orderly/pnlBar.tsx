import { FC, useMemo } from "react";
import { getThemeColors } from "../utils/theme";
import { useColors } from "./useColors";
import {
  BarChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Bar,
  Cell,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Cross,
} from "recharts";

export type PnLChartDataItem = {
  date: string;
  pnl: number;
};

export type PnLChartProps = {
  colors?: {
    profit: string;
    loss: string;
  };
  data: PnLChartDataItem[];
};

const RoundedRectangle = (props: any) => {
  const { fill, x, y, width, height } = props;

  const absHeight = Math.abs(height);

  return (
    <rect
      rx={2}
      x={x}
      y={height > 0 ? y : y + height}
      width={width}
      height={absHeight}
      stroke="none"
      fill={fill}
    />
  );
};

const CustomizedCross = (props: any) => {
  const { width, height, stroke, fill } = props;
  // console.log(props);
  // get first series in chart
  // const firstSeries = formattedGraphicalItems[0];
  // // get any point at any index in chart
  // const secondPoint = firstSeries?.props?.points[1];

  // render custom content using points from the graph
  return (
    <Cross
      y={props.y + props.top}
      x={props.x + props.width / 2}
      height={height}
      width={1}
      stroke={"rgba(255,255,255,0.16)"}
      strokeDasharray={"3 2"}
      fill={"none"}
    />
  );
};

export const PnLBarChart: FC<PnLChartProps> = (props) => {
  const colors = useColors(props.colors);

  // const data = useMemo(
  //   () => props.data.map((item) => ({ ...item, date: new Date(item.date) })),
  //   [props.data]
  // );

  return (
    <ResponsiveContainer>
      <BarChart
        data={props.data}
        margin={{ left: 0, top: 20, right: 10, bottom: 25 }}
      >
        <Tooltip cursor={{ fillOpacity: 0.1 }} />
        <CartesianGrid vertical={false} stroke="#FFFFFF" strokeOpacity={0.04} />
        <ReferenceLine y={0} stroke="#000" />
        <Bar dataKey="pnl" shape={<RoundedRectangle />}>
          {props.data.map((entry, index) => {
            return (
              <Cell
                key={`cell-${index}`}
                fill={entry.pnl > 0 ? colors.profit : colors.loss}
              />
            );
          })}
        </Bar>

        <YAxis
          tick={{ fontSize: 10, fill: "rgba(255,255,255,0.54)" }}
          tickLine={false}
          axisLine={false}
          dataKey={"pnl"}
        />
        <XAxis
          dataKey="date"
          // axisLine={false}
          tickLine={false}
          interval={props.data.length - 2}
          // tick={renderQuarterTick}
          height={1}
          // scale="time"
          tick={{ fontSize: 10, fill: "rgba(255,255,255,0.54)" }}
          stroke="#FFFFFF"
          strokeOpacity={0.04}
        />
      </BarChart>
    </ResponsiveContainer>
  );

  // return (
  //   <>
  //     <Bar color={(d) => (d.pnl > 0 ? colors.profit : colors.loss)} />
  //     <Legend>
  //       <circle cx={3} cy={-5} r="3" fill={colors.profit} />
  //       <text fontSize={12} x={10} fill={colors.profit}>
  //         Profits
  //       </text>
  //       <circle cx={63} cy={-5} r="3" fill={colors.loss} />
  //       <text x={70} fontSize={12} fill={colors.loss}>
  //         Losses
  //       </text>
  //     </Legend>
  //   </>
  // );
};
