import { FC } from "react";
import { SimpleDialog } from "@/dialog/simpleDialog";
import { useModal } from "@/modal";
import { create } from "@/modal/modalHelper";
import { modalActions } from "@/modal/modalContext";
export interface ConfirmProps {
  title: string;
  content: string;
}

const ConfirmDialog = create<ConfirmProps>((props) => {
  const { visible, hide, resolve } = useModal();
  return (
    <SimpleDialog
      open={visible}
      title={props.title}
      closable={false}
      onOk={() => {
        hide();
        resolve(true);
      }}
    >
      {props.content}
    </SimpleDialog>
  );
});

export const confirm = (props: ConfirmProps) => {
  return modalActions.show(ConfirmDialog, props);
};
