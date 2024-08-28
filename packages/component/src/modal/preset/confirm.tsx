import { FC } from "react";
import { SimpleDialog } from "@/dialog/simpleDialog";
import { useModal } from "@/modal";
import { create } from "@/modal/modalHelper";
import { modalActions } from "@/modal/modalContext";
import { DialogBody } from "@/dialog";
export interface ConfirmProps {
  title?: React.ReactNode;
  content?: React.ReactNode;
  footer?: React.ReactNode;
  onOk?: () => Promise<any>;
  onCancel?: () => Promise<any>;
  contentClassName?: string;
  maxWidth?: "xs" | "sm" | "lg" | "xl" | null | undefined;
  closeableSize?: number;
  okId?: string;
  cancelId?: string;
}

const ConfirmDialog = create<ConfirmProps>((props) => {
  const { visible, hide, resolve, reject, onOpenChange } = useModal();
  return (
    <SimpleDialog
      open={visible}
      title={props.title}
      contentClassName={props.contentClassName}
      maxWidth={props.maxWidth}
      closable
      closeableSize={props.closeableSize}
      okId={props.okId}
      cancelId={props.cancelId}
      onOpenChange={(open) => {
        if (!open) {
          reject();
        }
        onOpenChange(open);
      }}
      onOk={() => {
        return Promise.resolve()
          .then(() => {
            if (typeof props.onOk === "function") {
              return props.onOk();
            }
            return true;
          })
          .then((data?: any) => {
            resolve(data);
            hide();
          });
      }}
      onCancel={
        typeof props.onCancel !== "undefined"
          ? () => {
              return props
                .onCancel?.()
                .then(
                  (data) => data,
                  (reason?: any) => {
                    reject(reason);
                  }
                )
                .finally(() => hide());
            }
          : undefined
      }
      footer={props.footer}
    >
      <DialogBody>
        <div className="orderly-py-5 orderly-text-xs">{props.content}</div>
      </DialogBody>
    </SimpleDialog>
  );
});

export const confirm = (props: ConfirmProps) => {
  return modalActions.show(ConfirmDialog, props);
};
