import { Size } from "./types";
import { FC, useMemo } from "react";

export interface SvgImageProps {
  svg?: string;
  size?: Size | number;
  backgroundColor?: string;
  rounded?: boolean;
}

export const SvgImage: FC<SvgImageProps> = (props) => {
  const size = useMemo(() => {
    if (typeof props.size === "undefined") return "20px";
    if (props.size === "small") return "16px";
    if (props.size === "medium") return "24px";
    if (props.size === "large") return "32px";

    return `${props.size}px`;
  }, [props.size]);
  return (
    <div
      className={"inline-block overflow-hidden p-[3px]"}
      style={{
        width: size,
        height: size,
        backgroundColor: props.backgroundColor ?? "#FFF",
        borderRadius: props.rounded ? "50%" : "0",
      }}
      dangerouslySetInnerHTML={{ __html: props.svg ?? "" }}
    />
  );
};
