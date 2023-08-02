import { type PropsWithChildren, FC } from "react";
import { cx } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

export type SegmentedItem = {
  label: string;
  value: string;
  disabled?: boolean;
};

export interface SegmentedButtonProps {
  buttons: SegmentedItem[];
  value?: string;
  onClick: (value: string, event: Event) => void;
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
    <div className="flex flex-row gap-[40px]">
      {props.buttons.map((item, index) => {
        return (
          <_Button
            label={item.label}
            value={item.value}
            key={index}
            index={index}
            isActive={item.value === props.value}
            onClick={props.onClick}
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
  onClick,
}: SegmentedItem & { index: number; isActive: boolean; onClick: Function }) => {
  const isFirstChild = index === 0;
  return (
    <button
      onClick={(event) => onClick(value, event)}
      className={twMerge(
        cx(
          "min-w-0 flex-1 py-1 bg-slate-300 relative after:block after:bg-slate-300 after:absolute after:w-[40px] after:h-full after:top-0 after:z-10 h-[32px]",
          isActive && "bg-red-500 after:bg-red-500",
          isFirstChild &&
            "rounded-l-md after:right-[-15px] after:skew-x-[-35deg]",
          !isFirstChild &&
            "rounded-r-md after:left-[-15px] after:skew-x-[-35deg]"
        )
      )}
    >
      {label}
    </button>
  );
};
