import { cn } from "@orderly.network/react";
import { useEffect, useMemo, useRef, useState } from "react";
import "./barChart.css";
import { formatMdTime } from "../utils/utils";

export type BarStyle = {
    //** default is 12 */
    width: number,
    //** default is `#B64FFF` */
    fill: string,
    //** default is 2 */
    rx: number,
    //** default is 2 */
    ry: number,
    //** default is 10 */
    columnPadding: number,
    //** default is "rgba(255,255,255,0.2)" */
    hoverLineStroke: string,
    //** default is 1 */
    hoverLineStrokeWidth: number,
    //** default is 227 */
    hoverContainerWidth: number,
}

export type YAxis = {
    //** default is 55 */
    width: number,
    //** default is 10 */
    fontSize: number,
    //** default is 5 */
    gridCount: number,
    //** default is 8 */
    gridPaddingLeft: number,
    //** default is 30 */
    gridPaddingTop: number,
    //** default is "rgba(255,255,255,0.2)" */
    gridStroke: string,
    //** default is 1 */
    strokeWidth: number,
    //** default is "rgba(255, 255, 255, 0.36)" */
    textFill: string,
    //** default is end */
    textAnchor: string,
    min?: number,
    max?: number,
}

export type XAxis = {
    //** default is 30 */
    height: number,
    //** default is 10 */
    fontSize: number,
    //** default is "rgba(255, 255, 255, 0.36)" */
    textFill: string,
    //** default is "middle" */
    textAnchor: string,
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
}

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

type ChartSize = { width: number, height: number };

/**
 * 
 *  data is array, this element is [string, number]
 */
export const ColmunChart: React.FC<{
    className?: string,
    data: any[],
    hoverTitle?: string,
    barStyle?: BarStyle,
    yAxis?: YAxis,
    xAxis?: XAxis,
}> = (props) => {
    const {
        data = [],
        className,
        hoverTitle,
        barStyle = InitialBarStyle,
        yAxis = InitialYAxis,
        xAxis = InitialXAxis
    } = props;
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState<ChartSize>({ height: 0, width: 0 });

    const [hoverItem, setHoverItem] = useState<{ x: number, y: number, item: any[] } | undefined>();



    useEffect(() => {
        const handleResize = () => {
            const rect = chartContainerRef.current?.getBoundingClientRect();
            if (!rect) return;
            setSize({ width: rect.width, height: rect.height });
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        }
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

            return info;
        } catch (err) {
            return undefined;
        }
    }, [data, yAxis]);

    const yAxisChildren = useMemo(() => {
        if (size.height === 0 || size.width === 0 || (!minMaxInfo)) {
            return (<></>);
        }



        const children: any[] = [];
        const height = size.height - xAxis.height - yAxis.gridPaddingTop;
        const stepY = height / (yAxis.gridCount - 1);
        const stepValue = minMaxInfo.min + (minMaxInfo.max - minMaxInfo.min) / (yAxis.gridCount - 1);

        for (let i = 0; i < yAxis.gridCount; i++) {
            const info = {
                y: stepY * i + yAxis.gridPaddingTop,
                text: (minMaxInfo.max - stepValue * i).toFixed(2),
            }
            const gridX = yAxis.width + yAxis.gridPaddingLeft;
            const gridY = info.y;

            children.push(
                <line x1={`${gridX}`} y1={`${gridY}`} x2={`${size.width}`} y2={`${gridY}`} stroke={`${yAxis.gridStroke}`} strokeWidth={`${yAxis.strokeWidth}`} />
            );
            children.push(
                <text x={`${yAxis.width}`} y={`${info.y}`} textAnchor={`${yAxis.textAnchor}`} fontSize={`${yAxis.fontSize}px`} fill={`${yAxis.textFill}`}>
                    {info.text}
                </text>
            );
        }


        return children;

    }, [size, minMaxInfo, yAxis, xAxis, data,]);

    const xAxisChildren = useMemo(() => {
        const titles = data.map((e) => e[0]);
        var children: any[] = [];

        const padding = yAxis.width + yAxis.gridPaddingLeft + barStyle.columnPadding;
        var stepX = (size.width - padding - barStyle.width * 2) / (titles.length - 1);
        for (let index = 0; index < titles.length; index++) {
            const title = titles[index];

            const x = padding + stepX * index + 6;
            const y = size.height - xAxis.fontSize;

            children.push(
                <text x={`${x}`} y={`${y}`} textAnchor={`${xAxis.textAnchor}`} fontSize={`${xAxis.fontSize}px`} fill={`${xAxis.textFill}`}>{title}</text>
            );
        }

        return children;
    }, [size, minMaxInfo, yAxis, xAxis, data, barStyle]);

    const columns = useMemo(() => {
        if (data.length === 0 || (!minMaxInfo)) {
            return (<></>);
        }
        const columns = data.map((e) => e[1]);
        var children: any[] = [];


        const padding = yAxis.width + yAxis.gridPaddingLeft + barStyle.columnPadding;
        var stepX = (size.width - padding - barStyle.width * 2) / (columns.length - 1);
        const containerHeight = size.height - xAxis.height - yAxis.gridPaddingTop;
        for (let index = 0; index < columns.length; index++) {
            const column = columns[index];

            const x = padding + stepX * index;
            // const y = size.height - xAxis.fontSize;
            const height = containerHeight - convertToYCoordinate(column, minMaxInfo.min, minMaxInfo.max, containerHeight);
            const y = (containerHeight - height) + yAxis.gridPaddingTop;


            // console.log("columns", column, x, y, height);

            children.push(
                <rect
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
                <line x1={x} y1={`${0}`} x2={x} y2={`${y}`} stroke={`${barStyle.hoverLineStroke}`} strokeWidth={`${barStyle.hoverLineStrokeWidth}`} />
            );
        }

        return children;

    }, [hoverItem, barStyle]);

    const hoverX = useMemo(() => {
        if (!hoverItem) return 0;

        const hoverWidth = barStyle.hoverContainerWidth;
        if (hoverItem.x > size.width / 2) {
            const x = hoverItem.x - hoverWidth;
            if (x < 0) {
                return 0;
            }
            return x;
        } else {
            if (hoverItem.x + hoverWidth + 12 > size.width) {
                return 0;
            }
            return hoverItem.x + 12;
        }

    }, [hoverItem, size]);

    return (
        <div ref={chartContainerRef} className={cn("orderly-w-full orderly-h-full orderly-relative", className)} >

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
            {hoverItem && <div
                className="orderly-absolute orderly-bg-base-500 orderly-rounded-lg orderly-p-3 orderly-top-0"
                style={{
                    marginLeft: hoverX,
                    pointerEvents: 'none',
                    width: `${barStyle.hoverContainerWidth}px`
                }}
            >
                <div className="orderly-flex orderly-text-xs ordelry-gap-2">
                    <div className="orderly-flex-1">{hoverTitle}</div>
                    <div className="orderly-flex-1 orderly-flex orderly-justify-end">
                        {hoverItem.item[1]}
                        <div className="orderly-text-base-contrast-54 orderly-ml-2">USDT</div>
                    </div>
                </div>
                <div className="orderly-flex orderly-justify-end">
                    {hoverItem.item[0]}
                </div>
            </div>}
        </div>
    );


};





function convertToYCoordinate(current: number, min: number, max: number, containerHeight: number) {
    const valueRange = max - min;
    const range = containerHeight;
    const scaledValue = (current - min) * (range / valueRange);
    const coordinate = containerHeight - scaledValue;

    return coordinate;
}

function findMinMax(arr: [string, number][], maxRate: number = 1): { min: number, max: number } {
    if ((arr?.length || 0) === 0) {
        throw new Error('Array is empty');
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


export const emptyDataSource = (isLG: boolean) => {
    const date = Date.now();

    return Array.from({ length: isLG ? 7 : 14 }, (_, index) => {
        const timestamp = date - (86400 * index) * 1000;
        return [
            formatMdTime(timestamp),
            0
        ]

    }).reverse();

};


//** default min is 0, max is 4000 */
export function emptyDataSourceYAxis(options?: { min: number, max: number }): YAxis {
    return { ...InitialYAxis, min: options?.min || 0, max: options?.max || 4000 };
}
