import { FC } from "react";
import { Button, SimpleDialog } from "@orderly.network/ui";
import { MarketCloseBtnState } from "./marketCloseBtn.script";
import { MarketCloseConfirm } from "../../desktop/closeButton";
import { OrderType } from "@orderly.network/types";
import { useTranslation } from "@orderly.network/i18n";

export const MarketCloseBtn: FC<MarketCloseBtnState> = (props) => {
  const { t } = useTranslation();
  return (
    <>
      <Button
        variant="outlined"
        color="secondary"
        size="sm"
        className="oui-border-base-contrast-36"
        disabled={props.submitting}
        loading={props.submitting}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();

          props.updateOrderType(OrderType.MARKET);

          if (!props.orderConfirm) {
            props.onConfirm();
            return;
          }
          props.setDialogOpen(true);
        }}
      >
        {t("positions.marketClose")}
      </Button>
      <SimpleDialog
        open={props.dialogOpen}
        onOpenChange={props.setDialogOpen}
        size="xs"
      >
        <MarketCloseConfirm
          base={props.base}
          quantity={props.quantity}
          onClose={props.onClose}
          onConfirm={props.onConfirm}
          submitting={props.submitting}
          hideCloseIcon
        />
      </SimpleDialog>
    </>
  );
};
