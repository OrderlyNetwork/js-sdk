import type { FC, PropsWithChildren, ReactNode } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogDescription,
  Dialog,
  DialogTitle,
  DialogFooter,
} from "@/dialog/dialog";
import { useMemo } from "react";
import Button from "@/button";

export interface BaseDialogProps {
  open: boolean;
  title: ReactNode;
  closable?: boolean;
  onOk?: () => void;
  onCancel?: () => void;
  footer?: ReactNode;
}

export const SimpleDialog: FC<PropsWithChildren<BaseDialogProps>> = (props) => {
  const actions = useMemo(() => {
    if (!props.onCancel && !props.onOk) {
      return null;
    }

    const buttons = [];

    if (typeof props.onCancel === "function") {
      buttons.push(
        <Button
          key="cancel"
          type="button"
          onClick={props.onCancel}
          color={"danger"}
        >
          Cancel
        </Button>
      );
    }

    if (typeof props.onOk === "function") {
      buttons.push(
        <Button key="ok" type="button" onClick={props.onOk}>
          Ok
        </Button>
      );
    }

    return <DialogFooter>{buttons}</DialogFooter>;
  }, [props.onCancel, props.onOk]);

  return (
    <Dialog open={props.open}>
      <DialogContent closable={props.closable}>
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
          {/*<DialogDescription>*/}
          {/*  Make changes to your profile here. Click save when you're done.*/}
          {/*</DialogDescription>*/}
        </DialogHeader>
        {props.children}
        {actions}
      </DialogContent>
    </Dialog>
  );
};
