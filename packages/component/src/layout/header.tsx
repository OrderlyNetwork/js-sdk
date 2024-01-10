import { FC, PropsWithChildren, useContext, useEffect, useRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { LayoutContext } from "./layoutContext";
import { LayoutBaseProps } from "./types";
import { useTradingPageContext } from "@/page/trading/context/tradingPageContext";
import { TradingFeatures } from "..";

export interface HeaderProps extends LayoutBaseProps {}

export const Header: FC<PropsWithChildren<HeaderProps>> = (props) => {
  const ref = useRef<HTMLDivElement>(null);
  const { asChild, ...rest } = props;
  const { setHeaderHeight, isTopLevel } = useContext(LayoutContext);
  const { disableFeatures } = useTradingPageContext();

  if (!isTopLevel) {
    throw new Error("Header component must be in top layout component.");
  }

  useEffect(() => {
    setTimeout(() => {
      const boundingClientRect = ref.current?.getBoundingClientRect();

      if (boundingClientRect && boundingClientRect.height) {
        // console.log(boundingClientRect);
        setHeaderHeight(boundingClientRect.height);
      }
    }, 50);
  }, []);

  /**
   * if disableFeatures includes TradingFeatures.Header, then return null
   */
  if (disableFeatures.includes(TradingFeatures.Header)) {
    return null;
  }

  const Comp = asChild ? Slot : "div";
  return <Comp {...rest} ref={ref} />;
};

Header.displayName = "Header";
