import { FC } from "react";
import { Column } from "./col";

export interface THeadProps {
  columns: Column[];
  className?: string;
}

export const THead: FC<THeadProps> = (props) => {
  return (
    <tr>
      {props.columns.map((column, index) => {
        return (
          <td className="border-b" key={index}>
            {column.title}
          </td>
        );
      })}
    </tr>
  );
};
