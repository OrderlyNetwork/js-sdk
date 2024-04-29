import { useMemo, useState } from "react";
import { usePositionsRowContext } from "./positionRowContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/popover";
import { API, OrderType } from "@orderly.network/types";
import { useSymbolContext } from "@/provider/symbolProvider";
import { cn } from "@/utils/css";
import { toast } from "@/toast";
import { TPSLEditor } from "@/block/tp_sl/tp_sl_editor";

export const TPSLButton = () => {
  const [open, setOpen] = useState(false);

  const {
    onSubmit,
    price,
    quantity,
    closeOrderData,
    type,
    submitting,
    position,
    tpslOrder,
  } = usePositionsRowContext();



  const { base, quote, symbol, quote_dp: priceDp } = useSymbolContext();

  const onConfirm = () => {
    return onSubmit().then(
      (res) => {
        setOpen(false);
      },
      (error: Error) => {
        toast.error(error.message);
      }
    );
  };

  const onClose = () => {
    setOpen(false);
  };

  const disabled = useMemo(() => {
    if (type === OrderType.MARKET) {
      if (!quantity) {
        return true;
      }
      return false;
    }

    return !price || !quantity;
  }, [price, quantity, type]);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <button
          // disabled={disabled}
          className={cn(
            "orderly-border orderly-border-base-contrast-36 orderly-text-base-contrast-54 orderly-rounded orderly-w-full orderly-h-[28px] hover:orderly-bg-base-contrast/10 disabled:orderly-opacity-50 disabled:orderly-cursor-not-allowed",
            {
              "orderly-text-base-contrast-80 orderly-border-base-contrast-80":
                open,
            }
          )}
        >
          TP/SL
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="top"
        className="orderly-w-[375px] orderly-ui-tp_sl-poper"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        <TPSLEditor
          maxQty={Number(quantity)}
          symbol={symbol}
          onCancel={onClose}
          position={position as API.PositionTPSLExt}
          onSuccess={onClose}
          order={tpslOrder}
          quoteDp={priceDp}
        />
      </PopoverContent>
    </Popover>
  );
};
