import { useEffect, useRef, useState } from "react";

const DEFAULT_MIN_HEIGHT = 130;

export const useTableSize = (
  tableRef: React.RefObject<HTMLTableElement>,
  options: {
    initialMinHeight?: number;
    minHeight?: number;
    scroll?: { x?: number; y?: number };
  }
): {
  width?: string;
  height?: string;
  minHeight: string;
} => {
  const { scroll } = options;
  let width!: string, height!: string;
  // const minHeight = useRef(options.initialMinHeight || DEFAULT_MIN_HEIGHT);
  const [minHeight, setMinHeight] = useState(
    options.initialMinHeight || DEFAULT_MIN_HEIGHT
  );
  // const [minHeight, setMinHeight] = useState(options.minHeight || 240);
  //
  useEffect(() => {
    if (!tableRef.current || typeof options.minHeight !== "undefined") return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { height } = entry.contentRect;
        // minHeight.current = Math.max(height, minHeight.current);
        setMinHeight((minHeight) => Math.max(height, minHeight));
      }
    });

    resizeObserver.observe(tableRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [tableRef.current]);

  if (typeof scroll?.x === "number") {
    width = `${scroll.x}px`;
  }
  // else {
  //   width = "100%";
  // }

  if (typeof scroll?.y === "number") {
    height = `${scroll.y}px`;
  }
  // else {
  //   height = "100%";
  // }

  return {
    width: width,
    height: height,
    minHeight: `${options.minHeight || minHeight}px`,
  };
};
