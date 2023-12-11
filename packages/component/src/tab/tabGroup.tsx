import { FC, Fragment, ReactNode } from "react";
import { TabItem } from "@/tab/tabList";
import { cn } from "@/utils/css";

interface Props {
  tabList: TabItem[];
  // children: ReactNode[];
  className?: string;
}

export const TabGroup: FC<Props> = (props) => {
  return (
    <div
      className={cn(
        "orderly-grid orderly-border-b orderly-border-divider",
        props.className
      )}
      style={{ gridTemplateColumns: `repeat(${props.tabList.length}, 1fr)` }}
    >
      {props.tabList.map((header, index) => {
        // const header = props.tabList[index];
        return (
          <div
            key={index}
            className={cn(
              "orderly-h-full orderly-relative orderly-flex orderly-items-center orderly-border-l orderly-border-divider first:orderly-border-l-0 orderly-pl-2"
            )}
          >
            {header.title}
          </div>
        );
      })}
    </div>
  );
};
