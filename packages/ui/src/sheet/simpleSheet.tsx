import { FC, PropsWithChildren, ReactNode } from "react";
import { Sheet, SheetContent, SheetHeader } from ".";

export interface SimpleSheetProps {
  title: ReactNode;
  open: boolean;
  onClose?: () => void;
  classNames?: {
    content?: string;
    header?: string;
  };
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
      <SheetContent className={props.classNames?.content}>
        <SheetHeader className={props.classNames?.header}>
          {props.title}
        </SheetHeader>
        {props.children}
      </SheetContent>
    </Sheet>
  );
};
