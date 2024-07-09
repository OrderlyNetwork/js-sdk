import { FC, useMemo } from "react";
import { DialogFooter } from "./dialog";
import { Button } from "../button";

export type DialogAction<T = any> = {
  label: string;
  onClick: () => Promise<T> | T;
};

export type SimpleDialogFooterProps = {
  actions?: {
    primary?: DialogAction;
    secondary?: DialogAction;
  };
};

export const SimpleDialogFooter: FC<SimpleDialogFooterProps> = (props) => {
  const { actions } = props;

  if (!actions) return null;

  const buttons = useMemo(() => {
    const buttons = [];

    if (actions.secondary && typeof actions.secondary.onClick === "function") {
      buttons.push(
        <Button
          key="secondary"
          color="gray"
          onClick={() => {
            actions.secondary?.onClick();
          }}
        >
          {actions.secondary.label}
        </Button>
      );
    }

    if (actions.primary && typeof actions.primary.onClick === "function") {
      buttons.push(
        <Button
          key="primary"
          onClick={() => {
            actions.primary?.onClick();
          }}
        >
          {actions.primary.label}
        </Button>
      );
    }

    return buttons;
  }, [actions]);

  return <DialogFooter>{buttons}</DialogFooter>;
};
