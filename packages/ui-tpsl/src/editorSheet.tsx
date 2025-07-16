import { useMemo } from "react";
import { useLocalStorage, useMarkPrice } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { AlgoOrderRootType, API, PositionType } from "@orderly.network/types";
import {
  Flex,
  modal,
  useModal,
  Text,
  Box,
  Badge,
  Divider,
  toast,
} from "@orderly.network/ui";
import { PositionTPSLConfirm } from "./tpsl.ui";
import { TPSLWidget, TPSLWidgetProps } from "./tpsl.widget";

type TPSLSheetProps = {
  position: API.Position;
  order?: API.AlgoOrder;
  // label: string;
  // baseDP?: number;
  // quoteDP?: number;
  symbolInfo: API.SymbolExt;
  isEditing?: boolean;
};

export const PositionTPSLSheet = (props: TPSLWidgetProps & TPSLSheetProps) => {
  const { position, order, symbolInfo, isEditing } = props;
  const { resolve, hide, updateArgs } = useModal();

  const [needConfirm] = useLocalStorage("orderly_order_confirm", true);
  const { t } = useTranslation();

  const isPositionTPSL = isEditing
    ? order?.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL
    : undefined;

  const updateSheetTitle = (title: string) => {
    if (isEditing) return;
    updateArgs({ title });
  };

  const onCompleted = () => {
    resolve();
    hide();
  };

  const { quote_dp, base_dp } = symbolInfo;

  return (
    <>
      <TPSLWidget
        {...props}
        positionType={
          props.positionType ??
          (isPositionTPSL ? PositionType.FULL : PositionType.PARTIAL)
        }
        onComplete={onCompleted}
        onConfirm={(order, options) => {
          if (!needConfirm) {
            return Promise.resolve(true);
          }

          const maxQty = Math.abs(Number(position.position_qty));

          const finalIsEditing =
            isEditing ||
            (!!order &&
              order.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL &&
              order.quantity === maxQty);

          return modal
            .confirm({
              title: finalIsEditing
                ? t("orders.editOrder")
                : t("tpsl.confirmOrder"),
              bodyClassName: "oui-pb-0 lg:oui-pb-0",
              onOk: async () => {
                try {
                  const res = await options.submit({
                    accountId: position.account_id,
                  });

                  if (res.success) {
                    return res;
                  }

                  if (res.message) {
                    toast.error(res.message);
                  }

                  return false;
                } catch (err: any) {
                  if (err?.message) {
                    toast.error(err.message);
                  }
                  return false;
                }
              },
              content: (
                <PositionTPSLConfirm
                  isPositionTPSL={isPositionTPSL}
                  isEditing={isEditing}
                  symbol={order.symbol!}
                  qty={Number(order.quantity)}
                  maxQty={maxQty}
                  tpPrice={Number(order.tp_trigger_price)}
                  slPrice={Number(order.sl_trigger_price)}
                  side={order.side!}
                  quoteDP={quote_dp ?? 2}
                  baseDP={base_dp ?? 2}
                  orderInfo={order}
                />
              ),
            })
            .then(
              () => {
                // setOpen(false);
                // setVisible(true);
                return true;
              },
              (reject) => {
                if (reject?.message) {
                  toast.error(reject.message);
                }

                // setVisible(true);
                return Promise.reject(false);
              },
            );
        }}
        onCancel={() => {
          hide();
        }}
      />
    </>
  );
};
