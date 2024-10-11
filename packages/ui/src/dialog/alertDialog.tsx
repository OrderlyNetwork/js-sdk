import { FC, ReactNode, useMemo } from "react";
import { SimpleDialog, SimpleDialogProps } from "./simpleDialog";
import { DialogAction } from "./simpleDialogFooter";

export type AlertDialogProps = {
  title?: string;
  message?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onOk?: () => Promise<boolean>;
  onCancel?: () => void;
  okLabel?: string;
  cancelLabel?: string;
  closeable?: boolean;
} & {
  actions?: {
    primary?: Partial<DialogAction>;
    secondary?: Partial<DialogAction>;
  };
};

/**
 * Generic alert dialog, often used for confirmation/alert/information dialogs.
 */
export const AlertDialog: FC<AlertDialogProps> = (props) => {
  const {
    title,
    message,
    open,
    onOpenChange,
    onOk,
    onCancel,
    okLabel = "OK",
    cancelLabel = "Cancel",
  } = props;

  const actions = useMemo(() => {
    if (typeof onOk !== "function" && typeof onCancel !== "function")
      return undefined;
    const actions: any = {};
    if (typeof onCancel === "function") {
      actions["secondary"] = {
        label: cancelLabel,
        onClick: onCancel,
        size: "md",
        fullWidth: true,
        ...props.actions?.secondary,
      } as DialogAction;
    }

    if (typeof onOk === "function") {
      actions["primary"] = {
        label: okLabel,
        size: "md",
        fullWidth: true,
        className: "oui-w-[154px]",
        onClick: onOk,
        ...props.actions?.primary,
      } as DialogAction;
    }

    return actions;
  }, [onOk, onCancel, okLabel, cancelLabel, props.actions]);

  return (
    <SimpleDialog
      open={open}
      title={title}
      size={"sm"}
      actions={actions}
      onOpenChange={onOpenChange}
      classNames={{
        content: "oui-bg-base-8 oui-font-semibold oui-border oui-border-line-6 oui-p-4",
        footer: "oui-justify-center oui-pb-0",
      }}
    >
      {message}
    </SimpleDialog>
  );
};
