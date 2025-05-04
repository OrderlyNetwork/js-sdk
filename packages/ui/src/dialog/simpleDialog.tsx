import { FC, PropsWithChildren, ReactNode } from "react";
import { Divider } from "../divider";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContentProps,
} from "./dialog";
import {
  SimpleDialogFooter,
  SimpleDialogFooterProps,
} from "./simpleDialogFooter";

type SimpleDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  closable?: boolean;
  title?: ReactNode | (() => ReactNode);
  description?: ReactNode;
  classNames?: {
    content?: string;
    body?: string;
    footer?: string;
  };
  /** if provider, it will overrides others content props */
  contentProps?: DialogContentProps;
  // footer?: ReactNode;
} & SimpleDialogFooterProps;

/**
 * Simplified dialog component.
 */
const SimpleDialog: FC<PropsWithChildren<SimpleDialogProps>> = (props) => {
  const title = typeof props.title === "function" ? props.title() : props.title;

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent
        size={props.size}
        closable={props.closable}
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
        /** prevent close dialog when click the mask  */
        // onPointerDownOutside={(event) => event.preventDefault()}
        className={props.classNames?.content}
        {...props.contentProps}
      >
        {title && (
          <>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            <Divider />
          </>
        )}
        <DialogBody className={props.classNames?.body}>
          {props.children}
        </DialogBody>
        {typeof props.description !== "undefined" && (
          <DialogDescription>{props.description}</DialogDescription>
        )}
        <SimpleDialogFooter
          actions={props.actions}
          className={props.classNames?.footer}
        />
      </DialogContent>
    </Dialog>
  );
};

export { SimpleDialog };

export type { SimpleDialogProps };
