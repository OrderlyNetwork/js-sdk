import { FC, useState } from "react";
import Button from "@/button";
import { toast } from "@/toast";

type Props<T> = {
  order: T;
  onCancelOrder: (order: T) => Promise<void>;
};

export const OrderCancelButton = <T,>(props: Props<T>) => {
  const { onCancelOrder, order } = props;
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Button
      className={"orderly-flex-1"}
      size="small"
      variant={"outlined"}
      color={"tertiary"}
      loading={isLoading}
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
    >
      Cancel
    </Button>
  );
};
