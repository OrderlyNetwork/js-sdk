import { CSSProperties, ReactNode } from "react";
import { ColProps } from "./col";
import { withFixedStyle } from "./colHOC";
import { Tooltip } from "@/tooltip/tooltip";
import { cn } from "..";
import { HoverCard } from "@/hoverCard";

const TheadColItem = (
  props: ColProps & {
    style?: CSSProperties;
    className?: string;
    bordered?: boolean;
  }
) => {
  const { col: column, index } = props;
  let content: ReactNode = column.title;

  if (!!column.hint) {
    if (typeof column.hint === "string") {
      content = (
        <Tooltip
          content={column.hint}
          className="orderly-max-w-[270px] orderly-text-4xs"
        >
          <button className="hover:orderly-text-base-contrast">
            {column.title}
          </button>
        </Tooltip>
      );
    } else {
      content = (
        <HoverCard
          content={column.hint}
          side="top"
          align="center"
          className="orderly-max-w-[270px] orderly-text-4xs"
        >
          <button className="hover:orderly-text-base-contrast">
            {column.title}
          </button>
        </HoverCard>
      );
    }
  }

  return (
    <td
      className={cn(
        "orderly-px-1 orderly-py-[3px] ",
        column.align === "right" && "orderly-text-right",
        props.justified && "first:orderly-pl-0 last:orderly-pr-0",
        props.bordered && "orderly-border-b orderly-border-divider",
        column.fixed && "orderly-sticky orderly-bg-base-900",
        props.className
      )}
      key={column.dataIndex}
      style={props.style}
    >
      {content}
    </td>
  );
};

export const TheadCol =
  withFixedStyle<{ className?: string; bordered?: boolean }>(TheadColItem);
