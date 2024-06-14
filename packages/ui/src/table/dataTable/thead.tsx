import { FC } from "react";
import { cnBase } from "tailwind-variants";
import { Column } from "./col";
import { ColGroup } from "./colgroup";
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
      className={cnBase(
        "oui-border-collapse oui-w-full oui-table-fixed oui-sticky oui-top-0 oui-z-20 oui-DataTableHeader",
        props.containerClassName
      )}
    >
      <ColGroup columns={props.columns} />

      <thead
        className={cnBase("oui-sticky oui-top-0 oui-z-0", props.className)}
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
