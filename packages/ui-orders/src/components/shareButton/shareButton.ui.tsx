import { FC } from "react";
import { modal, ShareIcon } from "@orderly.network/ui";
import { ShareButtonState } from "./shareButton.script";

export const ShareButton: FC<ShareButtonState> = (props) => {
  if (props.sharePnLConfig == null) return <></>;
  return (
    <button
      type="button"
      onClick={(e: any) => {
        e.stopPropagation();
        modal.show(props.modalId, {
          pnl: {
            entity: {
              symbol: props.order.symbol,
              pnl: props.order.realized_pnl,
              side: props.order.side == "BUY" ? "LONG" : "SHORT",
              openPrice: props.order.average_executed_price,
              openTime: props.order.updated_time,
              quantity: props.order.quantity,
            },
            refCode: props.refCode,
            leverage: props.leverage,
            ...props.sharePnLConfig,
          },
        });
      }}
    >
      <ShareIcon color="white" opacity={0.54} size={props.iconSize ?? 16} />
    </button>
  );
};
