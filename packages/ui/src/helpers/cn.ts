import { cx } from "cva";
import { extendTailwindMerge } from "tailwind-merge";

export const twMerge = extendTailwindMerge({ prefix: "oui-" });

export const cn = (...args: any[]) => {
  return twMerge(cx(...args));
};
