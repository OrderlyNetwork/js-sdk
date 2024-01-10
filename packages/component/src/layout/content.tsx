import { FC, PropsWithChildren } from "react";
import { cn } from "..";
import { LayoutBaseProps } from "./types";

export interface ContentProps extends LayoutBaseProps {
  // fixed?: boolean;
  // asChild?: boolean;
}

export const Content: FC<PropsWithChildren<ContentProps>> = (props) => {
  const { className, ...rest } = props;
  return <div {...rest} className={cn("orderly-flex-1", className)} />;
};

Content.displayName = "Content";
