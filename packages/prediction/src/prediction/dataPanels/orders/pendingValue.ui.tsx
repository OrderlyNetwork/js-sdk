import React, { useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  Button,
  Input,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
  Text,
} from "@orderly.network/ui";
import { TableNumber } from "../../cells";
import type { PredictionState } from "../../prediction.script";

export const PendingValue = ({
  state,
  order,
  field,
}: {
  state: PredictionState;
  order: PredictionState["openOrders"][number];
  field: "price" | "quantity";
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(String(order[field]));
  const [error, setError] = useState(false);
  return (
    <PopoverRoot
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setValue(String(order[field]));
        setError(false);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="text"
          color="secondary"
          size="xs"
          disabled={!state.isRoundTradable || state.isRegionRestricted}
        >
          {field === "quantity" ? "0 / " : ""}
          <TableNumber value={order[field]} />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="end" className="oui-w-64 oui-p-4">
        <Input value={value} onValueChange={setValue} />
        {error && <Text color="danger">{t("prediction.invalidOrder")}</Text>}
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
            onClick={() => {
              if (
                state.editPendingOrder(
                  order.id,
                  field === "price" ? Number(value) : order.price,
                  field === "quantity" ? Number(value) : order.quantity,
                )
              )
                setOpen(false);
              else setError(true);
            }}
          >
            {t("common.confirm")}
          </Button>
        </div>
      </PopoverContent>
    </PopoverRoot>
  );
};
