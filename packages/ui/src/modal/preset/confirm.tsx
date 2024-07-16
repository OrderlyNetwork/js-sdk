import { create } from "../modalHelper";
import { useModal } from "../useModal";
import { DialogBody, SimpleDialog } from "../../dialog";
import { modalActions } from "../modalContext";
export interface ConfirmProps {
  title?: string;
  content?: React.ReactNode;
  footer?: React.ReactNode;
  onOk?: () => Promise<any>;
  onCancel?: () => Promise<any>;
  contentClassName?: string;
  // maxWidth?: "xs" | "sm" | "lg" | "xl" | null | undefined;
  // closeableSize?: number;
  // okId?: string;
  // cancelId?: string;
}

export const ConfirmDialog = create<ConfirmProps>((props) => {
  const { visible, hide, resolve, reject, onOpenChange } = useModal();
  return (
    <SimpleDialog
      open={visible}
      title={props.title}
      contentClassName={props.contentClassName}
      // maxWidth={props.maxWidth}
      closable
      // closeableSize={props.closeableSize}
      // okId={props.okId}
      // cancelId={props.cancelId}
      onOpenChange={(open) => {
        if (!open) {
          reject();
        }
        onOpenChange(open);
      }}
      actions={{
        primary: {
          label: "Confirm",
          onClick: () => {
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
          },
        },
        secondary: {
          label: "Cancel",
          onClick: () => {
            return Promise.resolve()
              .then(() => {
                if (typeof props.onCancel === "function") {
                  return props.onCancel();
                }
                return true;
              })
              .then((data?: any) => {
                resolve(data);
                hide();
              });
          },
        },
      }}
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
