import { Dialog, DialogFooter, DialogHeader } from "@/dialog/dialog";
import { FC } from "react";
import { DialogClose } from "@radix-ui/react-dialog";
import Button from "@/button";

export interface AlertDialogProps {
  title?: string;
  message?: string;
  onConfirm?: () => void;
}

export const AlertDialog: FC<AlertDialogProps> = (props) => {
  return (
    <Dialog>
      <DialogHeader>Alert</DialogHeader>

      <DialogClose asChild>
        <Button>OK</Button>
      </DialogClose>
    </Dialog>
  );
};
