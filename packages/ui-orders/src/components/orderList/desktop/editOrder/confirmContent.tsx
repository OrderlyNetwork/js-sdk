import { Button, CloseIcon, ThrottledButton } from "@orderly.network/ui";
import { commify } from "@orderly.network/utils";
import { FC, useMemo } from "react";

export enum EditType {
  quantity,
  price,
  triggerPrice,
}

export const ConfirmContent: FC<{
  type: EditType;
  base: string;
  value: string;
  cancelPopover: () => void;
  isSubmitting: boolean;
  onConfirm: (e: any) => void;
}> = (props) => {
  const { type, base, value, cancelPopover, isSubmitting, onConfirm } = props;

  const label = useMemo(() => {
    switch (type) {
      case EditType.quantity:
        return `You agree changing the quantity of ${base}-PERP order to${" "}`;
      case EditType.price:
        return `You agree changing the price of ${base}-PERP order to${" "}`;
      case EditType.triggerPrice:
        return `You agree changing the trigger price of ${base}-PERP order to${" "}`;
    }
  }, [type]);

  return (
    <div className="oui-pt-5 oui-relative">
      <div className="oui-text-base-contrast-54 oui-text-2xs desktop:oui-text-sm">
        {label}
        <span className="oui-text-warning-darken">{commify(value)}</span>.
      </div>
      <div className="oui-grid oui-grid-cols-2 oui-gap-2 oui-mt-5">
        <Button
          color="secondary"
          size={"md"}
          onClick={cancelPopover}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <ThrottledButton size={"md"} loading={isSubmitting} onClick={onConfirm}>
          Confirm
        </ThrottledButton>
      </div>
      <button
        className="oui-absolute oui-right-0 oui-top-0 oui-text-base-contrast-54"
        onClick={cancelPopover}
      >
        <CloseIcon size={18} />
      </button>
    </div>
  );
};
