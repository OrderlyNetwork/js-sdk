import { FC, HTMLAttributes, PropsWithChildren } from "react";
import { cn } from "..";

export interface ContentProps extends HTMLAttributes<HTMLDivElement> {
  // fixed?: boolean;
  // asChild?: boolean;
}

export const Content: FC<PropsWithChildren<ContentProps>> = (props) => {
  const { className, ...rest } = props;
  return <div {...rest} className={cn("orderly-flex-1", className)} />;
};
