import { CSSProperties, ReactNode, useContext } from "react";
import { ColProps } from "./col";
import { withFixedStyle } from "./colHOC";

import { TableContext } from "./tableContext";
import { cnBase } from "tailwind-variants";
import { AscendingIcon, DescendingIcon, SortingIcon } from "./icons";
import { Tooltip } from "../../tooltip";
import { cn, HoverCard } from "../..";

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
        className={cnBase(
          "hover:oui-text-base-contrast oui-inline-flex oui-gap-1 oui-items-center oui-text-base-contrast-36"
          // sortKey === column.dataIndex && "oui-text-base-contrast"
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

        {sortKey === column.dataIndex ? (
          sortOrder === "asc" ? (
            <AscendingIcon />
          ) : (
            <DescendingIcon />
          )
        ) : (
          <SortingIcon />
        )}
      </button>
    );
  }

  if (!!column.hint) {
    if (typeof column.hint === "string") {
      content = (
        <Tooltip
          content={column.hint}
          className={cn(
            "oui-max-w-[280px] oui-text-2xs oui-text-base-contrast-54 oui-p-3 oui-bg-base-8",
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
            "oui-max-w-[280px] oui-text-2xs",
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
      className={cnBase(
        "oui-px-3 oui-py-[3px] oui-h-10 oui-text-base-contrast-36",
        column.align === "right" && "oui-text-right",
        column.align === "center" && "oui-text-center",
        props.justified && "first:oui-pl-0 last:oui-pr-0",
        props.bordered && "oui-border-b oui-border-line",
        column.fixed && "oui-sticky",
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
