import React, { useRef, useState } from "react";
import { useAccount } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import type { ProductOrderInstrument } from "@orderly.network/prediction";
import { OrderStatus } from "@orderly.network/types";
import {
  Button,
  Divider,
  Select,
  Tabs,
  TabPanel,
  Text,
  formatAddress,
} from "@orderly.network/ui";
import { TabType, type OrderListInstance } from "@orderly.network/ui-orders";
import type { SharePnLConfig } from "@orderly.network/ui-share";
import { PerpsOrdersPage } from "./perpsPage.ui";
import { ProductOrdersWidget } from "./productOrders.widget";

export type PortfolioOrdersPageProps = {
  sharePnLConfig?: SharePnLConfig;
  /** Enable automatic Prediction integration; defaults to true. */
  predictionEnabled?: boolean;
};

export const OrdersPage: React.FC<PortfolioOrdersPageProps> = ({
  predictionEnabled = true,
  ...props
}) =>
  predictionEnabled ? (
    <ProductOrdersPage {...props} />
  ) : (
    <PerpsOrdersPage {...props} />
  );

const ProductOrdersPage: React.FC<PortfolioOrdersPageProps> = ({
  sharePnLConfig,
}) => {
  const { state: account } = useAccount();
  const { t } = useTranslation();
  const [product, setProduct] = useState<ProductOrderInstrument>("all");
  const [tab, setTab] = useState<string>(TabType.all);
  const ordersRef = useRef<OrderListInstance>(null);
  const tabs = [
    { value: TabType.all, label: t("common.all") },
    {
      value: TabType.pending,
      label: t("orders.status.pending"),
      status: OrderStatus.INCOMPLETE,
    },
    {
      value: TabType.tp_sl,
      label: t("common.tpsl"),
      status: OrderStatus.INCOMPLETE,
    },
    {
      value: TabType.filled,
      label: t("orders.status.filled"),
      status: OrderStatus.FILLED,
    },
    {
      value: TabType.cancelled,
      label: t("orders.status.canceled"),
      status: OrderStatus.CANCELLED,
    },
    {
      value: TabType.rejected,
      label: t("orders.status.rejected"),
      status: OrderStatus.REJECTED,
    },
  ];
  return (
    <div className="oui-flex oui-h-full oui-flex-col oui-gap-4">
      <Text size="lg">{t("common.orders")}</Text>
      <div className="oui-flex oui-items-center oui-justify-between oui-gap-3">
        <div className="oui-flex oui-min-w-0 oui-flex-wrap oui-items-center oui-gap-3">
          <div className="oui-w-[180px] oui-shrink-0">
            <Select.options
              value={product}
              onValueChange={(value) =>
                setProduct(value as ProductOrderInstrument)
              }
              size="sm"
              options={[
                {
                  label: t("prediction.filter.allInstruments"),
                  value: "all",
                },
                { label: t("common.perps"), value: "perps" },
                { label: t("common.predictions"), value: "prediction" },
              ]}
            />
          </div>
        </div>
        {product === "prediction" && (
          <Text size="xs" color="neutral">
            {t("prediction.currentAccount")}
            {account.accountId && `: ${formatAddress(account.accountId)}`}
          </Text>
        )}
        <Button
          size="xs"
          color="secondary"
          className="oui-w-auto oui-shrink-0"
          onClick={() => ordersRef.current?.download?.()}
        >
          {t("common.download")}
        </Button>
      </div>
      <Divider />
      <Tabs
        value={tab}
        onValueChange={setTab}
        variant="contained"
        className="oui-min-h-0 oui-min-w-0 oui-flex-1"
        classNames={{
          // Keep scrolling inside DataTable, below the filters and above pagination.
          tabsContent:
            "oui-h-[calc(100%_-_40px)] oui-min-h-0 oui-overflow-hidden",
        }}
      >
        {tabs.map((item) => (
          <TabPanel key={item.value} value={item.value} title={item.label}>
            <ProductOrdersWidget
              key={`${account.accountId}:${product}`}
              sharePnLConfig={sharePnLConfig}
              type={item.value}
              ordersStatus={item.status}
              product={product}
              ordersRef={ordersRef}
            />
          </TabPanel>
        ))}
      </Tabs>
    </div>
  );
};
