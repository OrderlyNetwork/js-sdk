import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import { PredictionOrderCell } from "@orderly.network/prediction";
import { Text } from "@orderly.network/ui";
import { DesktopOrderList } from "@orderly.network/ui-orders";
import type { ProductOrdersState } from "./productOrders.script";

export const ProductOrders: React.FC<ProductOrdersState> = ({
  state,
  orders,
  plainText,
  error,
  orderListProps,
}) => {
  const { t } = useTranslation();
  return (
    <div className="oui-flex oui-h-full oui-min-h-0 oui-flex-col">
      {Boolean(error) && (
        <Text role="alert" size="xs" color="danger">
          {t("prediction.orders.loadError")}
        </Text>
      )}
      <DesktopOrderList
        {...orderListProps}
        supplementalRows={orders.map((order) => ({
          id: `prediction-${order.order_id}`,
          timestamp: order.created_time,
          plainText: (field) => plainText(order, field),
          renderCell: (field) => (
            <PredictionOrderCell state={state} order={order} field={field} />
          ),
        }))}
      />
    </div>
  );
};
