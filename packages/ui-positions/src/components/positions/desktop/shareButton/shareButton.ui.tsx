import { FC } from "react";
import { useSymbolsInfo, useAccountInfo } from "@orderly.network/hooks";
import { positions, account } from "@orderly.network/perp";
import { modal, ShareIcon } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { ShareButtonState } from "./shareButton.script";

export const ShareButton: FC<ShareButtonState> = (props) => {
  if (props.sharePnLConfig == null) return <></>;

  const { position } = props;
  const symbolsInfo = useSymbolsInfo();
  const { data: accountInfo } = useAccountInfo();

  const showModal = () => {
    const entity = props.isPositionHistory
      ? (() => {
          // Calculate ROI for position history
          const netPnL = position.netPnL || 0;
          const openPrice = Math.abs(position.avg_open_price);
          const quantity = Math.abs(position.closed_position_qty);

          let roi = undefined;

          if (
            netPnL !== 0 &&
            quantity !== 0 &&
            openPrice !== 0 &&
            accountInfo &&
            typeof props.leverage === "number"
          ) {
            // Calculate IMR for ROI calculation
            const symbolInfo = symbolsInfo[position.symbol];
            const baseIMR = symbolInfo("base_imr");
            const IMR_Factor = accountInfo.imr_factor[position.symbol] || 1;

            if (baseIMR) {
              const notional = positions.notional(quantity, openPrice);
              const imr = account.IMR({
                maxLeverage: accountInfo.max_leverage,
                baseIMR: baseIMR,
                IMR_Factor: IMR_Factor,
                positionNotional: notional,
                ordersNotional: 0,
                IMR_factor_power: 4 / 5,
              });

              const roiValue = positions.unrealizedPnLROI({
                positionQty: quantity,
                openPrice: openPrice,
                IMR: imr,
                unrealizedPnL: netPnL,
              });

              roi = new Decimal(roiValue * 100).toFixed(2, Decimal.ROUND_DOWN);
            }
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
        })()
      : {
          side: position.position_qty > 0 ? "LONG" : "SHORT",
          pnl: position.unrealized_pnl,
          roi: new Decimal(position.unrealized_pnl_ROI * 100).toFixed(
            2,
            Decimal.ROUND_DOWN,
          ),
          openPrice: Math.abs(position.average_open_price),
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
