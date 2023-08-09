import { ActionItem, type BaseActionSheetItem } from "./actionItem";
import React, { FC } from "react";
import { ActionDivision } from "@/bottomSheet/actionSheet/actionDivision";

export interface ActionListViewProps {
  actionSheets: BaseActionSheetItem[];
  value?: React.SelectHTMLAttributes<HTMLSelectElement>["value"];
  onValueChange?: (value: string) => void;
  onClose: () => void;
}
export const ActionListView: FC<ActionListViewProps> = (props) => {
  return (
    <>
      {props.actionSheets.map((action, index) => {
        if (action.type === "division") {
          return <ActionDivision key={index} />;
        }
        return (
          <ActionItem
            onClick={(value) => {
              console.log(value);

              if (value.value === "cancel") {
                return;
              }

              if (typeof action.onClick === "function") {
                action.onClick(action);
                // props.onClose();
              } else {
                props.onValueChange?.(value.value || "");
                props.onClose();
              }

              // props.onClose();
            }}
            index={index}
            action={action}
            active={
              typeof props.value !== "undefined" && props.value === action.value
            }
            key={action.value || index}
          />
        );
      })}
    </>
  );
};
