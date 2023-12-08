import { FC, memo, PropsWithChildren, useLayoutEffect, useState } from "react";
import { ScrollArea } from "@/scrollArea";

interface Props {
  target?: HTMLDivElement;
}

const ScrollPane: FC<PropsWithChildren<Props>> = (props) => {
  const [height, setHeight] = useState("auto");
  // target
  useLayoutEffect(() => {
    let target = props.target;

    if (!target) {
    }

    if (target) {
      const bound = target.getBoundingClientRect();
      console.log(bound);
    }
  }, []);
  return <ScrollArea>{props.children}</ScrollArea>;
};

export const MemorizedScrollPane = memo(ScrollPane);
