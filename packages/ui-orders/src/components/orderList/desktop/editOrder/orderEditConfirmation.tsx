import type { MouseEvent, ReactNode } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Button, CloseIcon, ThrottledButton } from "@orderly.network/ui";

export type OrderEditConfirmationProps = {
  children: ReactNode;
  cancelPopover: () => void;
  isSubmitting: boolean;
  onConfirm: (event: MouseEvent<HTMLButtonElement>) => void;
};

/** Shared confirmation layout for inline order editors. */
export const OrderEditConfirmation = ({
  children,
  cancelPopover,
  isSubmitting,
  onConfirm,
}: OrderEditConfirmationProps) => {
  const { t } = useTranslation();
  return (
    <div className="oui-relative oui-pt-5">
      <div className="desktop:oui-text-sm oui-text-2xs oui-text-base-contrast-54">
        {children}
      </div>
      <div className="oui-mt-5 oui-grid oui-grid-cols-2 oui-gap-2">
        <Button
          color="secondary"
          size="md"
          onClick={cancelPopover}
          disabled={isSubmitting}
        >
          {t("common.cancel")}
        </Button>
        <ThrottledButton size="md" loading={isSubmitting} onClick={onConfirm}>
          {t("common.confirm")}
        </ThrottledButton>
      </div>
      <button
        type="button"
        className="oui-absolute oui-end-0 oui-top-0 oui-text-base-contrast-54"
        onClick={cancelPopover}
        disabled={isSubmitting}
      >
        <CloseIcon size={16} color="white" opacity={1} />
      </button>
    </div>
  );
};
