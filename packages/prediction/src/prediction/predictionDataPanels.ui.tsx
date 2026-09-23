import React, { useEffect, useMemo, useState } from "react";
import { usePositionStream } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { AssetsModule } from "@orderly.network/portfolio";
import { useDataTap } from "@orderly.network/react-app";
import {
  PerpsPositionsPanel,
  PerpsPositionsSettings,
} from "@orderly.network/trading";
import { OrderStatus } from "@orderly.network/types";
import {
  Badge,
  Box,
  Button,
  cn,
  DataFilter,
  Divider,
  Flex,
  Input,
  inputFormatter,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
  Select,
  Slider,
  TableFeatures,
  TabPanel,
  Tabs,
  Text,
  usePagination,
} from "@orderly.network/ui";
import type { Column, DataFilterItem } from "@orderly.network/ui";
import { AuthGuardDataTable } from "@orderly.network/ui-connector";
import { SlippageUI } from "@orderly.network/ui-order-entry";
import {
  DesktopOrderList,
  TabType,
  useOrderColumn,
  useOrderListScript,
} from "@orderly.network/ui-orders";
import { PositionHistoryWidget } from "@orderly.network/ui-positions";
import { Decimal } from "@orderly.network/utils";
import type {
  PredictionDataTab,
  PredictionOutcome,
  PredictionState,
} from "./prediction.script";
import {
  usePredictionFilters,
  predictionDateRange,
} from "./predictionFilters.script";
import { formatCountdown, usePredictionFormatters } from "./predictionShared";

const OutcomeBadge: React.FC<{ outcome: PredictionOutcome }> = ({
  outcome,
}) => {
  const { t } = useTranslation();
  return (
    <Badge
      className="oui-prediction-outcomeBadge oui-uppercase"
      color={outcome === "up" ? "buy" : "sell"}
      size="xs"
    >
      {t(`prediction.${outcome}`)}
    </Badge>
  );
};

const TableNumber: React.FC<{
  value: number;
  dp?: number;
  prefix?: string;
  suffix?: string;
}> = ({ value, dp = 4, prefix, suffix }) => (
  <span className="oui-prediction-dataTable-number oui-whitespace-nowrap oui-tabular-nums">
    {prefix}
    <Text.numeral dp={dp} padding={false}>
      {value}
    </Text.numeral>
    {suffix && ` ${suffix}`}
  </span>
);

export type PredictionDataPanelProps = {
  state: PredictionState;
  tabs?: PredictionDataTab[];
  className?: string;
  embedded?: boolean;
};

export const PredictionDataPanel: React.FC<PredictionDataPanelProps> = ({
  state,
  tabs = [
    "predictions",
    "openOrders",
    "filled",
    "predictionHistory",
    "orderHistory",
    "assets",
  ],
  className,
  embedded = false,
}) => {
  const { t } = useTranslation();
  const [positionProduct, setPositionProduct] =
    useState<ProductType>("prediction");

  const tabCount: Partial<Record<PredictionDataTab, number>> = {
    openOrders: state.openOrders.length,
    predictions: state.positions.length,
  };

  const tabContent: Record<PredictionDataTab, React.ReactNode> = {
    openOrders: <SharedProductOrdersPanel state={state} mode="pending" />,
    predictions: (
      <SharedProductDataPanel
        state={state}
        type="positions"
        initialProduct="prediction"
        onProductChange={setPositionProduct}
      />
    ),
    filled: <SharedProductOrdersPanel state={state} mode="filled" />,
    predictionHistory: (
      <SharedProductDataPanel
        state={state}
        type="positionHistory"
        initialProduct="prediction"
      />
    ),
    assets: (
      <Flex
        width="100%"
        height="100%"
        className="oui-overflow-y-auto oui-hide-scrollbar oui-pt-3"
      >
        <AssetsModule.AssetsDataTableWidget
          classNames={{
            scrollRoot:
              "oui-h-full oui-mb-6 oui-mt-0 oui-p-0 oui-pt-3 oui-h-[calc(100%_-_40px)]",
            root: "oui-gap-4 oui-h-full",
            desc: "oui-ms-1",
          }}
          dataTableClassNames={{
            header: "oui-bg-base-9",
            root: "oui-h-[calc(100%_-_28px)]",
          }}
        />
      </Flex>
    ),
    orderHistory: <SharedProductOrdersPanel state={state} mode="history" />,
  };

  return (
    <Box
      intensity={900}
      r={embedded ? undefined : "2xl"}
      p={embedded ? 0 : 2}
      className={cn(
        "oui-prediction-dataPanel-container oui-h-full oui-min-h-0 oui-overflow-hidden",
        "oui-relative",
        className,
      )}
    >
      <Tabs
        className="oui-prediction-dataPanel-tabs oui-h-full oui-min-h-0"
        value={state.activeTab}
        onValueChange={(value) =>
          state.setActiveTab(value as PredictionDataTab)
        }
        variant={embedded ? undefined : "contained"}
        size={embedded ? undefined : "lg"}
        classNames={{
          tabsList: embedded ? "!oui-border-none oui-pb-1" : undefined,
          trigger: "oui-group oui-dataPanel-tab-btn",
          // Perp DataList parity: fixed content height, no outer overflow.
          // `overflow-x-auto` would also force overflow-y to auto (CSS quirk)
          // and produce the external scrollbar around filters + table.
          tabsContent: embedded
            ? "oui-h-[calc(100%_-_28px)] oui-min-h-0 oui-overflow-hidden"
            : "oui-h-[calc(100%_-_32px)] oui-min-h-0 oui-overflow-hidden",
        }}
      >
        {tabs.map((tab) => (
          <TabPanel
            key={tab}
            value={tab}
            title={
              <>
                {t(`prediction.tab.${tab}`)}
                {(tabCount[tab] ?? 0) > 0 && ` (${tabCount[tab]})`}
              </>
            }
          >
            {tabContent[tab]}
          </TabPanel>
        ))}
      </Tabs>
      {state.activeTab === "predictions" && positionProduct === "perps" && (
        <div className="oui-absolute oui-end-2 oui-top-2 oui-z-10">
          <PerpsPositionsSettings />
        </div>
      )}
    </Box>
  );
};

type ProductDataType = "positions" | "positionHistory";
type ProductType = "perps" | "prediction";

export type SharedProductDataPanelProps = {
  state: PredictionState;
  type: ProductDataType;
  /** The product shown when this panel first opens on a page. */
  initialProduct: ProductType;
  perpsSymbol?: string;
  /** Content rendered before the Perps / Prediction control, such as account filters. */
  beforeProductSelector?: React.ReactNode;
  perpsPositionsContent?: React.ReactNode;
  perpsPositionHistoryContent?: React.ReactNode;
  onProductChange?: (product: ProductType) => void;
};

/**
 * Lets either trading surface inspect Perps and Prediction data without
 * combining their different columns or filters into one table.
 */
export const SharedProductDataPanel: React.FC<SharedProductDataPanelProps> = ({
  state,
  type,
  initialProduct,
  perpsSymbol,
  beforeProductSelector,
  perpsPositionsContent,
  perpsPositionHistoryContent,
  onProductChange,
}) => {
  const { t } = useTranslation();
  const [product, setProduct] = useState<ProductType>(initialProduct);
  const [perpsPositions] = usePositionStream();
  const perpsPositionCount = useDataTap(perpsPositions.rows?.length) ?? 0;
  const predictionPositionCount = state.positions.length;

  const content =
    product === "prediction" ? (
      type === "positions" ? (
        <HoldingsTable state={state} />
      ) : (
        <PredictionHistoryTable state={state} />
      )
    ) : type === "positions" ? (
      (perpsPositionsContent ?? <PerpsPositionsPanel symbol={perpsSymbol} />)
    ) : (
      (perpsPositionHistoryContent ?? <PositionHistoryWidget />)
    );

  return (
    <div className="oui-flex oui-h-full oui-min-h-0 oui-flex-col oui-overflow-hidden">
      {beforeProductSelector}
      <div
        role="tablist"
        aria-label={t("common.positions")}
        className="oui-mt-2 oui-inline-flex oui-w-fit oui-gap-x-[6px]"
      >
        {(["perps", "prediction"] as const).map((item) => {
          const active = product === item;
          return (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setProduct(item);
                onProductChange?.(item);
              }}
              data-state={active ? "active" : "inactive"}
              className={cn(
                "oui-group !oui-rounded-md oui-inline-flex oui-h-7 oui-items-center oui-justify-center oui-gap-x-1 oui-bg-base-7 oui-px-3 oui-text-2xs oui-font-medium oui-text-base-contrast-36 oui-transition-all hover:oui-bg-base-5 hover:oui-text-base-contrast-54 data-[state=active]:oui-bg-base-5 data-[state=active]:oui-text-base-contrast",
              )}
            >
              {item === "perps" ? t("common.perps") : t("prediction.title")} (
              {item === "perps" ? perpsPositionCount : predictionPositionCount})
            </button>
          );
        })}
      </div>
      {/* Remaining height after the product switcher; tables scroll inside. */}
      <div className="oui-min-h-0 oui-flex-1 oui-overflow-hidden">
        {content}
      </div>
    </div>
  );
};

type PredictionTableRow = {
  id: string;
  cells: React.ReactNode[];
  sortValues?: Array<string | number | undefined>;
  [key: string]: React.ReactNode | React.ReactNode[];
};

type PredictionTableColumn = {
  title: React.ReactNode;
  width: number;
  align?: "left" | "center" | "right";
  fixed?: "start" | "end";
  sortable?: boolean;
  type?: "data" | "action";
};

const tableColumn = (
  title: React.ReactNode,
  width: number,
  options?: Omit<PredictionTableColumn, "title" | "width">,
): PredictionTableColumn => ({ title, width, ...options });

const PredictionDataTable: React.FC<{
  columns: PredictionTableColumn[];
  rows: PredictionTableRow[];
  toolbar?: React.ReactNode;
}> = ({ columns, rows, toolbar }) => {
  // Perp parity: 20 rows per page, matching the merged DesktopOrderList view.
  const { pagination, setPage } = usePagination({ pageSize: 20 });
  const dataColumns = useMemo<Column<PredictionTableRow>[]>(
    () =>
      columns.map((column, index) => ({
        title: column.title,
        plantTextTitle:
          typeof column.title === "string" ? column.title : undefined,
        dataIndex: `cell_${index}`,
        width: column.width,
        align: column.align ?? "left",
        fixed: column.fixed,
        type: column.type,
        onSort: column.sortable,
        render: (_value, record) => record.cells[index],
        renderPlantText: (_value, record) =>
          String(record.sortValues?.[index] ?? ""),
      })),
    [columns],
  );

  const dataSource = useMemo(
    () =>
      rows.map((row) =>
        row.cells.reduce<PredictionTableRow>(
          (record, cell, index) => {
            record[`cell_${index}`] = row.sortValues?.[index] ?? cell;
            return record;
          },
          { ...row },
        ),
      ),
    [rows],
  );

  useEffect(() => {
    setPage(1);
  }, [dataSource.length, setPage]);

  // Always hand pagination to the table: the DataTable hides the bar itself
  // when there are no rows (useShowPagination), so empty and auth states stay
  // clean without a local row-count threshold.
  const tablePagination = {
    ...pagination,
    pageSize: 20,
    count: dataSource.length,
  };

  // Perp parity (DesktopOrderList): toolbar sits above the table; the table
  // root is height-constrained so DataTable's internal `overflow-auto` scroll
  // area owns both axes. Column widths drive horizontal scroll + fixed pins.
  return (
    <div className="oui-prediction-dataTable-container oui-flex oui-h-full oui-min-h-0 oui-w-full oui-flex-col">
      {toolbar}
      <AuthGuardDataTable
        className="oui-prediction-dataTable"
        columns={dataColumns}
        dataSource={dataSource}
        bordered
        ignoreLoadingCheck
        classNames={{
          header: "oui-h-[38px]",
          root: cn(
            "oui-items-start",
            toolbar ? "!oui-h-[calc(100%_-_49px)]" : "oui-h-full",
          ),
        }}
        onRow={() => ({
          className: "oui-h-12 oui-text-base-contrast-80",
        })}
        generatedRowKey={(record) => record.id}
        pagination={tablePagination}
        features={[TableFeatures.DownloadFeature]}
      />
    </div>
  );
};

/* eslint-disable react/jsx-key -- DataTable cells are positional arrays keyed by their parent row. */
const RoundSymbol = ({
  round,
  outcome,
}: {
  round: number;
  outcome: PredictionOutcome;
}) => {
  const { t } = useTranslation();
  const { formatRoundBadge } = usePredictionFormatters();
  return (
    <div className="oui-flex oui-items-center oui-gap-2 oui-py-1 oui-whitespace-nowrap">
      <span
        aria-hidden="true"
        className={cn(
          "oui-h-[42px] oui-w-1 oui-shrink-0 oui-rounded-[1px]",
          outcome === "up" ? "oui-bg-trade-profit" : "oui-bg-trade-loss",
        )}
      />
      <div>
        <div>{t("prediction.btcUpDown")}</div>
        <div className="oui-mt-1 oui-text-base-contrast-54 oui-tabular-nums">
          {formatRoundBadge(round)}
        </div>
      </div>
    </div>
  );
};

const PredictionOrderSymbol = ({
  order,
}: {
  order: PredictionState["openOrders"][number];
}) => {
  const { t } = useTranslation();
  const { formatRoundBadge } = usePredictionFormatters();
  return (
    <div className="oui-flex oui-items-center oui-gap-2 oui-py-1">
      <span
        aria-label={t(`common.${order.side}`)}
        title={t(`common.${order.side}`)}
        className={cn(
          "oui-h-[34px] oui-w-1 oui-shrink-0 oui-rounded-[1px]",
          order.side === "buy" ? "oui-bg-trade-profit" : "oui-bg-trade-loss",
        )}
      />
      <div className="oui-min-w-0 oui-text-base-contrast">
        <div className="oui-whitespace-nowrap">{t("prediction.btcUpDown")}</div>
        <div className="oui-mt-1 oui-flex oui-items-center oui-gap-1 oui-whitespace-nowrap">
          <Badge color="neutral" size="xs">
            {t(`common.${order.type}`)}
          </Badge>
          <span className="oui-whitespace-nowrap oui-text-base-contrast-54 oui-tabular-nums">
            {formatRoundBadge(order.round)}
          </span>
        </div>
      </div>
    </div>
  );
};

const SellPosition = ({
  state,
  outcome,
}: {
  state: PredictionState;
  outcome: PredictionOutcome;
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState<"market" | "limit">("market");
  const available = state.availableQuantity(outcome);
  const estimatedSlippage = useMemo(
    () => state.estimateOrderSlippage("sell", Number(quantity), outcome),
    [outcome, quantity, state],
  );
  const isSlippageExceeded =
    type === "market" &&
    estimatedSlippage !== null &&
    estimatedSlippage > new Decimal(state.slippage || 0).div(100).toNumber();
  const percentage =
    available > 0
      ? Math.max(
          0,
          Math.min(
            100,
            new Decimal(Number(quantity) || 0)
              .div(available)
              .mul(100)
              .toNumber(),
          ),
        )
      : 0;
  const selectPercentage = (value: number) =>
    setQuantity(
      value === 100
        ? String(available)
        : new Decimal(available)
            .mul(value)
            .div(100)
            .toFixed(4, Decimal.ROUND_DOWN),
    );
  const tradable = state.isRoundTradable && !state.isRegionRestricted;
  const valid =
    tradable &&
    Number(quantity) > 0 &&
    Number(quantity) <= available &&
    !isSlippageExceeded &&
    (type === "market" || (Number(price) > 0 && Number(price) < 1));
  return (
    <PopoverRoot
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (value) {
          setQuantity(String(available));
          setPrice(state.outcomePrices[outcome].toFixed(4));
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="outlined"
          color="secondary"
          disabled={!tradable || available <= 0}
        >
          {t("common.sell")}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        className="oui-w-[360px] oui-max-w-[calc(100vw-32px)] oui-p-5"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <div className="oui-flex oui-flex-col oui-gap-2">
          <div>
            <OutcomeBadge outcome={outcome} />
          </div>
          <div className="oui-mb-1 oui-flex oui-w-full oui-items-center oui-gap-2">
            <Input.tooltip
              prefix={t("common.quantity")}
              align="right"
              size="md"
              fullWidth
              autoComplete="off"
              formatters={[
                inputFormatter.numberFormatter,
                inputFormatter.dpFormatter(4),
              ]}
              triggerClassName="oui-min-w-0 oui-flex-1"
              classNames={{
                prefix: "oui-text-base-contrast-54",
                root: "oui-w-full oui-outline-line-12",
              }}
              value={quantity}
              onValueChange={setQuantity}
            />
          </div>
          <div className="oui-flex oui-w-full oui-gap-2">
            {[25, 50, 75, 100].map((value) => (
              <Button
                key={value}
                variant="outlined"
                size="xs"
                color="secondary"
                className={cn(
                  "oui-w-1/4",
                  percentage === value && "oui-border-primary oui-text-primary",
                )}
                onClick={() => selectPercentage(value)}
              >
                {value}%
              </Button>
            ))}
          </div>
          <Slider
            showTip
            markCount={4}
            min={0}
            max={100}
            color="primary"
            value={[percentage]}
            onValueChange={([value]) => selectPercentage(value)}
          />
          <div className="oui-flex oui-w-full oui-items-center oui-justify-between">
            <Text size="2xs" color="primary">
              {new Decimal(percentage).toDecimalPlaces(2).toNumber()}%
            </Text>
            <div className="oui-flex oui-items-center oui-gap-1">
              <Text size="2xs" intensity={54}>
                {t("common.available")}
              </Text>
              <Text.numeral intensity={54} size="2xs" dp={4} padding={false}>
                {available}
              </Text.numeral>
            </div>
          </div>
          <Divider my={2} intensity={8} className="oui-w-full" />
          <Input.tooltip
            size="md"
            fullWidth
            autoComplete="off"
            triggerClassName="oui-w-full"
            formatters={[
              inputFormatter.numberFormatter,
              inputFormatter.dpFormatter(4),
            ]}
            value={type === "market" ? "" : price}
            onValueChange={setPrice}
            disabled={type === "market"}
            placeholder={type === "market" ? "--" : ""}
            classNames={{
              suffix: "oui-text-base-contrast-54",
              root: "oui-w-full oui-outline-line-12 focus-within:oui-outline-line-12",
            }}
            suffix={
              <Select.options
                variant="text"
                size="md"
                classNames={{
                  trigger: "oui-w-[--radix-select-content-available-width]",
                }}
                contentProps={{
                  align: "end",
                  className: "oui-border oui-border-line-6",
                }}
                value={type}
                options={[
                  { label: t("common.limit"), value: "limit" },
                  { label: t("common.market"), value: "market" },
                ]}
                onValueChange={(value) => setType(value as "market" | "limit")}
              />
            }
          />
          {type === "market" && (
            <div className="oui-mt-2">
              <SlippageUI
                slippage={state.slippage}
                setSlippage={state.setSlippage}
                estSlippage={estimatedSlippage}
              />
            </div>
          )}
          <div className="oui-mt-3 oui-flex oui-w-full oui-gap-2 oui-pb-1">
            <Button
              size="md"
              fullWidth
              color="secondary"
              onClick={() => setOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              size="md"
              fullWidth
              disabled={!valid}
              onClick={() => {
                if (
                  state.sellPosition(
                    outcome,
                    Number(quantity),
                    type,
                    Number(price),
                  )
                )
                  setOpen(false);
              }}
            >
              {t("common.confirm")}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </PopoverRoot>
  );
};

const PredictionFilters = ({
  filters,
  mode,
  trailing,
  leadingItems = [],
  onLeadingFilter,
}: {
  filters: ReturnType<typeof usePredictionFilters>;
  mode: "holdings" | "pending" | "filled" | "history" | "settlements";
  trailing?: React.ReactNode;
  leadingItems?: DataFilterItem[];
  onLeadingFilter?: (filter: { name: string; value: unknown }) => void;
}) => {
  const { t } = useTranslation();
  const items: DataFilterItem[] = [];
  if (mode !== "holdings" && mode !== "settlements")
    items.push({
      type: "select",
      name: "side",
      value: filters.side,
      options: [
        { label: t("common.side.all"), value: "all" },
        { label: t("common.buy"), value: "buy" },
        { label: t("common.sell"), value: "sell" },
      ],
    });
  items.push({
    type: "select",
    name: "outcome",
    value: filters.outcome,
    options: [
      { label: t("prediction.filter.allOutcomes"), value: "all" },
      { label: t("prediction.up"), value: "up" },
      { label: t("prediction.down"), value: "down" },
    ],
  });
  if (mode === "history") {
    items.push({
      type: "select",
      name: "status",
      value: filters.status,
      options: [
        { label: t("common.status.all"), value: "all" },
        { label: t("orders.status.pending"), value: "pending" },
        { label: t("prediction.status.filled"), value: "filled" },
        { label: t("prediction.status.cancelled"), value: "cancelled" },
      ],
    });
  }
  if (mode === "history" || mode === "settlements") {
    items.push({
      type: "range",
      name: "dateRange",
      value: { from: filters.dateRange.from, to: filters.dateRange.to },
      fromDate: predictionDateRange(90).from,
      toDate: predictionDateRange(1).to,
    });
  }
  // DataFilter already applies py={3}; only keep horizontal inset here.
  return (
    <div className="oui-flex oui-flex-wrap oui-items-center oui-gap-3 oui-px-2">
      <DataFilter
        className="oui-w-auto oui-flex-wrap oui-gap-y-3"
        items={[...leadingItems, ...items]}
        onFilter={(filter) => {
          if (leadingItems.some((item) => item.name === filter.name)) {
            onLeadingFilter?.(filter);
            return;
          }
          filters.onFilter(filter);
        }}
      />
      {mode === "settlements" &&
        [1, 7, 30, 90].map((days) => (
          <button
            key={days}
            type="button"
            aria-pressed={filters.days === days}
            onClick={() => filters.updateDays(days)}
            className="oui-relative oui-rounded oui-px-2 oui-py-[2px] oui-text-sm"
          >
            <span className="oui-pointer-events-none oui-absolute oui-inset-0 oui-rounded oui-opacity-[.12] oui-gradient-primary" />
            <Text.gradient
              color={filters.days === days ? "brand" : undefined}
              className={
                filters.days !== days ? "oui-text-base-contrast-54" : undefined
              }
            >
              {days}D
            </Text.gradient>
          </button>
        ))}
      {trailing && <div className="oui-ml-auto">{trailing}</div>}
    </div>
  );
};

const HoldingsTable = ({
  state,
  leadingFilterItems,
  onLeadingFilter,
}: {
  state: PredictionState;
  leadingFilterItems?: DataFilterItem[];
  onLeadingFilter?: (filter: { name: string; value: unknown }) => void;
}) => {
  const { t } = useTranslation();
  const filters = usePredictionFilters();
  return (
    <PredictionDataTable
      toolbar={
        <PredictionFilters
          filters={filters}
          mode="holdings"
          leadingItems={leadingFilterItems}
          onLeadingFilter={onLeadingFilter}
        />
      }
      columns={[
        tableColumn(t("common.symbol"), 250, { fixed: "start" }),
        tableColumn(t("prediction.outcome"), 100),
        tableColumn(t("prediction.size"), 110, { sortable: true }),
        tableColumn(t("common.available"), 110, { sortable: true }),
        tableColumn(t("prediction.entryPrice"), 130, { sortable: true }),
        tableColumn(t("prediction.lastPrice"), 130, { sortable: true }),
        tableColumn(t("common.unrealizedPnl"), 170, { sortable: true }),
        tableColumn(t("prediction.countdownStatus"), 150),
        tableColumn("", 100, { fixed: "end", align: "right", type: "action" }),
      ]}
      rows={state.positions.filter(filters.matches).map((position) => ({
        id: position.outcome,
        sortValues: [
          undefined,
          undefined,
          position.quantity,
          state.availableQuantity(position.outcome),
          position.averagePrice,
          state.outcomePrices[position.outcome],
          new Decimal(state.outcomePrices[position.outcome])
            .sub(position.averagePrice)
            .mul(position.quantity)
            .toNumber(),
        ],
        cells: [
          <RoundSymbol round={state.round} outcome={position.outcome} />,
          <OutcomeBadge outcome={position.outcome} />,
          <TableNumber value={position.quantity} />,
          <TableNumber value={state.availableQuantity(position.outcome)} />,
          <TableNumber value={position.averagePrice} />,
          <TableNumber value={state.outcomePrices[position.outcome]} />,
          <Text.pnl dp={2} coloring>
            {new Decimal(state.outcomePrices[position.outcome])
              .sub(position.averagePrice)
              .mul(position.quantity)
              .toNumber()}
          </Text.pnl>,
          state.isRoundTradable
            ? formatCountdown(state.countdown)
            : t(`prediction.phase.${state.roundPhase}`),
          <SellPosition state={state} outcome={position.outcome} />,
        ],
      }))}
    />
  );
};

const PendingValue = ({
  state,
  order,
  field,
}: {
  state: PredictionState;
  order: PredictionState["openOrders"][number];
  field: "price" | "quantity";
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(String(order[field]));
  const [error, setError] = useState(false);
  return (
    <PopoverRoot
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setValue(String(order[field]));
        setError(false);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="text"
          color="secondary"
          size="xs"
          disabled={!state.isRoundTradable || state.isRegionRestricted}
        >
          {field === "quantity" ? "0 / " : ""}
          <TableNumber value={order[field]} />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="end" className="oui-w-64 oui-p-4">
        <Input value={value} onValueChange={setValue} />
        {error && <Text color="danger">{t("prediction.invalidOrder")}</Text>}
        <div className="oui-mt-3 oui-flex oui-justify-end oui-gap-2">
          <Button
            size="sm"
            variant="outlined"
            color="secondary"
            onClick={() => setOpen(false)}
          >
            {t("common.cancel")}
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (
                state.editPendingOrder(
                  order.id,
                  field === "price" ? Number(value) : order.price,
                  field === "quantity" ? Number(value) : order.quantity,
                )
              )
                setOpen(false);
              else setError(true);
            }}
          >
            {t("common.confirm")}
          </Button>
        </div>
      </PopoverContent>
    </PopoverRoot>
  );
};

export const PredictionOrderCell = ({
  state,
  order,
  field,
}: {
  state: PredictionState;
  order: PredictionState["openOrders"][number] & {
    status?: "filled" | "cancelled";
  };
  field: string;
}) => {
  const { t } = useTranslation();
  const { formatTableTime } = usePredictionFormatters();
  const pending = !order.status;
  const filled = order.status === "filled";
  switch (field) {
    case "symbol":
      return <PredictionOrderSymbol order={order} />;
    case "side":
      return <OutcomeBadge outcome={order.outcome} />;
    case "fill_quantity":
      return pending ? (
        <PendingValue state={state} order={order} field="quantity" />
      ) : (
        <span>
          <TableNumber value={filled ? order.quantity : 0} /> /{" "}
          <TableNumber value={order.quantity} />
        </span>
      );
    case "quantity":
      return <TableNumber value={order.quantity} />;
    case "price":
      return pending ? (
        <PendingValue state={state} order={order} field="price" />
      ) : order.type === "market" ? (
        t("common.market")
      ) : (
        <TableNumber value={order.price} />
      );
    case "average_executed_price":
      return filled ? <TableNumber value={order.price} /> : "--";
    case "executed":
    case "notional":
      return (
        <TableNumber
          value={new Decimal(pending || filled ? order.quantity : 0)
            .mul(order.price)
            .toNumber()}
          dp={2}
          suffix="USDC"
        />
      );
    case "status":
      return t(
        pending
          ? "orders.status.pending"
          : filled
            ? "prediction.status.filled"
            : "prediction.status.cancelled",
      );
    case "created_time":
      return formatTableTime(order.timestamp);
    case "action":
      return pending ? (
        <Button
          size="sm"
          variant="outlined"
          color="secondary"
          disabled={state.isRegionRestricted}
          onClick={() => state.cancelOrder(order.id)}
        >
          {t("common.cancel")}
        </Button>
      ) : null;
    default:
      return "--";
  }
};

export const PredictionOrdersTable = ({
  state,
  mode,
  status,
  leadingFilterItems,
  onLeadingFilter,
}: {
  state: PredictionState;
  mode: "pending" | "filled" | "history";
  status?: "cancelled" | "unsupported";
  leadingFilterItems?: DataFilterItem[];
  onLeadingFilter?: (filter: { name: string; value: unknown }) => void;
}) => {
  const { t } = useTranslation();
  const pending = mode === "pending";
  const filters = usePredictionFilters(mode === "history");
  const orderColumns = useOrderColumn({
    _type: pending
      ? TabType.pending
      : mode === "filled"
        ? TabType.filled
        : TabType.all,
    includePrediction: true,
  });
  const records = pending
    ? state.openOrders
    : mode === "filled"
      ? state.history.filter((order) => order.status === "filled")
      : [...state.openOrders, ...state.history];
  return (
    <PredictionDataTable
      columns={orderColumns.map((column) =>
        tableColumn(column.title, Number(column.width ?? 130), {
          fixed:
            column.fixed === "left"
              ? "start"
              : column.fixed === "right"
                ? "end"
                : column.fixed,
          align: column.align,
          type: column.type === "action" ? "action" : "data",
        }),
      )}
      toolbar={
        <PredictionFilters
          filters={filters}
          mode={mode}
          leadingItems={leadingFilterItems}
          onLeadingFilter={onLeadingFilter}
          trailing={
            pending ? (
              <Button
                size="xs"
                variant="outlined"
                color="secondary"
                disabled={!state.openOrders.length || state.isRegionRestricted}
                onClick={state.cancelAllOrders}
              >
                {t("orders.cancelAll")}
              </Button>
            ) : undefined
          }
        />
      }
      rows={records
        .filter(
          (order) =>
            !status ||
            (status === "cancelled" &&
              "status" in order &&
              order.status === "cancelled"),
        )
        .filter((order) =>
          filters.matches({
            ...order,
            status: "status" in order ? String(order.status) : "pending",
          }),
        )
        .map((order) => ({
          id: String(order.id),
          cells: orderColumns.map((column) => (
            <PredictionOrderCell
              key={String(column.dataIndex)}
              state={state}
              order={order}
              field={String(column.dataIndex)}
            />
          )),
        }))}
    />
  );
};

type ProductOrderMode = "pending" | "filled" | "history";
type ProductOrderInstrument = "all" | ProductType;

const AllProductOrdersTable: React.FC<{
  state: PredictionState;
  mode: ProductOrderMode;
  includePrediction: boolean;
  productFilterItems: DataFilterItem[];
  onProductFilter: (filter: { name: string; value: unknown }) => void;
}> = ({
  state,
  mode,
  includePrediction,
  productFilterItems,
  onProductFilter,
}) => {
  const pending = mode === "pending";
  const type = pending
    ? TabType.pending
    : mode === "filled"
      ? TabType.filled
      : TabType.orderHistory;
  const orderListState = useOrderListScript({
    type,
    ordersStatus: pending
      ? OrderStatus.INCOMPLETE
      : mode === "filled"
        ? OrderStatus.FILLED
        : undefined,
  });
  const predictionOrders = pending
    ? state.openOrders
    : mode === "filled"
      ? state.history.filter((order) => order.status === "filled")
      : [...state.openOrders, ...state.history];

  return (
    <DesktopOrderList
      {...orderListState}
      additionalFilterItems={productFilterItems}
      onAdditionalFilter={onProductFilter}
      supplementalRows={
        includePrediction
          ? predictionOrders.map((order) => ({
              id: `prediction-${order.id}`,
              timestamp: order.timestamp,
              renderCell: (field) => (
                <PredictionOrderCell
                  state={state}
                  order={order}
                  field={field}
                />
              ),
            }))
          : undefined
      }
    />
  );
};

export const SharedProductOrdersPanel: React.FC<{
  state: PredictionState;
  mode: ProductOrderMode;
}> = ({ state, mode }) => {
  const { t } = useTranslation();
  const [instrument, setInstrument] = useState<ProductOrderInstrument>("all");
  const productFilterItems: DataFilterItem[] = [
    {
      type: "select",
      name: "instrument",
      value: instrument,
      options: [
        { label: t("prediction.filter.allInstruments"), value: "all" },
        { label: t("common.perps"), value: "perps" },
        { label: t("prediction.title"), value: "prediction" },
      ],
    },
  ];
  const onProductFilter = ({ value }: { name: string; value: unknown }) => {
    if (value === "all" || value === "perps" || value === "prediction") {
      setInstrument(value);
    }
  };

  const content =
    instrument === "prediction" ? (
      <PredictionOrdersTable
        state={state}
        mode={mode}
        leadingFilterItems={productFilterItems}
        onLeadingFilter={onProductFilter}
      />
    ) : (
      <AllProductOrdersTable
        state={state}
        mode={mode}
        includePrediction={instrument === "all"}
        productFilterItems={productFilterItems}
        onProductFilter={onProductFilter}
      />
    );

  // Clip to the tab pane so only DataTable's internal scrollbar appears.
  return (
    <div className="oui-flex oui-h-full oui-min-h-0 oui-flex-col oui-overflow-hidden">
      {content}
    </div>
  );
};

const PredictionHistoryTable = ({
  state,
  leadingFilterItems,
  onLeadingFilter,
}: {
  state: PredictionState;
  leadingFilterItems?: DataFilterItem[];
  onLeadingFilter?: (filter: { name: string; value: unknown }) => void;
}) => {
  const { t } = useTranslation();
  const { formatTableTime } = usePredictionFormatters();
  const filters = usePredictionFilters(true);
  return (
    <PredictionDataTable
      toolbar={
        <PredictionFilters
          filters={filters}
          mode="settlements"
          leadingItems={leadingFilterItems}
          onLeadingFilter={onLeadingFilter}
        />
      }
      columns={[
        tableColumn(t("common.symbol"), 250, { fixed: "start" }),
        tableColumn(t("prediction.outcome"), 100),
        tableColumn(t("prediction.closedQuantity"), 130),
        tableColumn(t("prediction.avgEntryPrice"), 140),
        tableColumn(t("prediction.exitSettlementPrice"), 170),
        tableColumn(t("prediction.result"), 130),
        tableColumn(t("positions.history.column.netPnl"), 140, {
          sortable: true,
        }),
        tableColumn(t("prediction.closedSettledTime"), 180, { sortable: true }),
      ]}
      rows={state.settlements
        .filter((record) =>
          filters.matches({
            outcome: record.outcome,
            status: record.result === "closed" ? "closed" : "settled",
            timestamp: record.settledAt,
          }),
        )
        .map((record) => ({
          id: String(record.id),
          sortValues: [
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            record.pnl,
            record.settledAt,
          ],
          cells: [
            <RoundSymbol round={record.round} outcome={record.outcome} />,
            <OutcomeBadge outcome={record.outcome} />,
            <TableNumber value={record.quantity} />,
            <TableNumber value={record.averagePrice} />,
            <div>
              <TableNumber value={record.settlementPrice} />
              <div className="oui-text-base-contrast-54">
                {t(
                  record.result === "closed"
                    ? "prediction.exitPrice"
                    : "prediction.settlementPrice",
                )}
              </div>
            </div>,
            record.result === "closed" ? (
              t("prediction.closed")
            ) : (
              <OutcomeBadge outcome={record.result ?? record.outcome} />
            ),
            <Text.pnl dp={2} coloring>
              {record.pnl}
            </Text.pnl>,
            formatTableTime(record.settledAt),
          ],
        }))}
    />
  );
};

/* eslint-enable react/jsx-key */
