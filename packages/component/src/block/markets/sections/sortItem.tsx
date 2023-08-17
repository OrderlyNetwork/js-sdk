import { FC, ReactNode, useCallback } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/utils/css";

export enum SortDirection {
  NONE,
  ASC,
  DESC,
}

export type SortKey = "vol" | "price" | "change";

export type currentValue = {
  key?: SortKey;
  direction: SortDirection;
};

export interface SortItemProps {
  label: string | ReactNode;
  value: SortKey;
  // direction?: SortDirection;
  currentValue?: currentValue;
  onClick?: (sortKey: SortKey) => void;
}

export const SortItem: FC<SortItemProps> = (props) => {
  const onClick = useCallback(() => {
    props.onClick?.(props.value);
  }, [props.value, props.currentValue]);

  return (
    <div
      className={cn("flex items-center gap-1 cursor-pointer", {
        "text-base-contrast":
          props.currentValue?.key === props.value &&
          props.currentValue.direction !== SortDirection.NONE,
      })}
      onClick={onClick}
    >
      <span>{props.label}</span>
      {props.currentValue?.key === props.value &&
        props.currentValue.direction !== SortDirection.NONE &&
        (props.currentValue?.direction === SortDirection.ASC ? (
          <ChevronDown size={14} />
        ) : (
          <ChevronUp size={14} />
        ))}
    </div>
  );
};
