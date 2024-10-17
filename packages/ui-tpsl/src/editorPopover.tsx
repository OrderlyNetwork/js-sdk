import { useLocalStorage } from "@orderly.network/hooks";
import {
  Button,
  cn,
  modal,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from "@orderly.network/ui";
import { useState } from "react";
import { TPSLWidget } from "./tpsl.widget";
import { PositionTPSLConfirm } from "./tpsl.ui";
import { API } from "@orderly.network/types";
import { ButtonProps } from "@orderly.network/ui";

export const PositionTPSLPopover = (props: {
  position: API.Position;
  order?: API.AlgoOrder;
  label: string;
  baseDP?: number;
  quoteDP?: number;
  buttonProps?: ButtonProps;
}) => {
  const { position, order, baseDP, quoteDP, buttonProps } = props;
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(true);

  const [needConfirm] = useLocalStorage("orderly_position_tp_sl_confirm", true);

  console.log("PositionTPSLPopover", props);

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
      <PopoverTrigger asChild>
        <Button
          variant="outlined"
          size="sm"
          color="secondary"
          {...buttonProps}
          onClick={() => {
            setOpen(true);
          }}
        >
          {props.label}
        </Button>
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

            return modal
              .confirm({
                title: "Confirm Order",
                bodyClassName: "oui-p-0",
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
                    dp={baseDP ?? 2}
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
