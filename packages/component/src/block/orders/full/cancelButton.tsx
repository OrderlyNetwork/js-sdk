import Button from "@/button";
import { toast } from "@/toast";
import type { API } from "@orderly.network/types";
import { useState, type FC, useContext } from "react";
import { OrderListContext } from "../shared/orderListContext";

interface CancelButtonProps {
  order: API.Order;
}

export const CancelButton: FC<CancelButtonProps> = (props) => {
  const { order } = props;
  const { onCancelOrder } = useContext(OrderListContext);

  const [isLoading, setIsLoading] = useState(false);

  return (
    <Button
      size="small"
      variant={"outlined"}
      color={"tertiary"}
      loading={isLoading}
      onClick={() => {
        if (!onCancelOrder) return;
        setIsLoading(true);
        onCancelOrder(order)
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
