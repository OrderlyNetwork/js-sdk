import { FC, ReactNode, useCallback, useMemo } from "react";

//   import { useModal } from "@/modal";
import { SimpleDialog } from "./simpleDialog";

export interface AlertDialogProps {
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
      };
    }

    if (typeof onOk === "function") {
      actions["primary"] = {
        label: okLabel,
        onClick: onOk,
      };
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
    >
      {message}
    </SimpleDialog>
  );
};
