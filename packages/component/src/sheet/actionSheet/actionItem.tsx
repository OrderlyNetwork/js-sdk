import { FC, useCallback, useMemo } from "react";
import { cn } from "@/utils/css";

type SheetItemType = "division" | "data" | "cancel";

export interface BaseActionSheetItem {
  label: string;
  type?: SheetItemType;
  icon?: string;
  value?: string;
  active?: boolean;
  onClick?: (action: BaseActionSheetItem) => void;
}

export interface ActionSheetProps {
  action: BaseActionSheetItem;
  index: number;
  active?: boolean;
  onClick?: (value: { value?: string; index: number }) => void;
}

export const ActionItem: FC<ActionSheetProps> = (props) => {
  const { action } = props;

  const onItemClick = useCallback(() => {
    if (typeof action.onClick === "function") {
      action.onClick(action);
    } else {
      props.onClick?.({ ...action, index: props.index });
    }
  }, [action]);

  const child = useMemo(() => {
    return action.label;
  }, [action.label]);

  return (
    <div
      className={cn(
        "orderly-flex orderly-justify-center orderly-items-center orderly-text-lg orderly-h-[52px] orderly-cursor-pointer",

        {
          "orderly-text-primary": props.active,
        }
      )}
      onClick={onItemClick}
    >
      {child}
    </div>
  );
};
