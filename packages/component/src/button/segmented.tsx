import { type PropsWithChildren, FC } from "react";
import { twMerge } from "tailwind-merge";
import { cn } from "@/utils/css";

export type SegmentedItem = {
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
    <div className="orderly-flex orderly-flex-row orderly-gap-[36px]">
      {props.buttons.map((item, index) => {
        return (
          <_Button
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
  label,
  value,
  isActive,
  index,
  onChange,
  className,
  disabled,
  activeClassName,
  disabledClassName,
}: SegmentedItem & { index: number; isActive: boolean; onChange: any }) => {
  const isFirstChild = index === 0;
  return (
    <button
      type="button"
      onClick={(event) => onChange(value)}
      disabled={disabled}
      className={cn(
        "orderly-min-w-0 orderly-flex-1 orderly-py-1 orderly-bg-fill orderly-text-base-contrast/20 orderly-relative after:orderly-block after:orderly-bg-fill after:orderly-absolute after:orderly-w-[30px] after:orderly-h-full after:orderly-top-0 after:orderly-z-10 orderly-h-[32px]",
        isActive && "orderly-bg-primary after:orderly-bg-primary",
        isFirstChild &&
          "orderly-rounded-l after:orderly-right-[-15px] after:orderly-skew-x-[-25deg] orderly-pl-[15px]",
        !isFirstChild &&
          "orderly-rounded-r after:orderly-left-[-15px] after:orderly-skew-x-[-25deg] orderly-pr-[15px]",
        className,
        isActive && activeClassName,
        disabled && disabledClassName
      )}
    >
      {label}
    </button>
  );
};
