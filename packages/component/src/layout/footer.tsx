import { FC, PropsWithChildren, useContext, useEffect, useRef } from "react";
import { LayoutContext } from "./layoutContext";
import { LayoutBaseProps } from "./types";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "..";

export interface FooterProps extends LayoutBaseProps {
  fixed?: boolean;
}

export const Footer: FC<PropsWithChildren<FooterProps>> = (props) => {
  const ref = useRef<HTMLDivElement>(null);
  const { asChild, className, ...rest } = props;
  const { setFooterHeight, isTopLevel } = useContext(LayoutContext);

  if (!isTopLevel) {
    throw new Error("Footer component must be in top layout component.");
  }

  useEffect(() => {
    const boundingClientRect = ref.current?.getBoundingClientRect();

    if (boundingClientRect && boundingClientRect.height) {
      // console.log(boundingClientRect);
      setFooterHeight(boundingClientRect.height);
    }
  }, []);
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      {...rest}
      className={cn(
        "orderly-fixed orderly-bottom-0 orderly-left-0 orderly-right-0",
        className
      )}
      ref={ref}
    />
  );
};

Footer.displayName = "Footer";
