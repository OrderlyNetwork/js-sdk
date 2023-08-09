import { create } from "@/modal/modalHelper";
import { useModal } from "@/modal";
import { modalActions } from "@/modal/modalContext";
import {
  ActionSheet,
  type ActionSheetItem,
} from "@/bottomSheet/actionSheet/actionSheet";
import { useEffect } from "react";

export const InnerActionSheet = create<{ items: ActionSheetItem[] }>(
  (props) => {
    const { visible, hide, remove } = useModal();

    useEffect(() => {
      return () => {
        remove();
      };
    }, []);

    return (
      <ActionSheet isOpen={visible} onClose={hide} actionSheets={props.items} />
    );
  }
);

/**
 * show action sheet
 * @param items
 */
export const actionSheet = (items: ActionSheetItem[]) => {
  return modalActions.show(InnerActionSheet, { items });
};
