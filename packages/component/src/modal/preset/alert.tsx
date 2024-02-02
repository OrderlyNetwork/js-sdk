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
import { cn } from "@/utils/css";
import { Divider } from "@/divider";

export interface AlertDialogProps {
  title?: string;
  message?: ReactNode;
  onOk?: () => Promise<any>;
  closeable?: boolean;
}

export const AlertDialog = create<AlertDialogProps>((props) => {
  const { title, message, closeable = true } = props;
  const { visible, hide, resolve, reject, onOpenChange } = useModal();

  const onOk = useCallback(() => {
    hide();
  }, [props.onOk]);
  return (
    <Dialog open={visible} onOpenChange={onOpenChange}>
      <DialogContent
        className="orderly-modal-alert"
        closable={closeable}
        maxWidth={"xs"}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className={cn("after:orderly-hidden orderly-items-center",
          closeable && "orderly-items-start")}>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Divider className="orderly-mx-5 orderly-bg-white/[0.12]" />
        <DialogBody className="orderly-py-[20px]">{message}</DialogBody>
        <DialogFooter className="orderly-flex orderly-justify-center">
          <Button
            onClick={onOk}
            className="orderly-w-full orderly-text-xs orderly-text-base-contrast orderly-font-bold desktop:orderly-text-xs"
          >
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
