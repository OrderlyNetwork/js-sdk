import { ReactNode } from "react";
import { SimpleDialog } from "../../dialog/simpleDialog";
import { create } from "../modalHelper";
import { useModal } from "../useModal";
import { modalActions } from "../modalContext";

export interface DialogProps {
  title: string;
  content: ReactNode;
  size?: "xs" | "sm" | "md" | "lg";


}

const Dialog = create<DialogProps>((props) => {
  const { visible, hide, resolve, reject, onOpenChange } = useModal();
  return (
    <SimpleDialog
      open={visible}
      title={props.title}
      closable
      onOpenChange={onOpenChange}
      size={props.size}
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
