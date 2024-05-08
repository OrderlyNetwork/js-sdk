import React, { type PropsWithChildren, FC } from "react";
import { cn } from "@/utils/css";

export type SegmentedItem = {
  id?: string;
  label: string;
  value: string;
  disabled?: boolean;
  className?: string;
  activeClassName?: string;
  disabledClassName?: string;
};

export interface SegmentedButtonProps {
  buttons: SegmentedItem[];
  value?: string;
  // onClick: (value: string, event: Event) => void;
  onChange?: (value: string) => void;
  id?: string;
}

export const SegmentedButton: FC<PropsWithChildren<SegmentedButtonProps>> = (
  props
) => {
  if (props.buttons.length < 2) {
    // throw new Error("SegmentedButton must have more than one button");
    return (
      <div className="orderly-text-red-500">
        SegmentedButton must have more than one button
      </div>
    );
  }

  return (
    <div id={props.id}  className="orderly-flex orderly-flex-row orderly-gap-[36px]">
      {props.buttons.map((item, index) => {
        return (
          <_Button
            id={item.id}
            label={item.label}
            value={item.value}
            key={index}
            index={index}
            isActive={item.value === props.value}
            className={item.className}
            activeClassName={item.activeClassName}
            onChange={props.onChange}
            disabled={item.disabled}
            disabledClassName={item.disabledClassName}
          />
        );
      })}
    </div>
  );
};

const _Button = ({
  id,
  label,
  value,
  isActive,
  index,
  onChange,
  className,
  disabled,
  activeClassName,
  disabledClassName,
}: SegmentedItem & { index: number; isActive: boolean; onChange: any, id?: string, }) => {
  const isFirstChild = index === 0;
  return (
    <button
      id={id}
      type="button"
      onClick={(event) => onChange(value)}
      disabled={disabled}
      className={cn(
        "orderly-min-w-0 orderly-flex-1 orderly-py-1 orderly-bg-base-700 orderly-text-base-contrast/20 desktop:orderly-text-xs orderly-relative after:orderly-block after:orderly-bg-base-700 after:orderly-absolute after:orderly-w-[30px] after:orderly-h-full after:orderly-top-0 after:orderly-z-10 orderly-h-[32px] desktop:orderly-h-[40px]",
        isActive && "orderly-bg-primary after:orderly-bg-primary",
        isFirstChild &&
          "orderly-rounded-l after:orderly-right-[-15px] after:orderly-skew-x-[-25deg] orderly-pl-[15px]",
        !isFirstChild &&
          "orderly-rounded-r after:orderly-left-[-15px] after:orderly-skew-x-[-25deg] orderly-pr-[15px]",
        `orderly-segmented-button orderly-segmented-button-${value?.toLowerCase()}`,
        className,
        isActive && activeClassName,
        disabled && disabledClassName
      )}
    >
      {label}
    </button>
  );
};
