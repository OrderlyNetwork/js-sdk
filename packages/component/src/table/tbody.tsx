import { FC, Fragment, ReactNode, useContext } from "react";
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

  expandRowRender?: (record: RecordType, index: number) => ReactNode;
}

export const TBody = <RecordType,>(props: TBodyProps<RecordType>) => {
  const { dataSource, columns, expandedRowKeys, canExpand, toggleExpandRow } =
    useContext(TableContext);

  return (
    <tbody className="orderly-ui-table-body">
      {dataSource?.map((record: any, index) => {
        const key =
          typeof props.generatedRowKey === "function"
            ? props.generatedRowKey(record, index)
            : `${index}`; /// `record.ts_${record.price}_${record.size}_${index}`;

        const row = (
          <Row<RecordType>
            key={key}
            rowKey={key}
            index={index}
            columns={columns}
            record={record}
            canExpand={canExpand}
            justified={props.justified}
            bordered={props.bordered}
            onRow={props.onRow}
            onToggleExpand={toggleExpandRow}
            expanded={!!expandedRowKeys?.includes(key)}
            expandRowRender={props.expandRowRender}
          />
        );

        if (typeof props.renderRowContainer === "function") {
          return (
            <Fragment key={key}>
              {props.renderRowContainer(record, index, row)}
            </Fragment>
          );
        }

        return row;
      })}
    </tbody>
  );
};
