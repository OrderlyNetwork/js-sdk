import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...args: any[]) => {
  return twMerge(clsx(...args));
};
