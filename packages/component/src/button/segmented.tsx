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
      <div className="text-red-500">
        SegmentedButton must have more than one button
      </div>
    );
  }

  return (
    <div className="flex flex-row gap-[36px]">
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
      className={cn(
        "min-w-0 flex-1 py-1 bg-fill text-base-contrast/20 relative after:block after:bg-fill after:absolute after:w-[30px] after:h-full after:top-0 after:z-10 h-[32px]",
        isActive && "bg-primary after:bg-primary",
        isFirstChild &&
          "rounded-l after:right-[-15px] after:skew-x-[-25deg] pl-[15px]",
        !isFirstChild &&
          "rounded-r after:left-[-15px] after:skew-x-[-25deg] pr-[15px]",
        className,
        isActive && activeClassName,
        disabled && disabledClassName
      )}
    >
      {label}
    </button>
  );
};
