import { FC, PropsWithChildren } from "react";
import { cn } from "@/utils/css";

export const InputMask: FC<PropsWithChildren<{ className?: string }>> = (
  props
) => {
  return (
    <div
      className={cn(
        "h-full flex flex-col justify-center px-3 text-base-contrast/60",
        props.className
      )}
    >
      {props.children}
    </div>
  );
};
