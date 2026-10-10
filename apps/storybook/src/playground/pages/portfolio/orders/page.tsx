import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  PredictionOrderCell,
  useProductOrderCancelAll,
  usePredictionAccountData,
  toPredictionOrderStatus,
} from "@orderly.network/prediction";
import { useCanTrade } from "@orderly.network/react-app";
import { OrderStatus } from "@orderly.network/types";
import {
  Box,
  Button,
  Divider,
  Select,
  Tabs,
  TabPanel,
  Text,
} from "@orderly.network/ui";
import {
  DesktopOrderList,
  useOrderListScript,
  TabType,
  OrderListInstance,
} from "@orderly.network/ui-orders";
import { Decimal, isBinarySymbol } from "@orderly.network/utils";

export function MixedOrders({
  type,
  ordersStatus,
  product,
  ordersRef,
}: {
  type: TabType;
  ordersStatus?: OrderStatus;
  product: string;
  ordersRef: React.RefObject<OrderListInstance>;
}) {
  const state = usePredictionAccountData({
    enabled: product !== "perps",
    includeOrderHistory: type !== TabType.pending,
  });
  const canTrade = useCanTrade();
  const { t } = useTranslation();
  const pendingTab = type === TabType.pending;
  const cancellation = useProductOrderCancelAll({
    binary: product === "perps" ? undefined : state,
    enabled: pendingTab,
    instrument: product as "all" | "perps" | "prediction",
  });
  const perps = useOrderListScript({
    type,
    ordersStatus,
    ref: ordersRef,
    productType: "PERP",
    enabled: product !== "prediction",
    cancelAllDisabled: pendingTab ? cancellation.disabled : undefined,
  });
  const [outcome, setOutcome] = useState("all");
  const showOutcome =
    product !== "perps" &&
    [TabType.all, TabType.pending, TabType.filled, TabType.cancelled].includes(
      type,
    );
  const activeOutcome = showOutcome ? outcome : "all";
  useEffect(() => {
    if (!showOutcome) setOutcome("all");
  }, [showOutcome]);
  const filterItems = useMemo(() => {
    if (!showOutcome) return perps.filterItems;
    const items = [...perps.filterItems];
    const sideIndex = items.findIndex((item) => item.name === "side");
    items.splice(sideIndex + 1, 0, {
      type: "select",
      name: "outcome",
      value: activeOutcome,
      options: [
        { label: t("prediction.filter.allOutcomes"), value: "all" },
        { label: t("prediction.up"), value: "up" },
        { label: t("prediction.down"), value: "down" },
      ],
    });
    return items;
  }, [perps.filterItems, showOutcome, activeOutcome, t]);
  const queryKey = JSON.stringify([
    type,
    perps.filterItems.map((item) => [item.name, item.value]),
  ]);
  const [pages, setPages] = useState<{
    key: string;
    rows: Record<number, NonNullable<typeof perps.dataSource>>;
  }>({ key: queryKey, rows: {} });
  const requested = useRef(0);
  useEffect(() => {
    if (!perps.manualPagination || perps.isLoading || !perps.dataSource?.length)
      return;
    const page = perps.pagination.page || 1;
    setPages((previous) => ({
      key: queryKey,
      rows: {
        ...(previous.key === queryKey ? previous.rows : {}),
        [page]: perps.dataSource!,
      },
    }));
    const total = perps.pagination.count ?? 0;
    if (
      perps.dataSource.length &&
      page * perps.pagination.pageSize < total &&
      requested.current !== page + 1
    ) {
      requested.current = page + 1;
      perps.pagination.onPageChange?.(page + 1);
    }
  }, [
    queryKey,
    perps.dataSource,
    perps.isLoading,
    perps.manualPagination,
    perps.pagination.page,
  ]);
  useEffect(() => {
    requested.current = 0;
  }, [queryKey]);
  const loadedPerpRows = perps.manualPagination
    ? pages.key === queryKey
      ? Object.values(pages.rows).flat()
      : []
    : (perps.dataSource ?? []);
  // Execution reports can insert Binary orders into a PERP-filtered cache.
  // Keep them out of Perps row actions, which have no Binary region guard.
  const perpRows = loadedPerpRows.filter(
    (order) => !isBinarySymbol(order.symbol),
  );
  const predictionOrders = useMemo(() => {
    if (!state || !canTrade || product === "perps" || type === TabType.tp_sl)
      return [];
    const rows =
      type === TabType.pending
        ? state.openOrders
        : type === TabType.filled
          ? state.history.filter((o) => o.status === "filled")
          : type === TabType.cancelled
            ? state.history.filter((o) => o.status === "cancelled")
            : type === TabType.rejected
              ? state.history.filter((o) => o.status === "rejected")
              : [...state.openOrders, ...state.history];
    return rows.filter((order) =>
      filterItems.every((filter) => {
        const value = filter.value;
        if (!value || value === "all") return true;
        if (filter.name === "outcome") return order.outcome === value;
        if (filter.name === "side")
          return order.side.toUpperCase() === String(value).toUpperCase();
        if (filter.name === "status")
          return (order.status ?? "pending") === toPredictionOrderStatus(value);
        if (filter.name === "dateRange") {
          const range = value as { from?: Date; to?: Date };
          return (
            (!range.from ||
              order.timestamp >= new Date(range.from).getTime()) &&
            (!range.to || order.timestamp <= new Date(range.to).getTime())
          );
        }
        return true;
      }),
    );
  }, [state, canTrade, product, type, filterItems]);
  const supplementalRows = useMemo(
    () =>
      predictionOrders.map((order) => ({
        id: `prediction-${order.id}`,
        timestamp: order.timestamp,
        plainText: (field: string) => {
          const filled = "status" in order && order.status === "filled";
          const pending = !("status" in order);
          const values: Record<string, string> = {
            symbol: `BTC UP/DOWN 5M (${order.outcome}) ${new Date((order.round + 300) * 1000).toISOString()}`,
            side: order.side,
            fill_quantity: `${filled ? order.quantity : 0} / ${order.quantity}`,
            quantity: String(order.quantity),
            price: order.type === "market" ? "Market" : String(order.price),
            average_executed_price: filled ? String(order.price) : "--",
            executed: new Decimal(pending || filled ? order.quantity : 0)
              .mul(order.price)
              .toString(),
            status: "status" in order ? String(order.status) : "pending",
            created_time: new Date(order.timestamp).toISOString(),
            action: "",
          };
          return values[field] ?? "--";
        },
        renderCell: (field: string) => (
          <PredictionOrderCell state={state!} order={order} field={field} />
        ),
      })),
    [predictionOrders, state],
  );
  const visiblePerps =
    product === "prediction" || activeOutcome !== "all" ? [] : perpRows;
  return (
    <DesktopOrderList
      key={product}
      {...perps}
      filterItems={filterItems}
      onFilter={(filter) => {
        if (filter.name === "outcome") setOutcome(filter.value);
        else perps.onFilter(filter);
      }}
      dataSource={visiblePerps}
      supplementalRows={supplementalRows}
      useClientTable={canTrade}
      {...(pendingTab ? cancellation.orderListProps : {})}
    />
  );
}

export default function OrdersPage() {
  const { t } = useTranslation();
  const [product, setProduct] = useState("all");
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
    <Box
      p={6}
      pb={0}
      intensity={900}
      r="xl"
      width="100%"
      style={{
        minHeight: 379,
        maxHeight: 2560,
        overflow: "hidden",
        // Make the table scroll instead of the page scroll
        height: "calc(100vh - 48px - 29px - 48px)",
      }}
    >
      <div className="oui-flex oui-h-full oui-flex-col oui-gap-4">
        <Text size="lg">{t("common.orders")}</Text>
        <div className="oui-flex oui-items-center oui-justify-between oui-gap-3">
          <div className="oui-flex oui-min-w-0 oui-flex-wrap oui-items-center oui-gap-3">
            <div className="oui-w-[180px] oui-shrink-0">
              <Select.options
                value={product}
                onValueChange={setProduct}
                size="sm"
                options={[
                  {
                    label: t("prediction.filter.allInstruments"),
                    value: "all",
                  },
                  { label: t("prediction.filter.perps"), value: "perps" },
                  {
                    label: t("prediction.tab.predictions"),
                    value: "prediction",
                  },
                ]}
              />
            </div>
          </div>
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
          className="oui-min-h-0 oui-flex-1"
          classNames={{
            tabsContent: "oui-h-[calc(100%_-_40px)] oui-overflow-auto",
          }}
        >
          {tabs.map((item) => (
            <TabPanel key={item.value} value={item.value} title={item.label}>
              <MixedOrders
                type={item.value}
                ordersStatus={item.status}
                product={product}
                ordersRef={ordersRef}
              />
            </TabPanel>
          ))}
        </Tabs>
      </div>
    </Box>
  );
}
