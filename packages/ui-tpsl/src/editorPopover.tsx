import { useLocalStorage } from "@orderly.network/hooks";
import {
  Button,
  cn,
  modal,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from "@orderly.network/ui";
import { ReactNode, useState } from "react";
import { TPSLWidget } from "./tpsl.widget";
import { PositionTPSLConfirm } from "./tpsl.ui";
import { AlgoOrderRootType, API } from "@orderly.network/types";
import { ButtonProps } from "@orderly.network/ui";

export const PositionTPSLPopover = (props: {
  position: API.Position;
  order?: API.AlgoOrder;
  label?: string;
  baseDP?: number;
  quoteDP?: number;
  /**
   * Button props
   */
  buttonProps?: ButtonProps;
  isEditing?: boolean;
  children?: ReactNode;
}) => {
  const { position, order, baseDP, quoteDP, buttonProps, isEditing } = props;
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(true);

  const [needConfirm] = useLocalStorage("orderly_order_confirm", true);

  const isPositionTPSL = isEditing
    ? order?.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL
    : undefined;

  return (
    <PopoverRoot
      onOpenChange={(isOpen) => {
        // console.log("isOpen", isOpen);
        if (visible) {
          setOpen(isOpen);
        }
      }}
      open={open}
    >
      <PopoverTrigger
        asChild
        onClick={() => {
          setOpen(true);
        }}
      >
        {props.children || (
          <Button
            variant="outlined"
            size="sm"
            color="secondary"
            {...buttonProps}
            // onClick={() => {
            //   setOpen(true);
            // }}
          >
            {props.label}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "oui-w-[360px]",
          visible ? "oui-visible" : "oui-invisible"
        )}
        align="end"
        side={"top"}
      >
        <TPSLWidget
          position={position}
          order={order}
          isEditing={isEditing}
          onComplete={() => {
            // console.log("tpsl order completed");
            setOpen(false);
          }}
          onCancel={() => {
            setOpen(false);
          }}
          onConfirm={(order, options) => {
            if (!needConfirm) {
              return Promise.resolve(true);
            }

            setVisible(false);

            const maxQty = Math.abs(Number(position.position_qty));

            // console.log(
            //   "order",
            //   order,
            //   isEditing ||
            //     (!!order &&
            //       order.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL &&
            //       order.quantity === maxQty)
            // );

            if (
              `${order.tp_trigger_price ?? ""}`.length === 0 &&
              `${order.sl_trigger_price ?? ""}`.length === 0
            ) {
              return modal
                .confirm({
                  title: "Cancel Order",
                  content: "Are you sure you want to cancel this TP/SL order?",
                  onOk: () => {
                    return options.cancel();
                  },
                })
                .then(
                  () => {
                    setOpen(false);
                    setVisible(true);
                    return true;
                  },
                  () => {
                    setVisible(true);
                    return Promise.reject(false);
                  }
                );
            }

            const finalIsEditing =
              isEditing ||
              (!!order &&
                order.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL &&
                order.quantity === maxQty);

            return modal
              .confirm({
                title: finalIsEditing ? "Edit Order" : "Confirm Order",
                // bodyClassName: "lg:oui-py-0",
                onOk: () => {
                  return options.submit();
                },
                classNames: {
                  body: "!oui-pb-0",
                },
                content: (
                  <PositionTPSLConfirm
                    isPositionTPSL={isPositionTPSL}
                    isEditing={finalIsEditing}
                    symbol={order.symbol!}
                    qty={Number(order.quantity)}
                    maxQty={maxQty}
                    tpPrice={Number(order.tp_trigger_price)}
                    slPrice={Number(order.sl_trigger_price)}
                    side={order.side!}
                    quoteDP={quoteDP ?? 2}
                    baseDP={baseDP ?? 2}
                  />
                ),
              })
              .then(
                () => {
                  setOpen(false);
                  setVisible(true);
                  return true;
                },
                () => {
                  setVisible(true);
                  return Promise.reject(false);
                }
              );
          }}
        />
      </PopoverContent>
    </PopoverRoot>
  );
};
