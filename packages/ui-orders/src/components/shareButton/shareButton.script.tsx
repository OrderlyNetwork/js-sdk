import { useMemo } from "react";
import { useReferralInfo, useLeverageBySymbol } from "@veltodefi/hooks";
import { useTranslation } from "@veltodefi/i18n";
import { modal } from "@veltodefi/ui";
import { SharePnLConfig } from "@veltodefi/ui-share";

export type ShareButtonScriptReturn = ReturnType<typeof useShareButtonScript>;

export const useShareButtonScript = (props: {
  order: any;
  sharePnLConfig?: SharePnLConfig;
  modalId: string;
  iconSize?: number;
}) => {
  const { sharePnLConfig, order, iconSize } = props;
  const { t } = useTranslation();
  const { getFirstRefCode } = useReferralInfo();
  const refCode = useMemo(() => {
    return getFirstRefCode()?.code;
  }, [getFirstRefCode]);
  const leverage = useLeverageBySymbol(order.symbol);

  const showModal = () => {
    modal.show(props.modalId, {
      pnl: {
        entity: {
          symbol: order.symbol,
          pnl: order.realized_pnl,
          side:
            order.side == "BUY"
              ? t("share.pnl.share.long")
              : t("share.pnl.share.short"),
          openPrice: order.average_executed_price,
          openTime: order.updated_time,
          quantity: order.quantity,
        },
        refCode,
        leverage,
        ...sharePnLConfig,
      },
    });
  };

  return {
    iconSize,
    sharePnLConfig,
    showModal,
  };
};
