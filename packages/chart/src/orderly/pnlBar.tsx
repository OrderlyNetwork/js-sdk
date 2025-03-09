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
import { cn } from "@orderly.network/ui";
import { useRef } from "react";
import { tickFormatter } from "../utils/yTickFormatter";
import { useTranslation } from "@orderly.network/i18n";

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
  invisible?: boolean;
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

export const XAxisLabel = (props: any) => {
  const { x, y, stroke, payload, index, width, containerWidth } = props;
  const { t } = useTranslation();
  const _x =
    index === 0
      ? 48
      : containerWidth > 0
      ? containerWidth - 10
      : width + payload.offset;

  return (
    <g transform={`translate(${_x},${y - 6})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor={index === 0 ? "start" : "end"}
        // textAnchor={"start"}
        fontSize={10}
        fill={"rgba(255,255,255,0.54)"}
      >
        {index === 0 ? payload.value : t("chart.now")}
      </text>
    </g>
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

const CustomTooltip = (props: TooltipProps<any, any>) => {
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

export const PnLBarChart = (props: PnLChartProps) => {
  const { invisible } = props;
  const colors = useColors(props.colors);
  const widthRef = useRef(0);

  return (
    // @ts-ignore
    <ResponsiveContainer
      className={cn(invisible && "chart-invisible")}
      onResize={(width, height) => {
        // console.log("width", width, height);
        widthRef.current = width;
      }}
    >
      {/* @ts-ignore */}
      <BarChart
        data={props.data}
        margin={{ left: -10, top: 10, right: 10, bottom: 30 }}
      >
        {!invisible && (
          // @ts-ignore
          <Tooltip
            // cursor={{ fillOpacity: 0.1 }}
            cursor={<CustomizedCross />}
            content={<CustomTooltip />}
          />
        )}

        <CartesianGrid vertical={false} stroke="#FFFFFF" strokeOpacity={0.04} />
        <ReferenceLine y={0} stroke="rgba(0,0,0,0.04)" />

        {!invisible && (
          // @ts-ignore
          <Bar dataKey="pnl" shape={<RoundedRectangle />}>
            {props.data.map((entry, index) => {
              return (
                // @ts-ignore
                <Cell
                  key={`cell-${index}`}
                  fill={entry.pnl > 0 ? colors.profit : colors.loss}
                />
              );
            })}
          </Bar>
        )}
        {/* @ts-ignore */}
        <YAxis
          tick={{ fontSize: 10, fill: "rgba(255,255,255,0.54)" }}
          tickFormatter={(value) => tickFormatter(value)}
          tickLine={false}
          axisLine={false}
          dataKey={"pnl"}
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
          // tick={{ fontSize: 10, fill: "rgba(255,255,255,0.54)" }}
          tick={<XAxisLabel containerWidth={widthRef.current} />}
          stroke="#FFFFFF"
          strokeOpacity={0.04}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
