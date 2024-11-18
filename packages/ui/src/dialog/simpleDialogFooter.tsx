import { FC, useEffect, useMemo, useState } from "react";
import { DialogFooter } from "./dialog";
import { Button, ButtonProps, ThrottledButton } from "../button";

export type DialogAction<T = any> = {
  label: string;
  onClick: (event: any) => Promise<T> | T;
} & Pick<
  ButtonProps,
  "size" | "disabled" | "className" | "fullWidth" | "data-testid" | "loading"
>;

export type SimpleDialogFooterProps = {
  actions?: {
    primary?: DialogAction;
    secondary?: DialogAction;
  };
  className?: string;
};

export const SimpleDialogFooter: FC<SimpleDialogFooterProps> = (props) => {
  const { actions } = props;
  const [primaryLoading, setPrimaryLoading] = useState(actions?.primary?.loading ?? false);

  useEffect(() => {
    if (actions?.primary?.loading) {
      setPrimaryLoading(actions?.primary?.loading);
    }

    return () => {
      setPrimaryLoading(false);
    }
  }, [actions?.primary?.loading]);

  if (!actions) return null;

  const buttons = useMemo(() => {
    const buttons = [];

    if (actions.secondary && typeof actions.secondary.onClick === "function") {
      buttons.push(
        <Button
          data-testid={actions.secondary?.["data-testid"]}
          key="secondary"
          color="gray"
          onClick={(event) => {
            actions.secondary?.onClick?.(event);
          }}
          className={actions.secondary.className}
          disabled={actions.secondary.disabled}
          size={actions.secondary.size}
          fullWidth={actions.secondary.fullWidth}
        >
          {actions.secondary.label}
        </Button>
      );
    }

    if (actions.primary && typeof actions.primary.onClick === "function") {
      
      buttons.push(
        <ThrottledButton
          data-testid={actions.primary?.["data-testid"]}
          key="primary"
          onClick={async (event) => {
            if (primaryLoading) return;
            try {
              setPrimaryLoading(true);
              await actions.primary?.onClick(event);
            } catch (e) {
            } finally {
              setPrimaryLoading(false);
            }
          }}
          className={actions.primary.className}
          disabled={actions.primary.disabled || primaryLoading}
          loading={primaryLoading}
          size={actions.primary.size}
          fullWidth
        >
          {actions.primary.label}
        </ThrottledButton>
      );
    }

    return buttons;
  }, [actions, primaryLoading]);

  return <DialogFooter className={props.className}>{buttons}</DialogFooter>;
};
