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
      <DialogContent closable={false}>
        <DialogHeader className="after:hidden items-center pt-3 pb-0">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogBody className="py-[20px]">{message}</DialogBody>
        <DialogFooter className="flex justify-center">
          <Button onClick={onOk} className="w-2/3 text-xs text-base-contrast">
            Ok
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export const alert = (props: AlertDialogProps) => {
  return modalActions.show(AlertDialog, props);
};
