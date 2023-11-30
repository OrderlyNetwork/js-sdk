import { ActionItem, type BaseActionSheetItem } from "./actionItem";
import React, { FC, Fragment } from "react";
import { ActionDivision } from "@/sheet/actionSheet/actionDivision";
import { Divider } from "@/divider";

export interface ActionSheetContentProps {
  actionSheets: BaseActionSheetItem[];
  value?: BaseActionSheetItem;
  onValueChange?: (value: any) => void;
  onClose?: () => void;
}
export const ActionSheetContent: FC<ActionSheetContentProps> = (props) => {
  return (
    <>
      {props.actionSheets.map((action, index) => {
        if (action.type === "division") {
          return <ActionDivision key={index} />;
        }
        return (
          <Fragment key={action.value || index}>
            <ActionItem
              onClick={(value) => {
                //

                if (value.value === "cancel") {
                  return;
                }

                if (typeof action.onClick === "function") {
                  action.onClick(action);
                  // props.onClose();
                } else {
                  props.onValueChange?.(value);
                  props.onClose?.();
                }

                // props.onClose();
              }}
              index={index}
              action={action}
              active={
                typeof props.value !== "undefined" &&
                props.value.value === action.value
              }
            />
            {index < props.actionSheets.length - 1 && (
              <Divider className="orderly-border-base-contrast/10" />
            )}
          </Fragment>
        );
      })}
    </>
  );
};
