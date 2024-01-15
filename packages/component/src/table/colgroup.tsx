import { CSSProperties } from "react";
import { Column } from "./col";

export const ColGroup = <RecordType,>(props: {
  columns: Column<RecordType>[];
}) => {
  return (
    <colgroup>
      {props.columns.map((col, index) => {
        const styles: CSSProperties = {};

        if (col.width) {
          styles["width"] = `${col.width}px`;
        }

        return (
          <col
            key={index}
            className={col.className}
            align={col.align}
            style={styles}
          />
        );
      })}
    </colgroup>
  );
};
