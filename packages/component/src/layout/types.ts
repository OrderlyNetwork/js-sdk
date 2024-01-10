import { HTMLAttributes, ReactNode } from "react";

// export type BreakPoint = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
export type BreakPoint = "mobile" | "tablet";

export interface LayoutBaseProps extends HTMLAttributes<HTMLDivElement> {
  //   breakpoint?: BreakPoint;
  tablet?: ReactNode;
  mobile?: ReactNode;

  asChild?: boolean;
}
