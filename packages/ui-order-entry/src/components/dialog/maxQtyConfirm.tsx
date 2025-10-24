import { FC, memo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { SimpleDialog } from "@orderly.network/ui";

type MaxQtyConfirmProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maxQty: string;
  onConfirm: () => void;
  base: string;
};

export const MaxQtyConfirm: FC<MaxQtyConfirmProps> = memo((props) => {
  const { t } = useTranslation();
  return (
    <SimpleDialog
      open={props.open}
      title={t("orderEntry.orderConfirm")}
      closable
      onOpenChange={props.onOpenChange}
      size="sm"
      actions={{
        primary: {
          label: t("orderEntry.placeOrderNow"),
          className: "oui-text-sm oui-font-semibold oui-w-[100%] oui-h-8",
          onClick: () => {
            props.onConfirm();
            return Promise.resolve();
          },
        },
        secondary: {
          label: t("common.cancel"),
          className: "oui-text-sm oui-font-semibold oui-w-[100%] oui-h-8",
          onClick: () => {
            props.onOpenChange(false);
            return Promise.resolve();
          },
        },
      }}
    >
      <div className="oui-text-2xs lg:oui-text-sm">
        {t("orderEntry.maxQty.reminder.content", {
          maxQty: `${props.maxQty} ${props.base}`,
        })}
      </div>
    </SimpleDialog>
  );
});
