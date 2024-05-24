import { FC, useEffect, useMemo, useState } from "react";
import { line, curveBasis } from "d3-shape";
import { scaleLinear, scaleUtc } from "d3-scale";
import { max, extent } from "d3-array";
import { useChartContext } from "../hooks/chartContext";

export type LineProps = {
  color?: string;
  symbol?: string;
};

export const Line: FC<LineProps> = (props) => {
  const { color, symbol } = props;
  const { data, scale, size, margin, registerScale } = useChartContext();
  // const [path, setPath] = useState<string | undefined>();

  useEffect(() => {
    if (!size || !data) return;

    const x = scaleUtc(
      extent(data, (d) => new Date(d.date)),
      [0, size.width - margin.right - margin.left]
    );

    const y = scaleLinear(
      [0, max(data, (d) => d.close)],
      [size.height - margin.bottom - margin.top, margin.top]
    ).nice();

    registerScale({ x, y });
  }, [data, size]);

  const lineGenerator = useMemo(() => {
    if (!scale) return () => undefined;
    return line()
      .x((d) => scale.x(new Date(d.date)))
      .y((d) => scale.y(d.close))
      .curve(curveBasis);
  }, [scale]);

  const d = useMemo(() => {
    if (typeof lineGenerator !== "function") return undefined;
    return lineGenerator(data);
  }, [data, lineGenerator]);

  if (!d) return null;

  return (
    <g transform={`translate(${margin.left}, ${margin.top})`}>
      <path d={d} fill="none" stroke={"white"} />
    </g>
  );
};
