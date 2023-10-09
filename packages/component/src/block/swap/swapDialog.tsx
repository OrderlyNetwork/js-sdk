import { Dialog, DialogBody, DialogContent, DialogHeader } from "@/dialog";
import { useModal } from "@/modal";
import { create } from "@/modal/modalHelper";
import { Swap, SwapProps } from "./swap";

export const SwapDialog = create<SwapProps>((props) => {
  const { visible, onOpenChange } = useModal();
  return (
    <Dialog onOpenChange={onOpenChange} open={visible}>
      <DialogContent>
        <DialogHeader>Review swap details</DialogHeader>
        <DialogBody>
          <Swap {...props} />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
});
