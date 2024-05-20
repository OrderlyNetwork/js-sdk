import { FC, ReactNode, useCallback, useMemo } from "react";

//   import { useModal } from "@/modal";
import { SimpleDialog } from "./simpleDialog";

export interface AlertDialogProps {
  title?: string;
  message?: ReactNode;
  open?: boolean;
  onOk?: () => Promise<any>;
  onCancel?: () => void;
  okLabel?: string;
  cancelLabel?: string;
}

export const AlertDialog: FC<AlertDialogProps> = (props) => {
  const {
    title,
    message,
    open,
    onOk,
    onCancel,
    okLabel = "OK",
    cancelLabel = "Cancel",
  } = props;

  const actions = useMemo(() => {
    if (typeof onOk !== "function" && typeof onCancel !== "function")
      return undefined;
    const actions = {};
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
  }, [onOk, onCancel, okLabel, cancelLabel]);

  return (
    <SimpleDialog open={open} title={title} size={"sm"} actions={actions}>
      {message}
    </SimpleDialog>
  );
};
