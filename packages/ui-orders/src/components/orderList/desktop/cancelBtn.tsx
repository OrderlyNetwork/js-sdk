import { FC, useState } from "react";
import { API } from "@kodiak-finance/orderly-types";
import { ThrottledButton, toast } from "@kodiak-finance/orderly-ui";
import { useOrderListContext } from "../orderListContext";
import { useTranslation } from "@kodiak-finance/orderly-i18n";

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
