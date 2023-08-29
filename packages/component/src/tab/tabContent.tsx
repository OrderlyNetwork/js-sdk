import React, { FC, PropsWithChildren, useContext } from "react";
import { TabContext } from "./tabContext";
import { cx } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

export const TabContent: FC<PropsWithChildren> = (props) => {
  const { contentVisible } = useContext(TabContext);

  return (
    <div
      className={twMerge(
        cx(
          "transition-all grid",
          contentVisible ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )
      )}
      onTransitionEnd={() => {
        console.log("onTransitionEnd");
      }}
    >
      <div className="overflow-hidden">{props.children}</div>
    </div>
  );
};
