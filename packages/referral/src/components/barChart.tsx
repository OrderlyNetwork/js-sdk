import { cn } from "@orderly.network/react";
import { Decimal, getTimestamp } from "@orderly.network/utils";
import { useEffect, useMemo, useRef, useState } from "react";
import "./barChart.css";
import { formatMdTime } from "../utils/utils";

export type BarStyle = {
  //** default is 12 */
  width: number;
  //** default is `#B64FFF` */
  fill: string;
  //** default is 2 */
  rx: number;
  //** default is 2 */
  ry: number;
  //** default is 10 */
  columnPadding: number;
  //** default is "rgba(255,255,255,0.2)" */
  hoverLineStroke: string;
  //** default is 1 */
  hoverLineStrokeWidth: number;
  //** default is 227 */
  hoverContainerWidth: number;
  //** max display count */
  maxCount?: number;
};

export type YAxis = {
  //** default is 55 */
  width: number;
  //** default is 10 */
  fontSize: number;
  //** default is 5 */
  gridCount: number;
  //** default is 8 */
  gridPaddingLeft: number;
  //** default is 30 */
  gridPaddingTop: number;
  //** default is "rgba(255,255,255,0.2)" */
  gridStroke: string;
  //** default is 1 */
  strokeWidth: number;
  //** default is "rgba(255, 255, 255, 0.36)" */
  textFill: string;
  //** default is end */
  textAnchor: string;
  min?: number;
  max?: number;
  maxRate?: number;
};

export type XAxis = {
  //** default is 30 */
  height: number;
  //** default is 10 */
  fontSize: number;
  //** default is "rgba(255, 255, 255, 0.36)" */
  textFill: string;
  //** default is "middle" */
  textAnchor: string;
  xTitle?: (item: any[]) => string;
};

export type ChartHover = {
  hoverTitle?: string;
  fontSize?: number;
  titleFill?: string;
  subtitleFill?: string;
  title?: (hoverItem: any[]) => string;
  subtitle?: (hoverItem: any[]) => string;
};

export const InitialBarStyle: BarStyle = {
  width: 12,
  fill: "#B64FFF",
  rx: 2,
  ry: 2,
  columnPadding: 10,
  hoverLineStroke: "rgba(255,255,255,0.2)",
  hoverLineStrokeWidth: 1,
  hoverContainerWidth: 227,
};

export const InitialYAxis: YAxis = {
  width: 44,
  fontSize: 10,
  gridCount: 5,
  gridPaddingLeft: 8,
  gridPaddingTop: 30,
  gridStroke: "rgba(255,255,255,0.2)",
  strokeWidth: 1,
  textFill: "rgba(255, 255, 255, 0.36)",
  textAnchor: "end",
};

export const InitialXAxis: XAxis = {
  height: 30,
  fontSize: 10,
  textFill: "rgba(255, 255, 255, 0.36)",
  textAnchor: "middle",
};

type ChartSize = { width: number; height: number };

/**
 *
 *  data is array, this element is [string, number]
 */
export const ColmunChart: React.FC<{
  className?: string;
  data: any[];

  barStyle?: BarStyle;
  yAxis?: YAxis;
  xAxis?: XAxis;
  chartHover?: ChartHover;
}> = (props) => {
  const {
    data = [],
    className,
    barStyle = InitialBarStyle,
    yAxis = InitialYAxis,
    xAxis = InitialXAxis,
    chartHover,
  } = props;
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<ChartSize>({ height: 0, width: 0 });

  const [hoverItem, setHoverItem] = useState<
    { x: number; y: number; item: any[] } | undefined
  >();

  useEffect(() => {
    const handleResize = () => {
      const rect = chartContainerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setSize({ width: rect.width, height: rect.height });
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [data]);

  const minMaxInfo = useMemo(() => {
    try {
      const info = findMinMax(data, 1);
      if (yAxis.min) {
        info["min"] = yAxis.min;
      }
      if (yAxis.max) {
        info["max"] = yAxis.max;
      }

      if (yAxis.maxRate) {
        info["max"] = info.max * yAxis.maxRate;
      }

      return info;
    } catch (err) {
      return undefined;
    }
  }, [data, yAxis]);

  const yAxisChildren = useMemo(() => {
    if (size.height === 0 || size.width === 0 || !minMaxInfo) {
      return <></>;
    }

    const children: any[] = [];
    const height = size.height - xAxis.height - yAxis.gridPaddingTop;
    const stepY = height / (yAxis.gridCount - 1);
    const stepValue =
      minMaxInfo.min +
      (minMaxInfo.max - minMaxInfo.min) / (yAxis.gridCount - 1);

    for (let i = 0; i < yAxis.gridCount; i++) {
      const info = {
        y: stepY * i + yAxis.gridPaddingTop,
        text: (minMaxInfo.max - stepValue * i).toFixed(2),
      };
      const gridX = yAxis.width + yAxis.gridPaddingLeft;
      const gridY = info.y;

      children.push(
        <line
          key={`y-grid-line-${i}`}
          x1={`${gridX}`}
          y1={`${gridY}`}
          x2={`${size.width}`}
          y2={`${gridY}`}
          stroke={`${yAxis.gridStroke}`}
          strokeWidth={`${yAxis.strokeWidth}`}
        />
      );
      children.push(
        <text
          key={`y-text-${i}`}
          x={`${yAxis.width}`}
          y={`${info.y}`}
          textAnchor={`${yAxis.textAnchor}`}
          fontSize={`${yAxis.fontSize}px`}
          fill={`${yAxis.textFill}`}
        >
          {abbreviatedNumbers(info.text)}
        </text>
      );
    }

    return children;
  }, [size, minMaxInfo, yAxis, xAxis, data]);

  const xAxisChildren = useMemo(() => {
    const titles = data.map((e) => e[0]);
    var children: any[] = [];

    // const padding = yAxis.width + yAxis.gridPaddingLeft + barStyle.columnPadding;
    // const maxCount = (barStyle.maxCount || (titles.length)) - 1;
    // var stepX = (size.width - padding - barStyle.width * 2) / maxCount;

    const leftPading =
      yAxis.width + yAxis.gridPaddingLeft + barStyle.columnPadding;
    const padding = leftPading + barStyle.columnPadding;
    const maxCount = (barStyle.maxCount || titles.length) - 1;
    let stepX = (size.width - padding - barStyle.width) / maxCount;

    if (!isFinite(stepX) || Number.isNaN(stepX)) {
      stepX = 0;
    }
    for (let index = 0; index < titles.length; index++) {
      let title = titles[index];

      if (xAxis.xTitle) {
        title = xAxis.xTitle(data[index]);
      }

      const x = leftPading + stepX * index + 6;
      const y = size.height - xAxis.fontSize;

      children.push(
        <text
          key={`x-axis-${index}`}
          x={`${x}`}
          y={`${y}`}
          textAnchor={`${xAxis.textAnchor}`}
          fontSize={`${xAxis.fontSize}px`}
          fill={`${xAxis.textFill}`}
        >
          {title}
        </text>
      );
    }

    return children;
  }, [size, minMaxInfo, yAxis, xAxis, data, barStyle]);

  const columns = useMemo(() => {
    if (data.length === 0 || !minMaxInfo) {
      return <></>;
    }
    const columns = data.map((e) => e[1]);
    var children: any[] = [];

    const leftPading =
      yAxis.width + yAxis.gridPaddingLeft + barStyle.columnPadding;
    const padding = leftPading + barStyle.columnPadding;
    const maxCount = (barStyle.maxCount || columns.length) - 1;
    let stepX = (size.width - padding - barStyle.width) / maxCount;

    if (!isFinite(stepX) || Number.isNaN(stepX)) {
      stepX = 0;
    }
    const containerHeight = size.height - xAxis.height - yAxis.gridPaddingTop;
    for (let index = 0; index < columns.length; index++) {
      const column = columns[index];

      const x = leftPading + stepX * index;
      // const y = size.height - xAxis.fontSize;
      const height =
        containerHeight -
        convertToYCoordinate(
          column,
          minMaxInfo.min,
          minMaxInfo.max,
          containerHeight
        );
      const y = containerHeight - height + yAxis.gridPaddingTop;

      // console.log(`colums: ${columns}, stepX: ${stepX} leftPading: ${leftPading} padding: ${padding} x: ${x} y: ${y} height: ${height} ${isFinite(stepX)}, width: ${size.width}, barStyle:`, barStyle);

      if (Number.isNaN(height) || !Number.isFinite(height)) continue;
      children.push(
        <rect
          key={`column-${index}`}
          x={`${x}`}
          y={`${y}`}
          width={`${barStyle.width}`}
          height={`${height}`}
          rx={`${barStyle.rx}`}
          ry={`${barStyle.ry}`}
          fill={`${barStyle.fill}`}
          onMouseEnter={() => {
            setHoverItem({ x, y, item: data[index] });
          }}
          onMouseLeave={() => setHoverItem(undefined)}
        />
      );
    }

    return children;
  }, [size, minMaxInfo, yAxis, xAxis, data, barStyle]);

  const hover = useMemo(() => {
    const children: any[] = [];

    if (hoverItem) {
      const x = hoverItem.x + 6 - 0.5;
      const y = hoverItem.y;
      children.push(
        <line
          key={"hover-line"}
          x1={x}
          y1={`${0}`}
          x2={x}
          y2={`${y}`}
          stroke={`${barStyle.hoverLineStroke}`}
          strokeWidth={`${barStyle.hoverLineStrokeWidth}`}
        />
      );
    }

    return children;
  }, [hoverItem, barStyle]);

  const hoverX = useMemo(() => {
    if (!hoverItem) return 0;

    const hoverWidth = barStyle.hoverContainerWidth;
    if (hoverItem.x > size.width / 2) {
      const x = hoverItem.x - hoverWidth - 5;
      if (x < 5) {
        return 5;
      }
      return x;
    } else {
      if (hoverItem.x + hoverWidth + 12 > size.width) {
        return 5;
      }
      return hoverItem.x + 12 + 5;
    }
  }, [hoverItem, size]);

  return (
    <div
      ref={chartContainerRef}
      className={cn(
        "orderly-w-full orderly-h-full orderly-relative",
        className
      )}
    >
      {data && (
        <svg height="100%" style={{ width: `${size.width}px` }}>
          {/* yAxis */}
          <g>{yAxisChildren}</g>

          {/* xAxis */}
          <g>{xAxisChildren}</g>

          {/* columns */}
          <g>{columns}</g>

          {/* hover */}
          <g>{hover}</g>
        </svg>
      )}
      {hoverItem && (
        <div
          className="orderly-absolute orderly-bg-base-500 orderly-rounded-[6px] orderly-p-3 orderly-top-0"
          style={{
            marginLeft: hoverX,
            pointerEvents: "none",
            width: `${barStyle.hoverContainerWidth}px`,
          }}
        >
          <div className="orderly-flex orderly-text-xs ordelry-gap-2">
            <div className="orderly-flex-1">{chartHover?.hoverTitle}</div>
            <div className="orderly-flex-1 orderly-flex orderly-justify-end">
              {chartHover?.title?.(hoverItem.item) ||
                abbreviatedNumbers(hoverItem.item[1])}
              <div className="orderly-text-base-contrast-54 orderly-ml-2">
                USDC
              </div>
            </div>
          </div>
          <div className="orderly-flex orderly-justify-end orderly-text-[12px] orderly-text-base-contrast-54 orderly-mt-2">
            {chartHover?.subtitle?.(hoverItem.item) || hoverItem.item[0]}
          </div>
        </div>
      )}
    </div>
  );
};

function convertToYCoordinate(
  current: number,
  min: number,
  max: number,
  containerHeight: number
) {
  const valueRange = max - min;
  const range = containerHeight;
  const scaledValue = (current - min) * (range / valueRange);
  const coordinate = containerHeight - scaledValue;

  return coordinate;
}

function findMinMax(
  arr: [string, number][],
  maxRate: number = 1
): { min: number; max: number } {
  if ((arr?.length || 0) === 0) {
    throw new Error("Array is empty");
  }

  let min = arr[0][1];
  let max = arr[0][1];

  for (let i = 1; i < arr.length; i++) {
    const number = arr[i][1];

    if (number < min) {
      min = number;
    }

    if (number > max) {
      max = number;
    }
  }

  return { min: 0, max: max * (maxRate || 1) };
}

export const emptyDataSource = (level7: boolean) => {
  const date = getTimestamp();

  return Array.from({ length: level7 ? 7 : 14 }, (_, index) => {
    const timestamp = date - 86400 * index * 1000;
    return [formatMdTime(timestamp), 0];
  }).reverse();
};

//** default min is 0, max is 4000 */
export function emptyDataSourceYAxis(options?: {
  min: number;
  max: number;
}): YAxis {
  return { ...InitialYAxis, min: options?.min || 0, max: options?.max || 4000 };
}

//** Abbreviated numbers, eg: 1234 1.2k */
export function abbreviatedNumbers(input?: string | number | undefined) {
  if (input === undefined || input === null) return "";

  const value = Number.parseFloat(input.toString());
  const absNumber = Math.abs(value);
  const suffixes = ["", "k", "m", "b", "t", "q"];

  if (absNumber === 0) {
    return "0";
  }

  if (absNumber < 0.01) {
    return new Decimal(`${absNumber}`)
      .toDecimalPlaces(6, Decimal.ROUND_DOWN)
      .toString();
  }

  if (absNumber < 1000) {
    return new Decimal(`${absNumber}`)
      .toDecimalPlaces(2, Decimal.ROUND_DOWN)
      .toString();
  }

  const magnitude = Math.floor(Math.log10(absNumber) / 3);
  const scaledNumber = value / Math.pow(10, magnitude * 3);
  const formattedNumber = new Decimal(`${scaledNumber}`)
    .toDecimalPlaces(2, Decimal.ROUND_DOWN)
    .toString();

  return formattedNumber + suffixes[magnitude];
}
