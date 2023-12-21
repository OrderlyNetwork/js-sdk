import React, {
  ComponentPropsWithoutRef,
  FC,
  PropsWithChildren,
  useMemo,
} from "react";
import { ActionItem, BaseActionSheetItem } from "./actionItem";

import { ActionSheetContent } from "@/sheet/actionSheet/actionSheetContent";
import { Sheet, SheetContent, SheetTrigger } from "@/sheet";

export type SystemActionSheetItem = "Cancel" | "Confirm" | "---";

export type ActionSheetItem = BaseActionSheetItem | SystemActionSheetItem;

export interface ActionSheetProps
  extends ComponentPropsWithoutRef<typeof Sheet> {
  actionSheets: ActionSheetItem[];
  value?: BaseActionSheetItem;
  onValueChange?: (value: string) => void;
  open?: boolean;
  onClose?: () => void;
}

export const ActionSheet: FC<PropsWithChildren<ActionSheetProps>> = (props) => {
  // create actionSheet items
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
                props.onClose?.();
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
    <Sheet open={props.open} onOpenChange={props.onOpenChange}>
      {typeof props.children !== "undefined" && (
        <SheetTrigger asChild>{props.children}</SheetTrigger>
      )}

      <SheetContent
        closeable={false}
        className="orderly-action-sheet-content orderly-p-0"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <ActionSheetContent
          actionSheets={items}
          onClose={props.onClose}
          onValueChange={props.onValueChange}
          value={props.value}
        />
      </SheetContent>
    </Sheet>
  );
};
