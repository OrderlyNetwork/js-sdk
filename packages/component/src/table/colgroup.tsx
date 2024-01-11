import { Column } from "./col";

export const ColGroup = <RecordType,>(props: {
  columns: Column<RecordType>[];
}) => {
  return (
    <colgroup>
      {props.columns.map((col, index) => {
        return <col key={index} className={col.className} align={col.align} />;
      })}
    </colgroup>
  );
};
