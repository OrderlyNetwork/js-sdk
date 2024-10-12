import { FC, ReactNode, useCallback, useState } from "react";
import { modalActions } from "../modalContext";

import { create } from "../modalHelper";
import { useModal } from "../useModal";
import { AlertDialog, AlertDialogProps } from "../../dialog/alertDialog";

export const CreatedAlertDialog = create<AlertDialogProps>((props) => {
  const { onOk, onCancel, actions, ...rest } = props;
  const { visible, hide, resolve, reject, onOpenChange } = useModal();
  const [loading, setLoading] = useState(false);

  const onOkHandler = useCallback(async (): Promise<any> => {
    try {
      setLoading(true);
      await onOk?.();
      hide();
    } catch (err) {

    } finally {
      setLoading(false);
    }
  }, [onOk]);

  const onCancelHandler = useCallback(() => {
    onCancel?.();
    hide();
  }, [onCancel]);

  return (
    <AlertDialog
      open={visible}
      onOpenChange={onOpenChange}
      onOk={onOkHandler}
      onCancel={onCancelHandler}
      actions={{...{primary: {loading}, ...actions }}}
      {...rest}
    />
  );
});

export const alert = (props: AlertDialogProps) => {
  return modalActions.show(CreatedAlertDialog, props);
};
