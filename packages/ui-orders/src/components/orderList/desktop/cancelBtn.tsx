import { FC, useState } from "react";
import { API } from "@orderly.network/types";
import { ThrottledButton, toast } from "@orderly.network/ui";
import { useOrderListContext } from "../orderListContext";
import { useTranslation } from "@orderly.network/i18n";

export const CancelButton: FC<{
  order: API.Order;
}> = (props) => {
  const { order } = props;
  const { t } = useTranslation();

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
      loading={isLoading}
    >
      {t("common.cancel")}
    </ThrottledButton>
  );
};
