import { FC } from "react";
import { Column } from "./col";
import { cn } from "@/utils/css";

export interface THeadProps {
  columns: Column[];
  className?: string;
  bordered?: boolean;
  justified?: boolean;
}

export const THead: FC<THeadProps> = (props) => {
  return (
    <thead
      className={cn(
        "orderly-sticky orderly-top-0 orderly-z-10",
        props.className
      )}
    >
      <tr>
        {props.columns.map((column, index) => {
          return (
            <td
              className={cn(
                "orderly-px-1 orderly-py-[3px] ",
                column.align === "right" && "orderly-text-right",
                props.justified && "first:orderly-pl-0 last:orderly-pr-0",
                props.bordered && "orderly-border-b orderly-border-divider",
                props.className
              )}
              key={column.dataIndex}
            >
              {column.title}
            </td>
          );
        })}
      </tr>
    </thead>
  );
};
