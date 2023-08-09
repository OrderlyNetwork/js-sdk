import React, { FC, useMemo } from "react";
import { ActionItem, BaseActionSheetItem } from "./actionItem";
import { useModal } from "@/modal";
import Sheet from "react-modal-sheet";
import { ActionListView } from "@/bottomSheet/actionSheet/actionListView";

export type SystemActionSheetItem = "Cancel" | "Confirm" | "---";

export type ActionSheetItem = BaseActionSheetItem | SystemActionSheetItem;

export interface ActionSheetProps {
  actionSheets: ActionSheetItem[];
  value?: React.SelectHTMLAttributes<HTMLSelectElement>["value"];
  onValueChange?: (value: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ActionSheet: FC<ActionSheetProps> = (props) => {
  const items = useMemo<BaseActionSheetItem[]>(() => {
    const items: BaseActionSheetItem[] = [];

    if (Array.isArray(props.actionSheets)) {
      for (const action of props.actionSheets) {
        if (typeof action === "string") {
          if (action === "Cancel") {
            items.push({
              label: "Cancel",
              value: "cancel",
              onClick: () => {
                props.onClose();
              },
            });
          } else if (action === "Confirm") {
            items.push({
              label: "Confirm",
              value: "confirm",
            });
          } else if (action.startsWith("---")) {
            items.push({
              label: "---",
              value: "---",
              type: "division",
            });
          }
        } else {
          items.push(action);
        }
      }
    }

    return items;
  }, [props.actionSheets]);

  return (
    <Sheet
      isOpen={props.isOpen}
      onClose={props.onClose}
      detent={"content-height"}
    >
      <Sheet.Container>
        <Sheet.Content>
          <ActionListView
            actionSheets={items}
            onClose={props.onClose}
            onValueChange={props.onValueChange}
            value={props.value}
          />
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop />
    </Sheet>
  );
};
