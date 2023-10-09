import { create } from "@/modal/modalHelper";
import { ChainListView } from "./chainListView";
import { useModal } from "@/modal";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/dialog/dialog";

export const ChainDialog = create((props) => {
  const { visible, onOpenChange } = useModal();
  return (
    <Dialog open={visible} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Switch network</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <ChainListView mainnetChains={[]} testChains={[]} />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
});
