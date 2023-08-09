import { cx } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

export const cn = (...args: any[]) => {
  return twMerge(cx(...args));
};
