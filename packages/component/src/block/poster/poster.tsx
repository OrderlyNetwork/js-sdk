import { drawOptions, usePoster } from "@orderly.network/hooks";
import { FC, useRef } from "react";

export type PosterProps = {
  width: number;
  height: number;
  className?: string;
  data: drawOptions;
};

export const Poster: FC<PosterProps> = (props) => {
  const { width, height, className, data } = props;
  // const canvasRef = useRef<HTMLCanvasElement>(null);
  const { ref } = usePoster(data);

  return (
    <canvas ref={ref} width={width} height={height} className={className} />
  );
};
