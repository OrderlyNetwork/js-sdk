import { FC } from "react";
import { modal, ShareIcon } from "@orderly.network/ui";
import { ShareButtonState } from "./shareButton.script";
import { useTranslation } from "@orderly.network/i18n";

export const ShareButton: FC<ShareButtonState> = (props) => {
  const { t } = useTranslation();

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
              side:
                props.order.side == "BUY"
                  ? t("share.pnl.share.long")
                  : t("share.pnl.share.short"),
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
