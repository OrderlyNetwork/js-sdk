import { cn } from "@orderly.network/react";
import { FC } from "react";

export const Loader: FC<{
    className?: string,
  }> = (props) => {
    return (
        <div className={cn("orderly-rounded-full orderly-border-2 orderly-border-white orderly-animate-loader-circle", props.className)}/>
    );
  }