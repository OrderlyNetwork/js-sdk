import { FC, PropsWithChildren, ReactNode } from "react";
import { Sheet, SheetContent, SheetHeader } from ".";
import { SheetBody, SheetContentProps, SheetTitle } from "./sheet";
import { Divider } from "../divider";

export interface SimpleSheetProps {
  title?: ReactNode | (() => ReactNode);
  leading?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  classNames?: {
    content?: string;
    body?: string;
    header?: string;
  };
  contentProps?: SheetContentProps;
  closable?: boolean;
}

export const SimpleSheet: FC<PropsWithChildren<SimpleSheetProps>> = (props) => {
  const {
    open,
    onOpenChange,
    classNames,
    contentProps,
    closable = true,
  } = props;

  const title = typeof props.title === "function" ? props.title() : props.title;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        onOpenAutoFocus={(event) => event.preventDefault()}
        className={classNames?.content}
        closeable={closable}
        {...contentProps}
      >
        {title && (
          <>
            <SheetHeader leading={props.leading}>
              <SheetTitle>{title}</SheetTitle>
            </SheetHeader>
            <Divider />
          </>
        )}
        <SheetBody className={classNames?.body}>{props.children}</SheetBody>
      </SheetContent>
    </Sheet>
  );
};
