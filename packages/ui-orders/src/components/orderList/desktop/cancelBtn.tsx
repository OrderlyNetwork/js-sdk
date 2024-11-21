import { API } from "@orderly.network/types";
import { Button, ThrottledButton, toast } from "@orderly.network/ui";
import { FC, useContext, useState } from "react";
import { useOrderListContext } from "../orderListContext";

export const CancelButton: FC<{
  order: API.Order;
}> = (props) => {
  const { order } = props;

  const { onCancelOrder } = useOrderListContext();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <ThrottledButton
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
            (res: any) => res,
            (error: any) => {
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
    </ThrottledButton>
  );
};
