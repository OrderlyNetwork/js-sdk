import { cn } from "@/utils/css";
import { FC, PropsWithChildren } from "react";

export interface StepItemProps {
  active?: boolean;
}

export const StepItem: FC<PropsWithChildren<StepItemProps>> = (props) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center w-[32px] h-[32px] bg-base-300 rounded-full",
        props.active && "bg-primary"
      )}
    >
      {props.children}
    </div>
  );
};
