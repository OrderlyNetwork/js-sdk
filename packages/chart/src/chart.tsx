import { PropsWithChildren, useLayoutEffect, useRef, useState } from "react";
import { ChartRenderer } from "./chartRenderer";
import { ChartProps, Size } from "./constants/types";
import { DeafultMargin } from "./constants/config";
import { ChartContext } from "./hooks/chartContext";
import { ChartScale, useChartState } from "./hooks/useChartState";

const Chart = <T,>(props: PropsWithChildren<ChartProps<T>>) => {
  const { margin = DeafultMargin, ...rest } = props;
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<Size | undefined>(
    props.width && props.height
      ? { width: props.width, height: props.height }
      : undefined
  );

  const [scale, setScale] = useState<ChartScale | undefined>();

  // set width and height
  useLayoutEffect(() => {
    if (!wrapperRef.current || !!size) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // console.log(entry);
        if (entry.contentRect) {
          setSize({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
        }
      }
    });

    resizeObserver.observe(wrapperRef.current);

    return () => {
      if (!wrapperRef.current || !resizeObserver) return;
      resizeObserver.unobserve(wrapperRef.current);
    };
  }, []);

  return (
    <div ref={wrapperRef}>
      <ChartContext.Provider
        value={{
          margin,
          size,
          data: props.data,
          scale,
          registerScale: setScale,
        }}
      >
        <ChartRenderer {...rest} />
      </ChartContext.Provider>
    </div>
  );
};

Chart.displayName = "Chart";

export { Chart };
