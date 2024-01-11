import { FC, ReactNode } from "react";
import { Column } from "./col";
import { cn } from "@/utils/css";
import { ColGroup } from "./colgroup";
import { Tooltip } from "@/tooltip";

export interface THeadProps {
  columns: Column[];
  className?: string;
  containerClassName?: string;
  bordered?: boolean;
  justified?: boolean;
}

export const TableHeader: FC<THeadProps> = (props) => {
  return (
    <table
      className={cn(
        "orderly-border-collapse orderly-min-w-full",
        props.containerClassName
      )}
    >
      <ColGroup columns={props.columns} />
      <thead
        className={cn(
          "orderly-sticky orderly-top-0 orderly-z-10",
          props.className
        )}
      >
        <tr>
          {props.columns.map((column, index) => {
            let content: ReactNode = column.title;

            if (typeof column.hint === "string") {
              content = (
                <Tooltip
                  content={column.hint}
                  className="orderly-max-w-[270px] orderly-text-4xs"
                >
                  <button className="hover:orderly-text-base-contrast">{column.title}</button>
                </Tooltip>
              );
            }

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
                {content}
              </td>
            );
          })}
        </tr>
      </thead>
    </table>
  );
};
