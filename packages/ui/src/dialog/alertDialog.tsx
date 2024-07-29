import { FC, ReactNode, useCallback, useMemo } from "react";

//   import { useModal } from "@/modal";
import { SimpleDialog, SimpleDialogProps } from "./simpleDialog";
import { DialogAction } from "./simpleDialogFooter";

export interface AlertDialogProps
  extends Pick<SimpleDialogProps, "contentClassName" | "size"> {
  title?: string;
  message?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onOk?: () => Promise<boolean>;
  onCancel?: () => void;
  okLabel?: string;
  cancelLabel?: string;
  closeable?: boolean;
}

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
      } as DialogAction;
    }

    if (typeof onOk === "function") {
      actions["primary"] = {
        label: okLabel,
        size: "md",
        className: "oui-w-[154px]",
        onClick: onOk,
      } as DialogAction;
    }

    return actions;
  }, [onOk, onCancel, okLabel, cancelLabel]);

  return (
    <SimpleDialog
      open={open}
      title={title}
      size={"sm"}
      actions={actions}
      onOpenChange={onOpenChange}
      contentClassName="oui-bg-base-8 oui-font-semibold oui-border oui-border-line-6"
      footerClassName="oui-justify-center"
    >
      {message}
    </SimpleDialog>
  );
};
