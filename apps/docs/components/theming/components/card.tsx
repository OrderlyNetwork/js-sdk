import { cn } from "@/helper/css";
import clsx from "clsx";
import { CSSProperties, PropsWithChildren } from "react";

export const Card = (
  props: PropsWithChildren<{
    className?: string;
    maxHeight?: number;
    style?: CSSProperties;
  }>
) => {
  return (
    <div
      className={cn(
        "px-5 rounded-lg bg-base-800 overflow-hidden",
        props.className
      )}
      style={{ maxHeight: props.maxHeight ?? "auto", ...props.style }}
    >
      {props.children}
    </div>
  );
};
