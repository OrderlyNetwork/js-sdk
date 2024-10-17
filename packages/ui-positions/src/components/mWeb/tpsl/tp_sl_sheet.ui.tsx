import { TPSLSheetState } from "./tp_sl_sheet.script";
import { PositionInfo } from "./positionInfo";
import { TPSLWidget, TPSLWidgetProps } from "@orderly.network/ui-tpsl";
import { AlgoOrderRootType } from "@orderly.network/types";
import { cn, modal } from "@orderly.network/ui";
import { PositionTPSLConfirm } from "@orderly.network/ui-tpsl";

export const TPSLSheetUI = (props: TPSLWidgetProps & TPSLSheetState) => {
  const { position, symbolInfo, needConfirm, setVisible, onCompleted } = props;

  const { quote_dp, base_dp } = symbolInfo;

  return (
    <>
      <PositionInfo position={position} symbolInfo={symbolInfo} />

      <TPSLWidget
        {...props}
        onTPSLTypeChange={(type) => {
          props.updateSheetTitle(
            type === AlgoOrderRootType.TP_SL ? "TP/SL" : "Position TP/SL"
          );
        }}
        onComplete={onCompleted}
        onConfirm={(order, options) => {
          if (!needConfirm) {
            return Promise.resolve(true);
          }

          return modal
            .confirm({
              title: "Confirm Order",
              bodyClassName: "oui-pb-0 lg:oui-pb-0",
              onOk: () => {
                return options.submit();
              },
              content: (
                <PositionTPSLConfirm
                  symbol={order.symbol!}
                  qty={Number(order.quantity)}
                  maxQty={Number(position.position_qty)}
                  tpPrice={Number(order.tp_trigger_price)}
                  slPrice={Number(order.sl_trigger_price)}
                  side={order.side!}
                  quoteDP={quote_dp ?? 2}
                  baseDP={base_dp ?? 2}
                />
              ),
            })
            .then(
              () => {
                // setOpen(false);
                // setVisible(true);
                return true;
              },
              () => {
                // setVisible(true);
                return Promise.reject(false);
              }
            );
        }}
      />
    </>
  );
};
