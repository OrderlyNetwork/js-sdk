import React, { HTMLAttributes } from "react";
import { cn } from "@orderly.network/ui";
import { SplitProps } from "@uiw/react-split";

export type SplitLineBarProps = Pick<SplitProps, "mode"> &
  HTMLAttributes<HTMLDivElement>;

export const SplitLineBar: React.FC<SplitLineBarProps> = (props) => {
  const { onMouseDown, mode = "horizontal", ...rest } = props;
  return (
    <div
      {...rest}
      className={cn(
        props.className,
        "!oui-transition-none",
        "!oui-shadow-none !oui-bg-transparent",
        "hover:!oui-bg-primary-light hover:!oui-shadow-[0px_0px_4px_0px] hover:!oui-shadow-primary-light/80",
        "active:!oui-bg-primary-light active:!oui-shadow-[0px_0px_4px_0px] active:!oui-shadow-primary-light/80",
        "focus:!oui-bg-primary-light focus:!oui-shadow-[0px_0px_4px_0px] focus:!oui-shadow-primary-light/80",
        mode === "horizontal"
          ? "!oui-w-[2px] !oui-min-w-[2px]  !oui-mx-1"
          : "!oui-h-[2px] !oui-min-h-[2px]  !oui-my-1"
      )}
    >
      <div
        onMouseDown={onMouseDown}
        className={cn(
          "!oui-transition-none",
          mode === "horizontal" ? "after:!oui-w-[2px]" : "after:!oui-h-[2px]",
          "after:!oui-bg-transparent after:!oui-shadow-transparent"
        )}
      />
    </div>
  );
};
