import { Size } from "./types";

export const getSize = (size?: Size | string | number): string => {
  if (typeof size === "undefined") return "24px";
  if (size === "full") return "100%";
  if (size === "small") return "16px";
  if (size === "medium") return "24px";
  if (size === "large") return "32px";

  return `${size}px`;
};
