import { FC } from "react";
import { Button, CloseIcon, ThrottledButton } from "@orderly.network/ui";
import { commify } from "@orderly.network/utils";
import { useTranslation, Trans } from "@orderly.network/i18n";

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
  const { t } = useTranslation();

  const renderLabel = () => {
    const common = {
      values: { base, value: commify(value) },
      components: [<span className="oui-text-warning-darken" />],
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
    }
  };

  return (
    <div className="oui-pt-5 oui-relative">
      <div className="oui-text-base-contrast-54 oui-text-2xs desktop:oui-text-sm">
        {renderLabel()}
      </div>
      <div className="oui-grid oui-grid-cols-2 oui-gap-2 oui-mt-5">
        <Button
          color="secondary"
          size={"md"}
          onClick={cancelPopover}
          disabled={isSubmitting}
        >
          {t("common.cancel")}
        </Button>
        <ThrottledButton size={"md"} loading={isSubmitting} onClick={onConfirm}>
          {t("common.confirm")}
        </ThrottledButton>
      </div>
      <button
        className="oui-absolute oui-right-0 oui-top-0 oui-text-base-contrast-54"
        onClick={cancelPopover}
      >
        <CloseIcon size={16} color="white" opacity={1} />
      </button>
    </div>
  );
};
