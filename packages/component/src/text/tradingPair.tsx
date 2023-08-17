import { type FC, HTMLAttributes, useMemo } from "react";

export interface TradingPairProps extends HTMLAttributes<HTMLSpanElement> {
  // symbol:string;
  className?: string;
  children: string;
}

export const TradingPair: FC<TradingPairProps> = (props) => {
  if (typeof props.children !== "string") {
    throw new Error("TradingPair must have a string child");
  }

  const children = useMemo(() => {
    return props.children;
  }, [props.children]);

  return <span {...props}>{children}</span>;
};
