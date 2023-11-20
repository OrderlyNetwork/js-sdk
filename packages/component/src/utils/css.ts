import { cx } from "class-variance-authority";
import { extendTailwindMerge } from "tailwind-merge";

export const twMerge = extendTailwindMerge({ prefix: "orderly-" });

export const cn = (...args: any[]) => {
  return twMerge(cx(...args));
};
