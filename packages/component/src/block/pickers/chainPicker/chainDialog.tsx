// import { create } from "";
import { ChainListView, ChainListViewProps } from "./chainListView";
import { useModal, modal } from "@orderly.network/ui";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/dialog/dialog";

export const ChainDialog = modal.create<ChainListViewProps>((props) => {
  const { visible, onOpenChange, hide, resolve } = useModal();
  const { onItemClick, ...rest } = props;

  const _onItemClick = async (value: { id: number; name: string }) => {
    const result = onItemClick?.(value) || value;
    resolve(result);
    hide();
  };

  const _onOpenChange = (open: boolean) => {
    if (!open) {
      resolve("cancel");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={visible} onOpenChange={_onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(event) => event.preventDefault()}
        closable
      >
        <DialogHeader>
          <DialogTitle className="orderly-switch-network-dialog-title">
            Switch network
          </DialogTitle>
        </DialogHeader>
        <DialogBody className="orderly-max-h-[335.5px] orderly-overflow-y-auto">
          <ChainListView {...rest} onItemClick={_onItemClick} />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
});
