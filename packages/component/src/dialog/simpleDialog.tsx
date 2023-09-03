import type { FC, PropsWithChildren, ReactNode } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogDescription,
  Dialog,
  DialogTitle,
  DialogFooter,
} from "@/dialog/dialog";
import { useMemo, useState } from "react";
import Button from "@/button";

export interface BaseDialogProps {
  open: boolean;
  title: ReactNode;
  closable?: boolean;
  onOk?: () => Promise<any>;
  onCancel?: () => void;
  footer?: ReactNode;
}

export const SimpleDialog: FC<PropsWithChildren<BaseDialogProps>> = (props) => {
  const [loading, setLoading] = useState(false);
  const actions = useMemo(() => {
    if (!props.onCancel && !props.onOk) {
      return null;
    }

    const buttons = [];

    if (typeof props.onCancel === "function") {
      buttons.push(
        <Button
          key="cancel"
          type="button"
          onClick={props.onCancel}
          color={"danger"}
          disabled={loading}
        >
          Cancel
        </Button>
      );
    }

    if (typeof props.onOk === "function") {
      buttons.push(
        <Button
          key="ok"
          type="button"
          disabled={loading}
          loading={loading}
          onClick={() => {
            setLoading(true);
            props.onOk?.().finally(() => setLoading(false));
          }}
        >
          Ok
        </Button>
      );
    }

    return <DialogFooter>{buttons}</DialogFooter>;
  }, [props.onCancel, props.onOk, loading]);

  return (
    <Dialog open={props.open}>
      <DialogContent closable={props.closable}>
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
        </DialogHeader>
        {props.children}
        {actions}
      </DialogContent>
    </Dialog>
  );
};
