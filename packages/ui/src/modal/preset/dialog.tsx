import { ReactNode } from "react";
import { SimpleDialog, SimpleDialogProps } from "../../dialog/simpleDialog";
import { create } from "../modalHelper";
import { useModal } from "../useModal";
import { modalActions } from "../modalContext";

export type DialogProps = {
  content: ReactNode;
} & Pick<SimpleDialogProps, "title" | "closable" | "size">;

const Dialog = create<DialogProps>((props) => {
  const { visible, hide, resolve, reject, onOpenChange } = useModal();
  return (
    <SimpleDialog
      title={props.title}
      open={visible}
      onOpenChange={onOpenChange}
      size={props.size}
      closable={props.closable}
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
      {props.content}
    </SimpleDialog>
  );
});

export const dialog = (props: DialogProps) => {
  return modalActions.show(Dialog, props);
};
