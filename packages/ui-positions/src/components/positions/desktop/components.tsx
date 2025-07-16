import React from "react";
import { ComputedAlgoOrder, useLocalStorage } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { PositionType } from "@orderly.network/types";
import { cn, EditIcon, Text, toast, useScreen } from "@orderly.network/ui";
import { modal } from "@orderly.network/ui";
import {
  PositionTPSLConfirm,
  PositionTPSLPopover,
  TPSLDetailDialogId,
  TPSLDialogId,
  TPSLSheetId,
  TPSLDetailSheetId,
} from "@orderly.network/ui-tpsl";
import { usePositionsRowContext } from "./positionRowContext";

// ------------ TP/SL Price input end------------
export const TPSLButton = () => {
  const { position, baseDp, quoteDp, tpslOrder } = usePositionsRowContext();
  const { t } = useTranslation();
  return (
    <PositionTPSLPopover
      position={position}
      order={tpslOrder}
      label={t("common.tpsl")}
      baseDP={baseDp}
      quoteDP={quoteDp}
      isEditing={false}
    />
  );
};

export const TPSLEditIcon = () => {
  const { position, baseDp, quoteDp, tpslOrder } = usePositionsRowContext();
  const { isMobile } = useScreen();

  const onEdit = () => {
    const dialogId = isMobile ? TPSLDetailSheetId : TPSLDetailDialogId;
    modal.show(dialogId, {
      order: tpslOrder,
      position: position,
      baseDP: baseDp,
      quoteDP: quoteDp,
    });
  };

  return (
    // <PositionTPSLPopover
    //   position={position}
    //   order={tpslOrder}
    //   baseDP={baseDp}
    //   quoteDP={quoteDp}
    //   isEditing
    // >
    <EditIcon
      onClick={onEdit}
      opacity={1}
      className="oui-cursor-pointer oui-text-base-contrast-54"
      size={16}
    />
    // </PositionTPSLPopover>
  );
};

export const AddIcon = (props: { positionType: PositionType }) => {
  const { position, baseDp, quoteDp, tpslOrder } = usePositionsRowContext();
  const [needConfirm] = useLocalStorage("orderly_order_confirm", true);
  const { t } = useTranslation();
  const { isMobile } = useScreen();
  const onAdd = () => {
    const dialogId = isMobile ? TPSLSheetId : TPSLDialogId;
    const modalParams = {
      position,
      baseDP: baseDp,
      quoteDP: quoteDp,
      isEditing: false,
      positionType: props.positionType,
      onConfirm: (order: ComputedAlgoOrder, options: any) => {
        if (!needConfirm) {
          return Promise.resolve(true);
        }

        const maxQty = Math.abs(Number(position.position_qty));
        if (
          `${order.tp_trigger_price ?? ""}`.length === 0 &&
          `${order.sl_trigger_price ?? ""}`.length === 0
        ) {
          return modal
            .confirm({
              title: t("orders.cancelOrder"),
              content: t("tpsl.cancelOrder.description"),
              onOk: () => {
                return options.cancel();
              },
            })
            .then(
              () => {
                return true;
              },
              () => {
                return Promise.reject(false);
              },
            );
        }

        return modal
          .confirm({
            title: t("tpsl.confirmOrder"),
            // bodyClassName: "lg:oui-py-0",
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
            classNames: {
              body: "!oui-pb-0",
            },
            content: (
              <PositionTPSLConfirm
                isPositionTPSL={true}
                isEditing={false}
                symbol={order.symbol!}
                qty={Number(order.quantity)}
                maxQty={maxQty}
                tpPrice={Number(order.tp_trigger_price)}
                slPrice={Number(order.sl_trigger_price)}
                side={order.side!}
                orderInfo={order}
                quoteDP={quoteDp ?? 2}
                baseDP={baseDp ?? 2}
              />
            ),
          })
          .then(
            () => {
              return true;
            },
            () => {
              return Promise.reject(false);
            },
          );
      },
    };
    modal.show(dialogId, modalParams);
  };
  return (
    <Text
      className={cn(
        "oui-text-base-contrast-36 hover:oui-text-base-contrast oui-cursor-pointer",
        isMobile && "oui-text-base-contrast-80",
      )}
      onClick={onAdd}
    >
      Add
    </Text>
  );
};
