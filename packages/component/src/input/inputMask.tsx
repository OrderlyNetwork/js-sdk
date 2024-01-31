import { FC, PropsWithChildren } from "react";
import { cn } from "@/utils/css";

export const InputMask: FC<
  PropsWithChildren<{ className?: string; name?: string }>
> = (props) => {
  return (
    <label
      htmlFor={props.name}
      className={cn(
        "orderly-h-full orderly-flex orderly-flex-col orderly-justify-center orderly-px-3 orderly-text-base-contrast/60",
        props.className
      )}
    >
      {props.children}
    </label>
  );
};
