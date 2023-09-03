import { FC, useMemo } from "react";
import { Col, Column } from "./col";

interface RowProps {
  columns: Column[];
  record: any;
}

export const Row: FC<RowProps> = (props) => {
  const { columns, record } = props;

  const cols = useMemo(() => {
    return columns.map((column, index) => {
      return (
        <Col
          key={column.dataIndex}
          col={column}
          index={index}
          record={record}
        />
      );
    });
  }, [columns, record]);

  return <tr>{cols}</tr>;
};
