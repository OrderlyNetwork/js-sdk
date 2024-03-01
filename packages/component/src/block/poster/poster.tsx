import { drawOptions, usePoster } from "@orderly.network/hooks";
import { FC, forwardRef, useImperativeHandle } from "react";

export type PosterProps = {
  width: number;
  height: number;
  className?: string;
  data: drawOptions;
};

export type PosterRef = {
  download: (filename: string, type?: string, encoderOptions?: number) => void;
  toDataURL: (type?: string, encoderOptions?: number) => string;
  toBlob: (type?: string, encoderOptions?: number) => Promise<Blob | null>;
  copy: () => Promise<void>;
};

export const Poster = forwardRef<PosterRef, PosterProps>((props, parentRef) => {
  const { width, height, className, data } = props;

  const { ref, download, toDataURL, copy, toBlob } = usePoster(data);

  useImperativeHandle(parentRef, () => ({
    download,
    toDataURL,
    toBlob,
    copy,
  }));

  return (
    <canvas ref={ref} width={width} height={height} className={className} />
  );
});
