import { useState } from "react";

export const useTableSize = (options: {
  minHeight?: number;
  scroll?: { x?: number; y?: number };
}) => {
  const { scroll } = options;
  let width: string, height: string;
  const [minHeight, setMinHeight] = useState(options.minHeight || 240);

  if (typeof scroll?.x === "number") {
    width = `${scroll.x}px`;
  } else {
    width = "100%";
  }

  if (typeof scroll?.y === "number") {
    height = `${scroll.y}px`;
  } else {
    height = "calc(100% - 2px)";
  }

  return {
    width,
    height,
  };
};
