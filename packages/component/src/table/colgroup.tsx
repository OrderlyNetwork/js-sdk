import { Column } from "./col";
import { ColGroupItem } from "./colgroupItem";

export const ColGroup = <RecordType,>(props: {
  columns: Column<RecordType>[];
}) => {
  return (
    <colgroup>
      {props.columns.map((col, index) => {
        return <ColGroupItem key={index} index={index} col={col} />;
      })}
    </colgroup>
  );
};
