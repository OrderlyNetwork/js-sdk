import { FC, ReactNode, useCallback } from "react";
import { cn } from "@/utils/css";
import { ArrowIcon } from "@/icon";
import { cx } from "class-variance-authority";
import { SortDirection, type SortKey } from "../types";

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
      className={cn(
        "orderly-flex orderly-items-center orderly-gap-1 orderly-cursor-pointer",
        {
          "orderly-text-base-contrast":
            props.currentValue?.key === props.value &&
            props.currentValue.direction !== SortDirection.NONE,
        }
      )}
      onClick={onClick}
    >
      <span>{props.label}</span>
      {props.currentValue?.key === props.value &&
        props.currentValue.direction !== SortDirection.NONE && (
          <ArrowIcon
            size={8}
            className={cx(
              "orderly-transition-transform",
              props.currentValue?.direction === SortDirection.ASC
                ? "orderly-rotate-180"
                : "orderly-rotate-0"
            )}
          />
        )}
    </div>
  );
};
