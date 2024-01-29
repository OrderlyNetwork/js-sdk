import { CSSProperties, ReactNode, useContext } from "react";
import { ColProps } from "./col";
import { withFixedStyle } from "./colHOC";
import { Tooltip } from "@/tooltip/tooltip";
import { cn } from "..";
import { HoverCard } from "@/hoverCard";
import { TableContext } from "./tableContext";
import { ArrowIcon } from "@/icon/icons/arrow";

const TheadColItem = (
  props: ColProps & {
    style?: CSSProperties;
    className?: string;
    bordered?: boolean;
  }
) => {
  const { col: column, index } = props;
  const { sortKey, sortOrder, onSort } = useContext(TableContext);
  let content: ReactNode = column.title;

  if (!!column.hint || !!column.onSort) {
    content = (
      <button
        className={cn(
          "hover:orderly-text-base-contrast orderly-flex orderly-gap-1 orderly-items-center",
          sortKey === column.dataIndex && "orderly-text-base-contrast"
        )}
        onClick={(e) => {
          e.stopPropagation();
          if (!column.onSort) {
            return;
          }
          onSort(column.dataIndex);
        }}
      >
        <span>{column.title}</span>

        {/* sort indicator */}
        <ArrowIcon
          className={cn(
            "orderly-transition-all orderly-duration-200 orderly-hidden",
            sortKey === column.dataIndex && "orderly-block",
            sortOrder === "asc" && "orderly-rotate-180",
            sortOrder === "desc" && "orderly-rotate-0"
          )}
          size={10}
        />
      </button>
    );
  }

  if (!!column.hint) {
    if (typeof column.hint === "string") {
      content = (
        <Tooltip
          content={column.hint}
          className={cn(
            "orderly-max-w-[270px] orderly-text-4xs",
            column.hintClassName && column.hintClassName
          )}
        >
          {content}
        </Tooltip>
      );
    } else {
      content = (
        <HoverCard
          // @ts-ignore
          content={column.hint}
          side="top"
          align="center"
          className={cn(
            "orderly-max-w-[270px] orderly-text-4xs",
            column.hintClassName && column.hintClassName
          )}
        >
          {content}
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
