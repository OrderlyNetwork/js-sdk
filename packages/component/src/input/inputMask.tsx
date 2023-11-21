import { FC, PropsWithChildren } from "react";
import { cn } from "@/utils/css";

export const InputMask: FC<PropsWithChildren<{ className?: string }>> = (
  props
) => {
  return (
    <div
      className={cn(
        "orderly-h-full orderly-flex orderly-flex-col orderly-justify-center orderly-px-3 orderly-text-base-contrast/60",
        props.className
      )}
    >
      {props.children}
    </div>
  );
};
