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
import { Box, cn } from "@orderly.network/ui";
import { OrderlyChartTooltip } from "./customTooltip";
import { useColors } from "./useColors";

export type VolChartDataItem = {
  date: string;
  volume: number;
  opacity?: string | number;
};

export type VolChartTooltip = {
  rm?: number;
  dp?: number;
};

export type VolChartProps = {
  colors?: { fill: string };
  data: ReadonlyArray<VolChartDataItem> | VolChartDataItem[];
  tooltip?: VolChartTooltip;
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
  const { width, height, payload, stroke, fill } = props;

  if (payload?.[0]?.value === 0) {
    return null;
  }

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
  props: TooltipProps<any, any> & { tooltip?: VolChartTooltip },
) => {
  const { active, payload, label, tooltip } = props;

  if (payload?.[0]?.value === 0) {
    return null;
  }

  if (active && payload && payload.length) {
    return (
      <OrderlyChartTooltip
        label={label}
        value={payload[0].value}
        // prefix="Commission"
        titleClassName="oui-gap-4"
        rm={tooltip?.rm}
        dp={tooltip?.dp}
      />
    );
  }

  return null;
};

export const VolBarChart = (props: VolChartProps) => {
  const colors = useColors(
    props.colors?.fill
      ? { profit: props.colors?.fill, loss: props.colors?.fill }
      : undefined,
  );

  const isEmpty =
    (props.data as any)?.reduce((pre: any, cur: any) => pre + cur.volume, 0) ===
    0;

  const maxVolume = (props.data as any)?.reduce(
    (pre: any, cur: any) => (pre > cur.volume ? pre : cur.volume),
    0,
  );

  const decimal = maxVolume <= 10 ? 2 : maxVolume <= 100 ? 1 : 0;

  return (
    // @ts-ignore
    <Box className={cn(props.className)}>
      {/* @ts-ignore */}
      <ResponsiveContainer>
        {/* @ts-ignore */}
        <BarChart
          data={props.data as any[]}
          margin={{ left: -0, top: 6, right: 0, bottom: 20 }}
        >
          {/* @ts-ignore */}
          <Tooltip
            // cursor={{ fillOpacity: 0.1 }}
            cursor={<CustomizedCross />}
            content={<CustomTooltip tooltip={props.tooltip} />}
          />
          <CartesianGrid
            vertical={false}
            stroke="#FFFFFF"
            strokeOpacity={0.08}
            repeatCount={6}
          />
          {/* @ts-ignore */}
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
              if (isEmpty) return `${index * 100}`;
              return numberToHumanStyle(value, decimal);
            }}
            width={45}
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
            stroke="rgb(229, 231, 235)"
            strokeOpacity={0.2}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};
function numberToHumanStyle(number: number, decimalPlaces: number = 0): string {
  const abbreviations = ["", "K", "M", "B", "T"];

  let index = 0;
  while (number >= 1000 && index < abbreviations.length - 1) {
    number /= 1000;
    index++;
  }

  const roundedNumber = toFixedWithoutRounding(number, decimalPlaces);

  return `${roundedNumber}${abbreviations[index]}`;
}

function toFixedWithoutRounding(num: number, fix: number): string {
  const numStr = num.toString();
  const decimalIndex = numStr.indexOf(".");

  if (decimalIndex === -1 || fix === 0) {
    return numStr.split(".")[0];
  }

  const cutoffIndex = decimalIndex + fix + 1;

  return numStr.slice(0, cutoffIndex);
}
