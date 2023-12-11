import Button from "@/button";
import { toast } from "@/toast";
import type { API } from "@orderly.network/types";
import { useState, type FC } from "react";

interface CancelButtonProps {
  order: API.Order;
  onCancel?: (orderId: number, symbol: string) => Promise<any>;
}

export const CancelButton: FC<CancelButtonProps> = (props) => {
  const { order } = props;

  const [isLoading, setIsLoading] = useState(false);

  return (
    <Button
      size="small"
      variant={"outlined"}
      color={"tertiary"}
      loading={isLoading}
      onClick={() => {
        if (!props.onCancel) return;
        setIsLoading(true);
        props
          .onCancel?.(order.order_id, order.symbol)
          .then(
            (res) => {},
            (error) => {
              toast.error(error.message);
            }
          )
          .finally(() => {
            setIsLoading(false);
          });
      }}
    >
      Cancel
    </Button>
  );
};
