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
import { Flex } from "@orderly.network/ui";

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

  if (active && payload && payload.length) {
    return (
      <OrderlyChartTooltip label={label} value={payload[0].value} coloring />
    );
  }

  return null;
};

export const PnLBarChart = (props: PnLChartProps) => {
  const { invisible } = props;
  const colors = useColors(props.colors);

  return (
    // @ts-ignore
    <Box className="oui-h-full">
      <Flex
        className="oui-text-2xs oui-font-semibold"
        gap={3}
        px={3}
        pt={3}
        pb={2}
      >
        <Flex style={{ color: colors.profit }} gap={1}>
          <svg
            width="6"
            height="6"
            viewBox="0 0 6 6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="3" cy="3" r="3" fill={colors.profit} />
          </svg>
          <span>Profits</span>
        </Flex>{" "}
        <Flex style={{ color: colors.loss }} gap={1}>
          <svg
            width="6"
            height="6"
            viewBox="0 0 6 6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="3" cy="3" r="3" fill={colors.loss} />
          </svg>
          <span>Losses</span>
        </Flex>
      </Flex>
      <div
        style={{ height: "calc(100% - 38px)" }}
        className={cn(invisible && "chart-invisible")}
      >
        {/* @ts-ignore */}
        <ResponsiveContainer>
          {/* @ts-ignore */}
          <BarChart
            data={props.data}
            margin={{ left: 0, top: 10, right: 10, bottom: 25 }}
          >
            {!invisible && (
              // @ts-ignore
              <Tooltip
                // cursor={{ fillOpacity: 0.1 }}
                cursor={<CustomizedCross />}
                content={<CustomTooltip />}
              />
            )}

            <CartesianGrid
              vertical={false}
              stroke="#FFFFFF"
              strokeOpacity={0.04}
            />
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
              tick={{ fontSize: 10, fill: "rgba(255,255,255,0.54)" }}
              stroke="#FFFFFF"
              strokeOpacity={0.04}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Box>
  );
};
