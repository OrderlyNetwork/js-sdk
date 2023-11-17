import { create } from "@/modal/modalHelper";
import { ChainListView, ChainListViewProps } from "./chainListView";
import { useModal } from "@/modal";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/dialog/dialog";

export const ChainDialog = create<Omit<ChainListViewProps, "onItemClick">>(
  (props) => {
    const { visible, onOpenChange, hide, resolve } = useModal();

    const onItemClick = (value: any) => {
      resolve(value);
      hide();
    };

    return (
      <Dialog open={visible} onOpenChange={onOpenChange}>
        <DialogContent onOpenAutoFocus={(event) => event.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Switch network</DialogTitle>
          </DialogHeader>
          <DialogBody className="orderly-max-h-[335.5px] orderly-overflow-y-auto">
            <ChainListView {...props} onItemClick={onItemClick} />
          </DialogBody>
        </DialogContent>
      </Dialog>
    );
  }
);
