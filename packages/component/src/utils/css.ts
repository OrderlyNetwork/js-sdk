import { cx } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

export const mergeClassNames = (...args: any[]) => {
  return twMerge(cx(...args));
};
