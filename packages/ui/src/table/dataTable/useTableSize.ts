export const useTableSize = (scroll?: { x?: number; y?: number }) => {
  let width: string, height: string;

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
