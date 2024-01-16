import { FC, useMemo } from "react";
import { Col, Column } from "./col";
import { cn } from "@/utils/css";

interface RowProps {
  columns: Column[];
  record: any;
  bordered?: boolean;
  justified?: boolean;
}

export const Row: FC<RowProps> = (props) => {
  const { columns, record, bordered } = props;

  const cols = useMemo(() => {
    return columns.map((column, index) => {
      return (
        <Col
          key={column.dataIndex}
          col={column}
          index={index}
          record={record}
          justified={props.justified}
        />
      );
    });
  }, [columns, record]);

  return (
    <tr
      className={cn(
        props.bordered &&
          "orderly-border-b orderly-border-divider last:orderly-border-b-0"
      )}
    >
      {cols}
    </tr>
  );
};
