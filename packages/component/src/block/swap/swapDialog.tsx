import { Dialog, DialogBody, DialogContent, DialogHeader } from "@/dialog";
import { useModal } from "@/modal";
import { create } from "@/modal/modalHelper";
import { Swap, SwapProps } from "./swap";

export const SwapDialog = create<SwapProps>((props) => {
  const { visible, onOpenChange, hide, resolve, reject } = useModal();
  const onComplete = () => {
    resolve();
    hide();
  };

  const onCancel = () => {
    reject();
    hide();
  };

  return (
    <Dialog
      onOpenChange={(visible: boolean) => {
        if (!visible) {
          reject();
        }
        onOpenChange(visible);
      }}
      open={visible}
    >
      <DialogContent
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>Review swap details</DialogHeader>
        <DialogBody>
          <Swap {...props} onComplete={onComplete} onCancel={onCancel} />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
});
