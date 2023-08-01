import { FC } from "react";
import { ActionSheetItem } from "./actionItem";

export interface ActionSheetProps {
  actionSheets: ActionSheetItem[];
}

export const ActionSheet: FC<ActionSheetProps> = (props) => {
  return <div>ActionSheet</div>;
};
