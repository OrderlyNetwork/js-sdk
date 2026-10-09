import { useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  Button,
  Input,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from "@orderly.network/ui";
import { binaryOrderDisplayPrice } from "../../binary/binaryOrderDisplay";
import { TableNumber } from "../../cells";
import type {
  PredictionAccountActions,
  PredictionOpenOrder,
} from "../../prediction.types";

export const PendingValue = ({
  state,
  order,
  field,
}: {
  state: PredictionAccountActions & { isRegionRestricted: boolean };
  order: PredictionOpenOrder;
  field: "price" | "quantity";
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const displayValue =
    field === "price"
      ? binaryOrderDisplayPrice(order, order.price)
      : order.quantity;
  const [value, setValue] = useState(String(displayValue));
  return (
    <PopoverRoot
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setValue(String(displayValue));
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="text"
          color="secondary"
          size="xs"
          disabled={
            !state.isOrderTradable(order.symbol) || state.isRegionRestricted
          }
        >
          {field === "quantity" ? (
            <>
              <TableNumber value={order.filledQuantity} /> /{" "}
              <TableNumber value={order.quantity} />
            </>
          ) : (
            <TableNumber value={displayValue} />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="end" className="oui-w-64 oui-p-4">
        <Input value={value} onValueChange={setValue} />
        {/* Rejections toast their specific reason via editPendingOrder; the
            popover stays open so the input can be adjusted. */}
        <div className="oui-mt-3 oui-flex oui-justify-end oui-gap-2">
          <Button
            size="sm"
            variant="outlined"
            color="secondary"
            onClick={() => setOpen(false)}
          >
            {t("common.cancel")}
          </Button>
          <Button
            size="sm"
            onClick={async () => {
              // The edit stays open on failure; the toast explains why.
              if (
                await state.editPendingOrder(
                  order.id,
                  field === "price"
                    ? binaryOrderDisplayPrice(order, Number(value))
                    : order.price,
                  field === "quantity" ? Number(value) : order.quantity,
                )
              )
                setOpen(false);
            }}
          >
            {t("common.confirm")}
          </Button>
        </div>
      </PopoverContent>
    </PopoverRoot>
  );
};
