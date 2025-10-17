import { useMemo } from "react";
import {
  useAccountInfo,
  useReferralInfo,
  useLeverageBySymbol,
  useSymbolsInfo,
} from "@orderly.network/hooks";
import { account, positions } from "@orderly.network/perp";
import { modal } from "@orderly.network/ui";
import { SharePnLConfig } from "@orderly.network/ui-share";
import { formatNum } from "@orderly.network/utils";

export type ShareButtonScriptOptions = {
  position: any;
  sharePnLConfig?: SharePnLConfig;
  modalId: string;
  iconSize?: number;
  isPositionHistory?: boolean;
};

export type ShareButtonScriptReturn = ReturnType<typeof useShareButtonScript>;

export const useShareButtonScript = (props: ShareButtonScriptOptions) => {
  const { position, sharePnLConfig, iconSize } = props;
  const { getFirstRefCode } = useReferralInfo();
  const symbolsInfo = useSymbolsInfo();
  const { data: accountInfo } = useAccountInfo();

  const refCode = useMemo(() => {
    return getFirstRefCode()?.code;
  }, [getFirstRefCode]);

  const symbolLeverage = useLeverageBySymbol(position.symbol);

  const getHistoryEntity = () => {
    const netPnL = position.netPnL || 0;
    const openPrice = Math.abs(position.avg_open_price);
    const quantity = Math.abs(position.closed_position_qty);

    let roi;

    const symbolInfo = symbolsInfo[position.symbol];
    const baseIMR = symbolInfo("base_imr");
    const IMR_Factor = symbolInfo("imr_factor");

    // calculate unrealized pnl ROI for position history
    if (
      netPnL !== 0 &&
      quantity !== 0 &&
      openPrice !== 0 &&
      accountInfo?.max_leverage &&
      baseIMR &&
      // IMR_Factor is possible to be 0
      typeof IMR_Factor !== "undefined"
    ) {
      const notional = positions.notional(quantity, openPrice);

      const maxLeverage = position.leverage
        ? position.leverage
        : accountInfo.max_leverage;

      const imr = account.IMR({
        maxLeverage,
        baseIMR: baseIMR,
        IMR_Factor: IMR_Factor,
        positionNotional: notional,
        ordersNotional: 0,
        IMR_factor_power: 4 / 5,
      });

      const unrealizedPnLROI = positions.unrealizedPnLROI({
        positionQty: quantity,
        openPrice: openPrice,
        IMR: imr,
        unrealizedPnL: netPnL,
      });

      roi = formatNum.roi(unrealizedPnLROI * 100)?.toString();
    }

    return {
      side: position.side,
      pnl: netPnL,
      roi: roi,
      openPrice: openPrice,
      closePrice: Math.abs(position.avg_close_price),
      openTime: position.open_timestamp,
      closeTime: position.close_timestamp,
      quantity: position.closed_position_qty,
    };
  };

  const showModal = () => {
    const entity = props.isPositionHistory
      ? getHistoryEntity()
      : {
          side: position.position_qty > 0 ? "LONG" : "SHORT",
          pnl:
            formatNum.pnl(position.unrealized_pnl)?.toNumber() ??
            position.unrealized_pnl,
          roi:
            formatNum.roi(position.unrealized_pnl_ROI)?.toNumber() ??
            position.unrealized_pnl_ROI,
          openPrice: Math.abs(position.average_open_price),
          markPrice: position.mark_price,
          openTime: position.timestamp,
          quantity: position.position_qty,
        };

    modal.show(props.modalId, {
      pnl: {
        entity: {
          symbol: position.symbol,
          // when position.leverage is empty, use leverage from useSymbolLeverage
          leverage: position.leverage || symbolLeverage,
          ...entity,
        },
        refCode,
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
