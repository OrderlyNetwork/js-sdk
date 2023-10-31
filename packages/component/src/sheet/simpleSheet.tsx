import { FC, PropsWithChildren, ReactNode } from "react";
import { Sheet, SheetContent, SheetHeader } from "./sheet";

export interface SimpleSheetProps {
  title: ReactNode;
  open: boolean;
  onClose?: () => void;
}

export const SimpleSheet: FC<PropsWithChildren<SimpleSheetProps>> = (props) => {
  return (
    <Sheet
      open={props.open}
      onOpenChange={(open) => {
        if (!open) {
          props.onClose?.();
        }
      }}
    >
      <SheetContent>
        <SheetHeader>{props.title}</SheetHeader>
        {props.children}
      </SheetContent>
    </Sheet>
  );
};
