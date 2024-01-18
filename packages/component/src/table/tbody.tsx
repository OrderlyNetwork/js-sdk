import { FC, ReactNode, useContext } from "react";
import { TableContext } from "./tableContext";
import { Row } from "./row";

export interface TBodyProps<RecordType> {
  bordered?: boolean;

  justified?: boolean;

  renderRowContainer?: (
    record: RecordType,
    index: number,
    children: ReactNode
  ) => ReactNode;

  generatedRowKey?: (record: RecordType, index: number) => string;

  onRow?: (record: RecordType, index: number) => any;
}

export const TBody = <RecordType,>(props: TBodyProps<RecordType>) => {
  const { dataSource, columns } = useContext(TableContext);

  return (
    <tbody>
      {dataSource?.map((record: any, index) => {
        const key =
          typeof props.generatedRowKey === "function"
            ? props.generatedRowKey(record, index)
            : index; /// `record.ts_${record.price}_${record.size}_${index}`;

        const row = (
          <Row
            key={key}
            index={index}
            columns={columns}
            record={record}
            justified={props.justified}
            bordered={props.bordered}
            onRow={props.onRow}
          />
        );

        if (typeof props.renderRowContainer === "function") {
          return props.renderRowContainer(record, index, row);
        }

        return row;
      })}
    </tbody>
  );
};
