import { create } from "../modalHelper";
import { useModal } from "../useModal";
import { DialogBody, SimpleDialog } from "../../dialog";
import { modalActions } from "../modalContext";
import { Text } from "../../typography";

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
      title={
        <Text size="base" weight="semibold">
          {props.title}
        </Text>
      }
      size="sm"
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
          className: "oui-text-sm oui-font-semibold oui-w-[100%] oui-h-8",
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
          className: " oui-text-sm oui-font-semibold oui-w-[100%] oui-h-8",
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
      <Text className="" size="sm">
        {props.content}
      </Text>
    </SimpleDialog>
  );
});

export const confirm = (props: ConfirmProps) => {
  return modalActions.show(ConfirmDialog, props);
};
