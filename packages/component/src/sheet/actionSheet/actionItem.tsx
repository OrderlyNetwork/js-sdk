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
        "flex justify-center items-center text-lg h-[52px] cursor-pointer",

        {
          "text-primary": props.active,
        }
      )}
      onClick={onItemClick}
    >
      {child}
    </div>
  );
};
