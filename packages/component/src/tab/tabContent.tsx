import React, { FC, PropsWithChildren, useContext } from "react";
import { TabContext } from "./tabContext";
import { cx } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

export interface TabContentProps {
  keepAlive?: boolean;
}

export const TabContent: FC<PropsWithChildren<TabContentProps>> = (props) => {
  const { keepAlive } = props;
  const { contentVisible } = useContext(TabContext);

  return (
    <div
      className={twMerge(
        cx(
          "orderly-transition-all orderly-grid",
          contentVisible ? "orderly-grid-rows-[1fr]" : "orderly-grid-rows-[0fr]"
        )
      )}
      // onTransitionEnd={() => {
      //
      // }}
    >
      <div className="orderly-overflow-hidden orderly-relative">{props.children}</div>
    </div>
  );
};
