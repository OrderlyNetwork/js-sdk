import { FC, Fragment, ReactNode } from "react";
import { TabItem } from "@/tab/tabList";
import { cn } from "@/utils/css";

interface Props {
  tabList: TabItem[];
  children: ReactNode[];
  tabBarClassName?: string;
}

export const TabGroup: FC<Props> = (props) => {
  return (
    <div
      className={"orderly-grid"}
      style={{ gridTemplateColumns: `repeat(${props.children.length}, 1fr)` }}
    >
      {props.children.map((child, index) => {
        const header = props.tabList[index];
        return (
          <div
            key={index}
            className="orderly-relative orderly-flex orderly-flex-col"
          >
            <div
              className={cn(
                "orderly-border-b orderly-border-divider orderly-flex orderly-items-center",
                props.tabBarClassName
              )}
            >
              {header.title}
            </div>
            <div className="orderly-flex-1">{child}</div>
          </div>
        );
      })}
    </div>
  );
};
