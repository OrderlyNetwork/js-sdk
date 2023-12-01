import clsx from "clsx";
import { PropsWithChildren } from "react";

export const Card = (
  props: PropsWithChildren<{ className?: string; maxHeight?: number }>
) => {
  return (
    <div className={clsx("p-5 rounded-lg bg-base-800", props.className)}>
      {props.children}
    </div>
  );
};
