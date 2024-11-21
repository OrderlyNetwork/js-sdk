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
            position: props.position,
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
