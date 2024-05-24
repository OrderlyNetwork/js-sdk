import { FC, useEffect, useRef } from "react";
import { useChartContext } from "../hooks/chartContext";
import { axisBottom, axisLeft } from "d3-axis";
import { select } from "d3-selection";
// import
export type AxisProps = {
  // direction?: "x" | "y";
  orientation?: "top" | "bottom" | "left" | "right";
};

export const Axis: FC<AxisProps> = (props) => {
  const { orientation = "bottom" } = props;
  const { scale, size, margin } = useChartContext();

  const gRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    if (!scale || !gRef.current) return;
    let translate, axis;

    switch (orientation) {
      case "left":
        translate = `translate(${margin.left}, ${margin.top})`;
        axis = axisLeft(scale.y)
          .ticks(8)
          .tickSizeInner(-(size.width - margin.left - margin.right))
          .tickSizeOuter(5)
          .tickPadding(10);
        break;

      default:
        translate = `translate(${margin.left}, ${size.height - margin.bottom})`;
        axis = axisBottom(scale.x);
    }

    select(gRef.current).attr("transform", translate).call(axis);
  }, [scale, orientation]);

  return <g ref={gRef}></g>;
};
