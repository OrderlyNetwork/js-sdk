import { FC } from "react";
import { modal, ShareIcon } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { ShareButtonState } from "./shareButton.script";

export const ShareButton: FC<ShareButtonState> = (props) => {
  if (props.sharePnLConfig == null) return <></>;

  const { position } = props;

  const showModal = () => {
    const entity = props.isPositionHistory
      ? {
          side: position.side,
          pnl: position.netPnL,
          openPrice: position.avg_open_price,
          closePrice: position.avg_close_price,
          openTime: position.open_timestamp,
          closeTime: position.close_timestamp,
          quantity: position.closed_position_qty,
        }
      : {
          side: position.position_qty > 0 ? "LONG" : "SHORT",
          pnl: position.unrealized_pnl,
          roi: new Decimal(position.unrealized_pnl_ROI * 100).toFixed(
            2,
            Decimal.ROUND_DOWN
          ),
          openPrice: position.average_open_price,
          markPrice: position.mark_price,
          openTime: position.timestamp,
          quantity: position.position_qty,
        };

    modal.show(props.modalId, {
      pnl: {
        entity: {
          symbol: position.symbol,
          ...entity,
        },
        refCode: props.refCode,
        ...props.sharePnLConfig,
        leverage: props.isPositionHistory ? undefined : props.leverage,
      },
    });
  };
  return (
    <button
      type="button"
      onClick={(e: any) => {
        e.stopPropagation();
        showModal();
      }}
    >
      <ShareIcon color="white" opacity={0.54} size={props.iconSize ?? 16} />
    </button>
  );
};
