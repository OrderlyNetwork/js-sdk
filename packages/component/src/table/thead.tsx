import { FC, ReactNode, useEffect, useRef } from "react";
import { Column } from "./col";
import { cn } from "@/utils/css";
import { ColGroup } from "./colgroup";
import { Tooltip } from "@/tooltip";
import { TheadCol } from "./theadCol";

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
        "orderly-border-collapse orderly-w-full orderly-table-fixed orderly-sticky orderly-top-0",
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
            return (
              <TheadCol
                col={column}
                record={undefined}
                key={index}
                index={index}
                className={props.className}
                bordered={props.bordered}
              />
            );
          })}
        </tr>
      </thead>
    </table>
  );
};
