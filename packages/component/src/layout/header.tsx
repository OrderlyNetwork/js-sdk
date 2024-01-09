import {
  FC,
  HTMLAttributes,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
} from "react";
import { Slot } from "@radix-ui/react-slot";
import { LayoutContext } from "./layoutContext";

export interface HeaderProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

export const Header: FC<PropsWithChildren<HeaderProps>> = (props) => {
  const ref = useRef<HTMLDivElement>(null);
  const { asChild, ...rest } = props;
  const { setHeaderHeight } = useContext(LayoutContext);

  useEffect(() => {
    const boundingClientRect = ref.current?.getBoundingClientRect();

    if (boundingClientRect && boundingClientRect.height) {
      // console.log(boundingClientRect);
      setHeaderHeight(boundingClientRect.height);
    }
  }, []);
  const Comp = asChild ? Slot : "div";
  return <Comp {...rest} ref={ref} />;
};
