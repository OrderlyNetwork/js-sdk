import { useMemo, useRef, useState } from "react";
import Button from "@/button";
import { usePositionsRowContext } from "./positionRowContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/popover";
import { LimitConfirm } from "../sections/limitConfirm";
import { OrderType } from "@orderly.network/types";
import { useSymbolContext } from "@/provider/symbolProvider";
import { CloseBaseConfirm } from "./marketConfirmDialog";
import { cn } from "@/utils/css";
import { LimitConfirmDialog } from "./limitConfirmDialog";
import { toast } from "@/toast";
import { useDebouncedCallback } from "@orderly.network/hooks";

export const CloseButton = () => {
  const [open, setOpen] = useState(false);
  // const submittingRef = useRef<boolean>(false);

  const {
    onSubmit,
    price,
    quantity,
    closeOrderData,
    type,
    submitting,
  } = usePositionsRowContext();

  const { base, quote } = useSymbolContext();

  const onConfirm = useDebouncedCallback(
    () => {
      return onSubmit()
        .then(
          (res) => {
            setOpen(false);
          },
          (error: any) => {
            if (typeof error === "string") {
              toast.error(error);
            } else {
              toast.error(error.message);
            }
          }
        );
    },
    500,
    { leading: true, trailing: false }
  );

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
          disabled={disabled}
          className={cn(
            "orderly-border orderly-border-base-contrast-36 orderly-text-base-contrast-54 orderly-rounded orderly-w-full orderly-h-[28px] hover:orderly-bg-base-contrast/10 disabled:orderly-opacity-50 disabled:orderly-cursor-not-allowed",
            {
              "orderly-text-base-contrast-80 orderly-border-base-contrast-80":
                open,
            }
          )}
        >
          Close
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" side="top" className="orderly-w-[340px]">
        {type === OrderType.MARKET ? (
          <CloseBaseConfirm
            base={base}
            quantity={quantity}
            onClose={onClose}
            onConfirm={onConfirm}
            submitting={submitting}
          />
        ) : (
          <LimitConfirmDialog
            order={closeOrderData}
            base={base}
            quote={quote}
            quantity={quantity}
            onClose={onClose}
            onConfirm={onConfirm}
            submitting={submitting}
          />
        )}
      </PopoverContent>
    </Popover>
  );
};
