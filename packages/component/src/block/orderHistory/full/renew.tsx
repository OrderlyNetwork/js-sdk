import { FC, useCallback, useContext, useMemo, useState } from "react";
import { type ConfigStore } from "@orderly.network/core";

import { useConfig, useMutation } from "@orderly.network/hooks";
import Button from "@/button";
import { OrderEntity } from "@orderly.network/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/popover";
import { OrderConfirmView } from "@/block/orderEntry/sections/orderConfirmView";
import { SymbolContext } from "@/provider";
import { Divider } from "@/divider";

export const Renew: FC<{ record: any }> = (props) => {
  const { record } = props;
  const [open, setOpen] = useState(false);
  const [doCreateOrder, { data, error, reset, isMutating }] = useMutation<
    OrderEntity,
    any
  >("/v1/order");
  const [loading, setLoading] = useState(false);

  const brokerId = useConfig("brokerId");
  const onSubmit = useCallback(() => {
    setLoading(false);
    setOpen(false);
    const data: OrderEntity = {
      symbol: record.symbol,
      order_type: record.type,
      order_price: record.price,
      order_quantity: record.quantity,
      order_amount: record.amount,
      // visible_quantity: record.visible,
      side: record.side,
      // reduce_only: record.reduce_only,
      broker_id: brokerId,
    };

    if (Number(record.visible_quantity) < Number(record.quantity)) {
      data.visible_quantity = 0;
    }

    if (typeof record.reduce_only !== "undefined") {
      data.reduce_only = record.reduce_only;
    }

    doCreateOrder(data);
  }, []);

  const ordetEntity = useMemo(() => {
    return {
      symbol: record.symbol,
      order_type: record.type,
      order_price: record.price,
      order_quantity: record.quantity,
      order_amount: record.amount,
      visible_quantity: record.visible,
      side: record.side,
      broker_id: brokerId,
    };
  }, []);

  const base = useMemo(() => {
    return (record.symbol as string).split("_")[1];
  }, [record.symbol]);

  const quote = useMemo(() => {
    return (record.symbol as string).split("_")[2];
  }, [record.symbol]);

  // console.log("renew record", record, base, quote);

  return (
    <Button
      size={"small"}
      variant={"outlined"}
      color={"tertiary"}
      loading={isMutating}
      disabled={isMutating}
      onClick={(event) => {
        // setOpen(true);
        event.preventDefault();
        event.stopPropagation();
        onSubmit();
      }}
    >
      Renew
    </Button>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          size={"small"}
          variant={"outlined"}
          color={"tertiary"}
          onClick={() => {
            setOpen(true);
          }}
        >
          Renew
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="top"
        className="orderly-w-[340px] orderly-z-20"
        sideOffset={5}
      >
        <div>
          <div className="orderly-flex orderly-justify-start orderly-text-base-contrast orderly-text-lg orderly-pb-2">
            Renew order
          </div>
          <Divider className="orderly-mb-2" />
          <OrderConfirmView
            // @ts-ignore
            order={{ ...ordetEntity, total: record.price * record.quantity }}
            symbol={record.symbol}
            base={base}
            quote={quote}
          />
          <Divider className="orderly-my-2" />
          <div className="orderly-grid orderly-grid-cols-2 sm:orderly-flex sm:orderly-flex-row sm:orderly-justify-end orderly-gap-3 orderly-mt-3">
            <Button
              className="orderly-text-xs desktop:orderly-text-xs orderly-font-bold"
              key="cancel"
              type="button"
              variant="contained"
              color="tertiary"
              disabled={loading}
              onClick={() => {
                setOpen(false);
              }}
              fullWidth
            >
              Cancel
            </Button>

            <Button
              className="orderly-text-xs desktop:orderly-text-xs orderly-font-bold"
              key="ok"
              type="button"
              fullWidth
              disabled={loading}
              onClick={() => {
                setLoading(true);
                onSubmit();
              }}
            >
              OK
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
