import { FC, useCallback } from "react";

export interface ActionSheetItem {
  title: string;
  icon?: string;
  eventKey?: string;
  active?: boolean;
  onClick?: (action: ActionSheetItem) => void;
}

export interface ActionSheetProps {
  action: ActionSheetItem;
  onChange?: (eventKey: string) => void;
}

export const ActionItem: FC<ActionSheetProps> = (props) => {
  const { action } = props;

  const onItemClick = useCallback(() => {
    if (typeof action.onClick === "function") {
      action.onClick(action);
    } else if (typeof action.eventKey === "string") {
      props.onChange?.(action.eventKey);
    }
  }, [action]);

  return <div onClick={onItemClick}>{action.title}</div>;
};
