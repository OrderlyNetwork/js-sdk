import { FC, useMemo } from "react";
import { cn } from "@/utils/css";

export type Column = {
  title: string;
  width?: number;
  dataIndex: string;
  className?: string;
  align?: "left" | "center" | "right";
  formatter?: (value: any, record: any, index: number) => any;
  render?: (value: any, record: any, index: number) => React.ReactNode;
  getKey?: (record: any, index: number) => string;
};

interface ColProps {
  col: Column;
  record: any;
  index: number;
  justified?: boolean;
}

export const Col: FC<ColProps> = (props) => {
  const { col, record } = props;
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
  }, [col, record]);

  return (
    <td
      className={cn(
        "orderly-py-[2px] orderly-px-1 whitespace-nowrap",
        props.justified && "first:orderly-pl-0 last:orderly-pr-0",
        col.className,
        align === "right" && "orderly-text-right"
      )}
    >
      {content}
    </td>
  );
};
