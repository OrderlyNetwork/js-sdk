import { FC, useMemo } from "react";
import { cx } from "class-variance-authority";

export type Column = {
  title: string;
  width?: number;
  dataIndex: string;
  className?: string;
  align?: "left" | "center" | "right";
  formatter?: (value: any, record: any, index: number) => any;
  render?: (value: any, record: any, index: number) => React.ReactNode;
};

interface ColProps {
  col: Column;
  record: any;
  index: number;
}

export const Col: FC<ColProps> = (props) => {
  const { col } = props;
  const { align } = col;

  const content = useMemo(() => {
    const { col } = props;
    const { dataIndex, formatter, render } = col;
    let value = props.record[dataIndex];
    if (formatter) {
      value = formatter(value, props.record, props.index);
    }
    if (render) {
      return render(value, props.record, props.index);
    }
    return value;
  }, [col]);

  return (
    <td
      className={cx(
        "border-b",
        col.className,
        align === "right" && "text-right"
      )}
    >
      {content}
    </td>
  );
};
