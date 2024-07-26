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
import type { TooltipProps } from "recharts";
import { OrderlyChartTooltip } from "./customTooltip";
import { Box, cn } from "@orderly.network/ui";

export type VolChartDataItem = {
  date: string;
  volume: number;
  opacity?: string | number;
};

export type VolChartProps = {
  colors?: {
    fill: string;
  };
  data: VolChartDataItem[];
  tooltipPrefix?: string;
  className?: string;
};

const RoundedRectangle = (props: any) => {
  const { fill, x, y, width, height, opacity } = props;
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
      opacity={opacity}
    />
  );
};

const CustomizedCross = (props: any) => {
  const { width, height, stroke, fill } = props;

  return (
    // @ts-ignore
    <Cross
      // y={props.y + props.top}
      x={props.x + props.width / 2}
      top={props.top}
      height={height}
      width={1}
      stroke={"rgba(255,255,255,0.16)"}
      strokeDasharray={"3 2"}
      fill={"none"}
    />
  );
};

const CustomTooltip = (
  props: TooltipProps<any, any>,
  tooltipPrefix?: string
) => {
  const { active, payload, label } = props;

  if (active && payload && payload.length) {
    return (
      <OrderlyChartTooltip
        label={label}
        value={payload[0].value}
        // prefix="Commission"
        titleClassName="oui-gap-4"
      />
    );
  }

  return null;
};

export const VolBarChart = (props: VolChartProps) => {
  const colors = useColors(
    props.colors?.fill
      ? { profit: props.colors?.fill, loss: props.colors?.fill }
      : undefined
  );

  const isEmpty = props.data.reduce((a, b) => a + b.volume, 0) === 0;

  return (
    // @ts-ignore
    <Box className={cn(props.className)}>
      {/* @ts-ignore */}
      <ResponsiveContainer>
        {/* @ts-ignore */}
        <BarChart
          data={props.data}
          margin={{ left: 0, top: 10, right: 10, bottom: 25 }}
        >
          {/* @ts-ignore */}
          <Tooltip
            // cursor={{ fillOpacity: 0.1 }}
            cursor={<CustomizedCross />}
            content={<CustomTooltip />}
          />
          <CartesianGrid
            vertical={false}
            stroke="#FFFFFF"
            strokeOpacity={0.04}
          />
          <ReferenceLine y={0} stroke="#000" />
          {/* @ts-ignore */}
          <Bar dataKey="volume" shape={<RoundedRectangle />} minPointSize={1}>
            {props.data.map((entry, index) => {
              return (
                // @ts-ignore
                <Cell
                  key={`cell-${index}`}
                  fill={entry.volume > 0 ? colors.profit : colors.loss}
                  opacity={entry.opacity}
                />
              );
            })}
          </Bar>
          {/* @ts-ignore */}
          <YAxis
            tick={{ fontSize: 10, fill: "rgba(255,255,255,0.54)" }}
            tickLine={false}
            axisLine={false}
            dataKey={"volume"}
            tickFormatter={(value, index) => {
              if (isEmpty) return value === 0 ? "0" : "";
              return value;
            }}
          />
          {/* @ts-ignore */}
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
    </Box>
  );
};
