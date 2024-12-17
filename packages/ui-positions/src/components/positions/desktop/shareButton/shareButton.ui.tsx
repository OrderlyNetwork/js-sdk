import { FC } from "react";
import { Flex, modal, Text, ShareIcon } from "@orderly.network/ui";
import { SharePnLDialogId } from "@orderly.network/ui-share";
import { ShareButtonState } from "./shareButton.script";
import React from "react";

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
              symbol: props.position.symbol,
              pnl: props.position.unrealized_pnl,
              roi: props.position.unrealized_pnl_ROI,
              side: props.position.position_qty > 0 ? "LONG" : "SHORT",
              openPrice: props.position.average_open_price,
              openTime: props.position.timestamp,
              markPrice: props.position.mark_price,
              quantity: props.position.position_qty,
            },
            refCode: props.refCode,
            leverage: props.leverage,
            ...props.sharePnLConfig

          },
        });
      }}
    >
      <ShareIcon color="white" opacity={0.54} size={props.iconSize ?? 16} />
    </button>
  );
};
