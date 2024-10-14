import {
  Button,
  modal,
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
  cn,
} from "@orderly.network/ui";
import { usePositionsRowContext } from "./positionRowContext";
import { TPSLWidget } from "./tpsl/tpsl.widget";
import { useLocalStorage } from "@orderly.network/hooks";
import { PositionTPSLConfirm } from "./tpsl/tpsl.ui";
import { useState } from "react";

// ------------ TP/SL Price input end------------
export const TPSLButton = () => {
  const { position, baseDp, quoteDp } = usePositionsRowContext();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(true);

  const [needConfirm] = useLocalStorage("orderly_position_tp_sl_confirm", true);

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
          onClick={() => {
            setOpen(true);
          }}
        >
          TP/SL
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
                    dp={baseDp ?? 2}
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
