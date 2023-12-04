import { FC } from "react";
import { SimpleDialog } from "@/dialog/simpleDialog";
import { useModal } from "@/modal";
import { create } from "@/modal/modalHelper";
import { modalActions } from "@/modal/modalContext";
import { DialogBody } from "@/dialog";

export interface DialogProps {
  title: string;
  content: React.ReactNode;
}

const Dialog = create<DialogProps>((props) => {
  const { visible, hide, resolve, reject, onOpenChange } = useModal();
  return (
    <SimpleDialog
      open={visible}
      title={props.title}
      closable
      onOpenChange={onOpenChange}
      // // @ts-ignore
      // onOk={() => {
      //   resolve(true);
      //   hide();
      // }}
      // onCancel={() => {
      //   reject(false);
      //   hide();
      // }}
    >
      <DialogBody>
        <div className="orderly-py-5 orderly-text-[12px]">{props.content}</div>
      </DialogBody>
    </SimpleDialog>
  );
});

export const dialog = (props: DialogProps) => {
  return modalActions.show(Dialog, props);
};
