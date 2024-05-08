import { cn } from "@orderly.network/react";
import { FC } from "react";
import "./loader.css";

export const Loader: FC<{
    className?: string,
  }> = (props) => {
    return (
        <div className={cn("loader", props.className)}/>
    );
  }