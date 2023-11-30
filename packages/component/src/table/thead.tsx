import { FC } from "react";
import { Column } from "./col";
import { cn } from "@/utils/css";

export interface THeadProps {
  columns: Column[];
  className?: string;
  bordered?: boolean;
}

export const THead: FC<THeadProps> = (props) => {
  return (
    <thead className={cn("sticky top-0", props.className)}>
      <tr>
        {props.columns.map((column, index) => {
          return (
            <td
              className={cn(
                "orderly-px-3 orderly-py-[3px]",
                column.align === "right" && "orderly-text-right",
                props.bordered && "orderly-border-b orderly-border-base-contrast/20",
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
