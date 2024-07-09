import { SVGProps } from "react";

export type DateRange = {
  from: Date | undefined;
  to?: Date | undefined;
};

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}
