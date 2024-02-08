import { FC, ReactNode, useMemo } from "react";
import { Column, ColumnFixed } from "./col";
import { cn } from "@/utils/css";

interface Props<RecordType> {
  columns: Column[];
  expandRowRender?: (record: RecordType, index: number) => ReactNode;
  record: RecordType;

  index: number;
  bordered?: boolean;
}

export const ExpandRow = <RecordType,>(props: Props<RecordType>) => {
  const { columns, record, index } = props;
  const cols = useMemo(() => {
    const cols: { colCount: number; type: ColumnFixed | undefined }[] = [];

    let prev;
    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];
      if (i === 0) {
        cols.push({ colCount: 1, type: col.fixed });
        continue;
      } else {
        prev = columns[i - 1];
      }

      if (col.fixed !== prev?.fixed) {
        cols.push({ colCount: 1, type: col.fixed });
      } else {
        cols[cols.length - 1] = {
          ...cols[cols.length - 1],
          colCount: cols[cols.length - 1].colCount + 1,
        };
      }
    }
    return cols;
  }, [columns]);

  return (
    <tr
      className={cn(
        props.bordered &&
          "orderly-border-b orderly-border-divider last:orderly-border-b-0"
      )}
    >
      {cols.map((item, index) => {
        const pos =
          item.type === undefined
            ? {}
            : item.type === "left"
            ? {
                left: "0px",
                borderBouttom: "1px solid #e5e5e5",
              }
            : {
                right: "0px",
                borderBouttom: "1px solid #e5e5e5",
              };
        return (
          <td
            colSpan={item.colCount}
            key={index}
            style={{
              ...pos,
              backgroundColor:
                item.type !== undefined
                  ? "var(--table-background-color)"
                  : "transparent",
            }}
            className={cn(!!item.type && "orderly-sticky")}
          >
            {!item.type ? (
              <div className="orderly-bg-base-700 orderly-rounded-[4px] orderly-my-1">
                {props.expandRowRender?.(record, index)}
              </div>
            ) : null}
          </td>
        );
      })}
    </tr>
  );
};
