import { create } from "../modalHelper";
import { useModal } from "../useModal";
import { DialogBody, SimpleDialog, SimpleDialogProps } from "../../dialog";
import { modalActions } from "../modalContext";
import { Text } from "../../typography";
import { useMemo } from "react";
import { useScreen } from "../../hooks";

export type ConfirmProps = {
  content?: React.ReactNode;
  footer?: React.ReactNode;
  onOk?: () => Promise<any>;
  okLabel?: string;
  onCancel?: () => Promise<any>;
  cancelLabel?: string;
  contentClassName?: string;
  bodyClassName?: string;
  // closeableSize?: number;
  // okId?: string;
  // cancelId?: string;
} & Pick<SimpleDialogProps, "title" | "classNames" | "size">;

export const ConfirmDialog = create<ConfirmProps>((props) => {
  const { size } = props;
  const { visible, hide, resolve, reject, onOpenChange } = useModal();

  const { isMobile } = useScreen();

  const defaultSize = isMobile ? "xs" : "sm";

  return (
    <SimpleDialog
      open={visible}
      title={
        <Text size="base" weight="semibold">
          {props.title}
        </Text>
      }
      size={size || defaultSize}
      classNames={{
        content: props.contentClassName,
        body: props.bodyClassName,
        ...props.classNames,
      }}
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
          label: props.okLabel ?? "Confirm",
          className: "oui-text-sm oui-font-semibold oui-w-[100%] oui-h-8",
          "data-testid": "oui-testid-confirm-dialog-confirm-btn",
          onClick: () => {
            return Promise.resolve()
              .then(() => {
                if (typeof props.onOk === "function") {
                  return props.onOk();
                }
                return true;
              })
              .then(
                (data?: any) => {
                  resolve(data);
                  hide();
                },
                (err) => {
                  reject(err);
                  hide();
                }
              );
          },
        },
        secondary: {
          label: props.cancelLabel ?? "Cancel",
          className: "oui-text-sm oui-font-semibold oui-w-[100%] oui-h-8",
          "data-testid": "oui-testid-confirm-dialog-cancel-btn",
          onClick: () => {
            return Promise.resolve()
              .then(() => {
                if (typeof props.onCancel === "function") {
                  return props.onCancel();
                }
                return Promise.reject('cancel');
              })
              .then(
                (data?: any) => {
                  resolve(data);
                  hide();
                },
                (err) => {
                  reject(err);
                  hide();
                }
              );
          },
        },
      }}
    >
      <div className="oui-text-2xs lg:oui-text-sm">{props.content}</div>
    </SimpleDialog>
  );
});

export const confirm = <T = any, >(props: ConfirmProps):Promise<T> => {
  return modalActions.show(ConfirmDialog, props);
};
