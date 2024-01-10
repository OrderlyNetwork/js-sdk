import {
  FC,
  HTMLAttributes,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
} from "react";
import { Slot } from "@radix-ui/react-slot";
import { LayoutBaseProps } from "./types";

interface Props extends LayoutBaseProps {
  onMeasure?: (height: number, width: number) => void;
}

export const BaseLayout: FC<PropsWithChildren<Props>> = (props) => {
  const ref = useRef<HTMLDivElement>(null);
  const { asChild, ...rest } = props;

  useEffect(() => {
    const boundingClientRect = ref.current?.getBoundingClientRect();

    if (boundingClientRect && boundingClientRect.height) {
      // console.log(boundingClientRect);
      props.onMeasure?.(boundingClientRect.height, boundingClientRect.width);
    }
  }, []);
  const Comp = asChild ? Slot : "div";
  return <Comp {...rest} ref={ref} />;
};
