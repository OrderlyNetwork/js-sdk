import { FC, PropsWithChildren, useContext, useEffect, useRef } from "react";
import { LayoutContext } from "./layoutContext";
import { Slot } from "@radix-ui/react-slot";
import { LayoutBaseProps } from "./types";

export interface SiderProps extends LayoutBaseProps {
  asChild?: boolean;
}

export const Sider: FC<PropsWithChildren<SiderProps>> = (props) => {
  const ref = useRef<HTMLDivElement>(null);
  const { asChild, ...rest } = props;
  const { setSiderWidth } = useContext(LayoutContext);

  useEffect(() => {
    const boundingClientRect = ref.current?.getBoundingClientRect();

    if (boundingClientRect && boundingClientRect.height) {
      // console.log(boundingClientRect);
      setSiderWidth(boundingClientRect.width);
    }
  }, []);
  const Comp = asChild ? Slot : "div";
  return <Comp {...rest} ref={ref} />;
};

Sider.displayName = "Sider";
