import { memo, type MouseEvent } from "react";
import { Trans } from "@orderly.network/i18n";
import { commify } from "@orderly.network/utils";
import { EditType } from "../../../../type";
import { OrderEditConfirmation } from "./orderEditConfirmation";

type ConfirmContentProps = {
  type: EditType;
  base: string;
  value: string;
  cancelPopover: () => void;
  isSubmitting: boolean;
  onConfirm: (event: MouseEvent<HTMLButtonElement>) => void;
};

export const ConfirmContent = memo((props: ConfirmContentProps) => {
  const { type, base, value, cancelPopover, isSubmitting, onConfirm } = props;

  const renderLabel = () => {
    const common = {
      values: { base, value: commify(value) },
      components: [<span key="0" className="oui-text-warning-darken" />],
    };

    switch (type) {
      case EditType.quantity:
        return (
          // @ts-ignore
          <Trans i18nKey="order.edit.confirm.quantity" {...common} />
        );
      case EditType.price:
        return (
          // @ts-ignore
          <Trans i18nKey="order.edit.confirm.price" {...common} />
        );
      case EditType.triggerPrice:
        return (
          // @ts-ignore
          <Trans i18nKey="order.edit.confirm.triggerPrice" {...common} />
        );
      case EditType.callbackValue:
        return (
          // @ts-ignore
          <Trans i18nKey="order.edit.confirm.callbackValue" {...common} />
        );
      case EditType.callbackRate:
        return (
          // @ts-ignore
          <Trans i18nKey="order.edit.confirm.callbackRate" {...common} />
        );
    }
  };

  return (
    <OrderEditConfirmation
      cancelPopover={cancelPopover}
      isSubmitting={isSubmitting}
      onConfirm={onConfirm}
    >
      {renderLabel()}
    </OrderEditConfirmation>
  );
});

ConfirmContent.displayName = "ConfirmContent";
