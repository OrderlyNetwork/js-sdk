import { cn } from "@orderly.network/react";
import { useEffect, useMemo, useRef, useState } from "react";
import "./barChart.css";

type ChartSize = { width: number, height: number };

/**
 * 
 *  data is array, this element is [title, value]
 */
export const ColmunChart: React.FC<{ className?: string, data: any[], hoverTitle?: string }> = (props) => {
    const { data = [], className, hoverTitle } = props;
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState<ChartSize>({ height: 0, width: 0 });

    const [hoverItem, setHoverItem] = useState<{ x: number, y: number, item: any[] } | undefined>();

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
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        }
    }, []);

    const minMaxInfo = useMemo(() => {
        try {
            return findMinMax(data, 1);
        } catch (err) {
            return undefined;
        }
    }, [data]);

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
        var stepX = (size.width - padding - 24) / (titles.length - 1);
        for (let index = 0; index < titles.length; index++) {
            const title = titles[index];

            const x = padding + stepX * index + 6;
            const y = size.height - xAxis.fontSize;

            children.push(
                <text x={`${x}`} y={`${y}`} textAnchor="middle" fontSize="10px" fill="rgba(255, 255, 255, 0.36)">{title}</text>
            );
        }

        return children;
    }, [size, minMaxInfo, yAxis, xAxis, data]);

    const columns = useMemo(() => {
        if (data.length === 0 || (!minMaxInfo)) {
            return (<></>);
        }
        const columns = data.map((e) => e[1]);
        var children: any[] = [];


        const padding = yAxis.width + yAxis.gridPaddingLeft + xAxis.columnPadding;
        var stepX = (size.width - padding - 24) / (columns.length - 1);
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
                    width="12"
                    height={`${height}`}
                    rx="2"
                    ry="2"
                    fill="#608CFF"
                    onMouseEnter={() => {
                        setHoverItem({ x, y, item: data[index] });
                    }}
                    onMouseLeave={() => setHoverItem(undefined)}
                />
            );
        }

        return children;
    }, [size, minMaxInfo, yAxis, xAxis, data]);

    const hover = useMemo(() => {

        const children: any[] = [];

        if (hoverItem) {
            const x = hoverItem.x + 6 - 0.5;
            const y = hoverItem.y;
            children.push(
                <line x1={x} y1={`${0}`} x2={x} y2={`${y}`} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            );
        }

        return children;

    }, [hoverItem]);

    const hoverX = useMemo(() => {
        if (!hoverItem) return 0;
        
        const hoverWidth = 227;
        if (hoverItem.x > size.width/2) {
            const x = hoverItem.x - 227;
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

    console.log("hover x", hoverX);
    


    return (
        <div ref={chartContainerRef} className={cn("orderly-w-full orderly-h-full orderly-relative", className)} >
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

            {hoverItem && <div
                className="orderly-absolute orderly-bg-base-500 orderly-rounded-lg orderly-p-3 orderly-w-[227px] orderly-top-0"
                style={{
                    // marginTop: 0,
                    // marginLeft: 0,
                    marginLeft: hoverX,
                    pointerEvents: 'none'
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