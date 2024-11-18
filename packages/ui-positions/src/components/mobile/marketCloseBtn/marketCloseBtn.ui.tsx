import { FC } from "react";
import { Button, Flex, SimpleDialog, Text } from "@orderly.network/ui";
import { MarketCloseBtnState } from "./marketCloseBtn.script";
import { MarketCloseConfirm } from "../../desktop/closeButton";
import { OrderType } from "@orderly.network/types";

export const MarketCloseBtn: FC<MarketCloseBtnState> = (props) => {
  return (
    <>
      <Button
        variant="outlined"
        color="secondary"
        size="sm"
        className="oui-border-base-contrast-36"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();

          props.updateOrderType(OrderType.MARKET);
          props.setDialogOpen(true);
        }}
      >
        Market Close
      </Button>
      <SimpleDialog open={props.dialogOpen} onOpenChange={props.setDialogOpen} size="xs">
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
