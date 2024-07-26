import { FC, useMemo, useState } from "react";
import { DialogFooter } from "./dialog";
import { Button, ButtonProps } from "../button";

export type DialogAction<T = any> = {
  label: string;
  onClick: () => Promise<T> | T;
} & Pick<ButtonProps, "size" | "disabled" | "className">;

export type SimpleDialogFooterProps = {
  actions?: {
    primary?: DialogAction;
    secondary?: DialogAction;
  };
  className?: string;
};

export const SimpleDialogFooter: FC<SimpleDialogFooterProps> = (props) => {
  const { actions } = props;
  const [primaryLoading, setPrimaryLoading] = useState(false);

  if (!actions) return null;

  const buttons = useMemo(() => {
    const buttons = [];

    if (actions.secondary && typeof actions.secondary.onClick === "function") {
      buttons.push(
        <Button
          key="secondary"
          color="gray"
          onClick={() => {
            actions.secondary?.onClick?.();
          }}
          className={actions.secondary.className}
          disabled={actions.secondary.disabled}
          size={actions.secondary.size}
        >
          {actions.secondary.label}
        </Button>
      );
    }

    if (actions.primary && typeof actions.primary.onClick === "function") {
      buttons.push(
        <Button
          key="primary"
          onClick={async () => {
            try {
              setPrimaryLoading(true);
              await actions.primary?.onClick();
            } catch (e) {
            } finally {
              setPrimaryLoading(false);
            }
          }}
          className={actions.primary.className}
          disabled={actions.primary.disabled || primaryLoading}
          loading={primaryLoading}
          size={actions.primary.size}
        >
          {actions.primary.label}
        </Button>
      );
    }

    return buttons;
  }, [actions, primaryLoading]);

  return <DialogFooter className={props.className}>{buttons}</DialogFooter>;
};
