import { FC } from "react";
import { Column } from "./col";
import { cn } from "@/utils/css";

export interface THeadProps {
  columns: Column[];
  className?: string;
}

export const THead: FC<THeadProps> = (props) => {
  return (
    <thead className={cn("sticky top-0", props.className)}>
      <tr>
        {props.columns.map((column, index) => {
          return (
            <td
              className={cn(
                "px-3 py-[3px]",
                column.align === "right" && "text-right",
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
