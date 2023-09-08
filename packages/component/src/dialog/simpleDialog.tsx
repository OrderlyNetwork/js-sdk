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
  onOpenChange?(open: boolean): void;
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
          fullWidth
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
          fullWidth
          onClick={() => {
            setLoading(true);
            props.onOk?.().finally(() => setLoading(false));
          }}
        >
          Ok
        </Button>
      );
    }

    return (
      <DialogFooter
        className={buttons.length > 1 ? "grid-cols-2" : "grid-cols-1"}
      >
        {buttons}
      </DialogFooter>
    );
  }, [props.onCancel, props.onOk, loading]);

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent
        closable={props.closable}
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
        </DialogHeader>
        {props.children}
        {actions}
      </DialogContent>
    </Dialog>
  );
};
