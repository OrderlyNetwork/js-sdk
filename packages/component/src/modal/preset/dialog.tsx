import { FC } from "react";
import { SimpleDialog } from "@/dialog/simpleDialog";
import { useModal } from "@/modal";
import { create } from "@/modal/modalHelper";
import { modalActions } from "@/modal/modalContext";
import { DialogBody } from "@/dialog";
export interface ConfirmProps {
  title: string;
  content: React.ReactNode;
}

const Dialog = create<ConfirmProps>((props) => {
  const { visible, hide, resolve, reject } = useModal();
  return (
    <SimpleDialog
      open={visible}
      title={props.title}
      closable={false}
      onOk={() => {
        resolve(true);
        hide();
      }}
      onCancel={() => {
        reject(false);
        hide();
      }}
    >
      <DialogBody>
        <div className="orderly-py-5 orderly-text-[12px]">{props.content}</div>
      </DialogBody>
    </SimpleDialog>
  );
});

export const confirm = (props: ConfirmProps) => {
  return modalActions.show(Dialog, props);
};
