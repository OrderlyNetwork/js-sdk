import { Button, cn } from "@orderly.network/react";
import { TriangleDownIcon } from "../icons";
import { useEffect, useMemo, useRef, useState } from "react";
import "./barChart.css";

export const BarChart = () => {


    return (
        <div className="orderly-p-6 orderly-outline orderly-outline-1 orderly-outline-base-600">
            <div className="orderly-flex orderly-justify-between">
                <div className="orderly-text-xs orderly-text-base-contrast-36">USDC</div>
                <Button color={"tertiary"} className="orderly-flex">
                    Commission
                    <TriangleDownIcon className="orderly-ml-1" />
                </Button>
            </div>

            <Chart data={[
                ['2023-10-19', 3800],
                ['2023-10-20', 1800],
                ['2023-10-21', 1900],
                ['2023-10-22', 800],
                ['2023-10-23', 2500]
            ]}
            />
        </div>
    );
}

type ChartSize = { width: number, height: number };

/**
 * 
 *  data is array, this element is [title, value]
 */
const Chart: React.FC<{ className?: string, data: any[] }> = (props) => {
    const { data, className } = props;
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState<ChartSize>({ height: 0, width: 0 });

    const yAxis = {
        width: 44,
        fontSize: 10,
        gridCount: 5,
        gridPaddingLeft: 8,
        gridPaddingTop: 30,
    };
    const xAxis = {
        height: 30,
        fontSize: 10,
        columnPadding: 10,
    };

    useEffect(() => {
        const handleResize = () => {

            const rect = chartContainerRef.current?.getBoundingClientRect();

            if (!rect) return;
            setSize({ width: rect.width, height: rect.height });

            // const chartContainerWidth = rect.width;
            // const columnCount = 6;
            // const columnWidth = 12;
            // const columnSpacing = (chartContainerWidth - columnCount * columnWidth) / (columnCount - 1);

            // 控制台打印父级容器的宽度和计算得到的列间距
            // console.log("父级容器宽度: ", chartContainerWidth);
            // console.log("列间距: ", columnSpacing);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        }
    }, []);

    const minMaxInfo = useMemo(() => {
        return findMinMax(data, 1);
    }, [data]);

    const yAxisChildren = useMemo(() => {
        if (size.height === 0 || size.width === 0) {
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
                <line x1={`${gridX}`} y1={`${gridY}`} x2={`${size.width}`} y2={`${gridY}`} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            );
            children.push(
                <text x="44" y={`${info.y}`} textAnchor="end" fontSize="10px" fill="rgba(255, 255, 255, 0.36)" className="hover:orderly-text-red-300">
                    {info.text}
                </text>
            );
        }


        return children;

    }, [size, minMaxInfo, yAxis, xAxis, data]);

    const xAxisChildren = useMemo(() => {
        const titles = data.map((e) => e[0]);
        var children: any[] = [];

        const padding = yAxis.width + yAxis.gridPaddingLeft + xAxis.columnPadding;
        var stepX = (size.width - padding) / titles.length;
        for (let index = 0; index < titles.length; index++) {
            const title = titles[index];

            const x = padding + stepX * index;
            const y = size.height - xAxis.fontSize;

            children.push(
                <text x={`${x}`} y={`${y}`} textAnchor="middle" fontSize="10px" fill="rgba(255, 255, 255, 0.36)">{title}</text>
            );
        }

        return children;
    }, [size, minMaxInfo, yAxis, xAxis, data]);

    const columns = useMemo(() => {
        const columns = data.map((e) => e[1]);
        var children: any[] = [];

        const padding = yAxis.width + yAxis.gridPaddingLeft + xAxis.columnPadding;
        var stepX = (size.width - padding) / columns.length;
        const containerHeight = size.height - xAxis.height - yAxis.gridPaddingTop;
        for (let index = 0; index < columns.length; index++) {
            const column = columns[index];

            const x = padding + stepX * index;
            // const y = size.height - xAxis.fontSize;
            const height = containerHeight - convertToYCoordinate(column, minMaxInfo.min, minMaxInfo.max, containerHeight);
            const y = (containerHeight - height) + yAxis.gridPaddingTop;


            console.log("columns", column, x, y, height);

            children.push(
                <rect x={`${x}`} y={`${y}`} width="12" height={`${height}`} rx="2" ry="2" fill="#FF8CFF" class="column" />
            );
        }

        return children;
    }, [size, minMaxInfo, yAxis, xAxis, data]);

    return (
        <div ref={chartContainerRef} className={cn("orderly-w-full orderly-h-[350px]", props.className)} >
            <svg height="100%" style={{ width: `${size.width}px` }}>
                {/* yAxis */}
                <g>{yAxisChildren}</g>

                {/* xAxis */}
                <g>{xAxisChildren}</g>

                {/* columns */}
                <g>{columns}</g>
            </svg>
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
    if (arr.length === 0) {
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