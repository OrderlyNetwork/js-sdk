import { useMemo, useState } from "react";
import Button from "@/button";
import { usePositionsRowContext } from "./positionRowContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/popover";
import { LimitConfirm } from "../sections/limitConfirm";
import { OrderType } from "@orderly.network/types";
import { useSymbolContext } from "@/provider/symbolProvider";
import { CloseBaseConfirm } from "./marketConfirmDialog";
import { cn } from "@/utils/css";
import { LimitConfirmDialog } from "./limitConfirmDialog";

export const CloseButton = () => {
  const [open, setOpen] = useState(false);

  const { onSubmit, price, quantity, closeOrderData, type } =
    usePositionsRowContext();

  const { base, quote } = useSymbolContext();

  const onConfirm = (data: any) => {
    return Promise.resolve();
  };

  const onClose = () => {
    setOpen(false);
  };

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "orderly-border orderly-border-base-contrast-36 orderly-text-base-contrast-54 orderly-rounded-md orderly-w-full orderly-h-[28px] hover:orderly-bg-base-contrast/10",
            {
              "orderly-text-base-contrast-80 orderly-border-base-contrast-80":
                open,
            }
          )}
        >
          Close
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" side="top" className="orderly-w-[364px]">
        <LimitConfirmDialog
          order={closeOrderData}
          base={base}
          quote={quote}
          quantity={quantity}
          onClose={onClose}
          onConfirm={function (): Promise<any> {
            throw new Error("Function not implemented.");
          }}
        />
        {/* <CloseBaseConfirm
          base={base}
          quantity={quantity}
          onClose={onClose}
          onConfirm={onConfirm}
        /> */}
      </PopoverContent>
    </Popover>
  );
};
