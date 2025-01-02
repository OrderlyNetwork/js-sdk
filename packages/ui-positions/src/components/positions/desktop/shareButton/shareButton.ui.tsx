import { FC } from "react";
import { modal, ShareIcon } from "@orderly.network/ui";
import { ShareButtonState } from "./shareButton.script";
import { Decimal } from "@orderly.network/utils";

export const ShareButton: FC<ShareButtonState> = (props) => {
  if (props.sharePnLConfig == null) return <></>;

  const { position } = props;
  return (
    <button
      type="button"
      onClick={(e: any) => {
        e.stopPropagation();
        modal.show(props.modalId, {
          pnl: {
            entity: {
              symbol: position.symbol,
              pnl: position.unrealized_pnl,
              roi: new Decimal(position.unrealized_pnl_ROI * 100).toFixed(
                2,
                Decimal.ROUND_DOWN
              ),
              side: position.position_qty > 0 ? "LONG" : "SHORT",
              openPrice: position.average_open_price,
              openTime: position.timestamp,
              markPrice: position.mark_price,
              quantity: position.position_qty,
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
