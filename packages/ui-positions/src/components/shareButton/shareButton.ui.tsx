import { FC } from "react";
import { Flex, modal, Text, ShareIcon } from "@orderly.network/ui";
import { SharePnLDialogId } from "@orderly.network/ui-share";
import { ShareButtonState } from "./shareButton.script";
import React from "react";

export const ShareButton: FC<ShareButtonState> = (props) => {
  return (
    <button
      type="button"
      onClick={(e: any) => {
        e.stopPropagation();
        modal.show(SharePnLDialogId, {
          pnl: {
            position: props.position,
            refCode: props.refCode,
            leverage: props.leverage,
            ...props.sharePnLConfig

          },
        });
      }}
    >
      <ShareIcon color="white" size={16} />
    </button>
  );
};
