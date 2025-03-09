import { FC, useCallback, useState } from "react";
import { useConfig, useMutation } from "@orderly.network/hooks";
import { OrderEntity } from "@orderly.network/types";
import { Button } from "@orderly.network/ui";
import { useTranslation } from "@orderly.network/i18n";

export const Renew: FC<{ record: any }> = (props) => {
  const { record } = props;
  const [open, setOpen] = useState(false);
  const [doCreateOrder, { data, error, reset, isMutating }] = useMutation<
    OrderEntity,
    any
  >("/v1/order");

  const { t } = useTranslation();

  const brokerId = useConfig("brokerId");
  const onSubmit = useCallback(() => {
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

  return (
    <Button
      size={"sm"}
      variant={"outlined"}
      color={"secondary"}
      loading={isMutating}
      disabled={isMutating}
      onClick={(event) => {
        if (isMutating) return;
        event.preventDefault();
        event.stopPropagation();
        onSubmit();
      }}
    >
      {t("orders.history.renew")}
    </Button>
  );
};
