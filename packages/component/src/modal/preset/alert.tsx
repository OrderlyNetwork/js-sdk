import { modalActions } from "../modalContext";

import { create } from "../modalHelper";
import { FC, ReactNode, useCallback } from "react";
import { useModal } from "../useModal";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/dialog";
import Button from "@/button";

export interface AlertDialogProps {
  title?: string;
  message?: ReactNode;
  onOk?: () => Promise<any>;
}

export const AlertDialog = create<AlertDialogProps>((props) => {
  const { title, message } = props;
  const { visible, hide, resolve, reject, onOpenChange } = useModal();

  const onOk = useCallback(() => {
    hide();
  }, [props.onOk]);
  return (
    <Dialog open={visible} onOpenChange={onOpenChange}>
      <DialogContent closable={false} maxWidth={"xs"}>
        <DialogHeader className="after:orderly-hidden orderly-items-center orderly-pt-3 orderly-pb-0">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogBody className="orderly-py-[20px]">{message}</DialogBody>
        <DialogFooter className="orderly-flex orderly-justify-center">
          <Button onClick={onOk} className="orderly-w-full orderly-text-xs orderly-text-base-contrast orderly-font-bold desktop:orderly-text-xs">
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export const alert = (props: AlertDialogProps) => {
  return modalActions.show(AlertDialog, props);
};
