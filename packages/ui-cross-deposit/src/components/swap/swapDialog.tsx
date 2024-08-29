import { modal, SimpleDialog, useModal } from "@orderly.network/ui";
import { Swap, SwapProps } from "./swap";

export const SwapDialog = modal.create<SwapProps>((props) => {
  const { visible, hide, resolve, reject, onOpenChange } = useModal();

  const onComplete = (isSuccss: boolean) => {
    resolve(isSuccss);
    hide();
  };

  const onCancel = () => {
    reject();
    hide();
  };

  return (
    <SimpleDialog
      open={visible}
      title="Review swap details"
      closable
      onOpenChange={onOpenChange}
      classNames={{
        content: "oui-font-semibold oui-w-[95%]",
      }}
      size="md"
    >
      <Swap {...props} onComplete={onComplete} onCancel={onCancel} />
    </SimpleDialog>
  );
});
