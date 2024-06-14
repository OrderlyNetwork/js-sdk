import { ElementType } from "react";
import { useModal, modal } from "../modal";
import { SimpleDialog, SimpleDialogProps } from "./simpleDialog";
import type { ModalArgs } from "@/modal/types";

function createDialogComponent<P extends Partial<SimpleDialogProps>>(
  Comp: ElementType
) {
  return modal.create((props: P) => {
    const { visible, hide, resolve, reject, onOpenChange } = useModal();
    // @ts-ignore
    const { title, size, ...rest } = props;
    return (
      <SimpleDialog
        open={visible}
        onOpenChange={onOpenChange}
        size={size}
        title={title}
      >
        <Comp {...rest} />
      </SimpleDialog>
    );
  });
}

// export function registerDialog<Props = {}>() {}

export const registerSimpleDialog = <Props = {},>(
  id: string,
  comp: ElementType<Props>,
  props?: Partial<ModalArgs<Props>>
) => {
  modal.register(id, createDialogComponent(comp), props);
};
