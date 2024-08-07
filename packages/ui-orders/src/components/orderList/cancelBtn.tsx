import { API } from "@orderly.network/types";
import { Button, toast } from "@orderly.network/ui";
import { FC, useContext, useState } from "react";
import { OrderListContext } from "./orderListContext";

export const CancelButton: FC<{
  order: API.Order;
}> = (props) => {
  const { order } = props;

  const { onCancelOrder } = useContext(OrderListContext);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Button
      size="sm"
      variant={"outlined"}
      color={"secondary"}
      onClick={(event) => {
        if (!onCancelOrder) return;
        event.preventDefault();
        event.stopPropagation();
        setIsLoading(true);
        onCancelOrder(order)
          .then(
            (res) => res,
            (error) => {
              toast.error(error.message);
            }
          )
          .finally(() => {
            setIsLoading(false);
          });
      }}
      loading = {isLoading}
    >
      Cancel
    </Button>
  );
};
