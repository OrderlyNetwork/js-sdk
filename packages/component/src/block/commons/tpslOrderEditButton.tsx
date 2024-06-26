import { toast } from "@/toast";
import { FC, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/popover";
import { cn } from "@/utils";
import { API, AlgoOrderRootType } from "@orderly.network/types";
import { TPSLEditor } from "@/block/tp_sl/tp_sl_editor";
import { Button } from "@/button/button";

export const TPSLOrderEditButton: FC<{
  // onSubmit: () => Promise<any>;
  order: API.AlgoOrderExt;
  label: string;
  maxQty: number;
  position: API.PositionTPSLExt;
  disabled?: boolean;
  isEditing?: boolean;
}> = (props) => {
  const { order, maxQty, position, disabled } = props;
  const [open, setOpen] = useState(false);

  // const { base, quote, symbol } = useSymbolContext();

  // const onConfirm = () => {
  //   return onSubmit().then(
  //     (res) => {
  //       setOpen(false);
  //     },
  //     (error: Error) => {
  //       toast.error(error.message);
  //     }
  //   );
  // };

  const onClose = () => {
    setOpen(false);
  };

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          id="orderly-tp_sl-order-edit-button"
          size="small"
          variant={"outlined"}
          color={"tertiary"}
          className={cn("orderly-flex-1", {
            "orderly-text-base-contrast-80 orderly-border-base-contrast-80":
              open,
          })}
        >
          {props.label}
        </Button>
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
          maxQty={Number(maxQty)}
          symbol={order.symbol}
          onCancel={onClose}
          onSuccess={onClose}
          order={order}
          position={position}
          canModifyQty={order.algo_type !== AlgoOrderRootType.POSITIONAL_TP_SL}
          isEditing={props.isEditing}
        />
      </PopoverContent>
    </Popover>
  );
};
