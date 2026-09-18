import { FC, ReactNode, useEffect, useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import type { API } from "@orderly.network/types";
import {
  Flex,
  ListView,
  Button,
  Grid,
  Picker,
  DataFilter,
  cn,
  TableFeatures,
  DataTable,
  type DataFilterItem,
} from "@orderly.network/ui";
import { AuthGuardDataTable } from "@orderly.network/ui-connector";
import { formatSymbol } from "@orderly.network/utils";
import { grayCell } from "../../utils/util";
import { TabType } from "../orders.widget";
import { SymbolProvider } from "../provider/symbolProvider";
import { useOrderColumn } from "./desktop/useColumn";
import { OrderCellWidget } from "./mobile";
import { OrdersBuilderState } from "./orderList.script";
import { OrderListProvider } from "./orderListProvider";
import { TPSLOrderRowProvider } from "./tpslOrderRowContext";

const getOrderRowKey = <T extends API.Order | API.AlgoOrder>(item: T) =>
  item.algo_order_id !== undefined
    ? `algo-${item.algo_order_id}`
    : `order-${(item as API.Order).order_id}`;

export const DesktopOrderList: FC<
  OrdersBuilderState & {
    testIds?: { tableBody?: string };
    supplementalRows?: Array<{
      id: string;
      timestamp: number;
      renderCell: (field: string) => ReactNode;
      plainText?: (field: string) => string;
    }>;
    useClientTable?: boolean;
    cancelAllDisabled?: boolean;
    additionalFilterItems?: DataFilterItem[];
    onAdditionalFilter?: (filter: { name: string; value: unknown }) => void;
  }
> = (props) => {
  const { sharePnLConfig, ...rest } = props;
  const columns = useOrderColumn({
    _type: props.type,
    onSymbolChange: props.onSymbolChange,
    pnlNotionalDecimalPrecision: props.pnlNotionalDecimalPrecision,
    sharePnLConfig,
    symbolsInfo: props.symbolsInfo,
    includePrediction: !!props.supplementalRows,
  });

  const [page, setPage] = useState(1);
  const mergedRows = props.supplementalRows
    ? [
        ...(props.dataSource ?? []),
        ...props.supplementalRows.map((row) => ({
          __supplemental: row,
          created_time: row.timestamp,
          order_id: row.id,
        })),
      ].sort(
        (a, b) => Number(b.created_time ?? 0) - Number(a.created_time ?? 0),
      )
    : props.dataSource;
  useEffect(
    () => setPage(1),
    [props.type, props.filterItems, props.supplementalRows?.length],
  );
  const mergedColumns = props.supplementalRows
    ? columns.map((column) => ({
        ...column,
        render: (value: any, record: any, index: number, context: any) =>
          record.__supplemental
            ? record.__supplemental.renderCell(String(column.dataIndex))
            : typeof column.render === "function"
              ? column.render(value, record, index, context)
              : value,
        renderPlantText: (
          value: any,
          record: any,
          index: number,
          context: any,
        ) =>
          record.__supplemental
            ? (record.__supplemental.plainText?.(String(column.dataIndex)) ??
              "")
            : column.renderPlantText
              ? column.renderPlantText(value, record, index, context)
              : String(value ?? ""),
      }))
    : columns;
  const TableComponent = props.useClientTable ? DataTable : AuthGuardDataTable;
  return (
    <OrderListProvider
      cancelOrder={props.cancelOrder}
      editOrder={props.updateOrder}
      cancelAlgoOrder={props.cancelAlgoOrder}
      editAlgoOrder={props.updateAlgoOrder}
      // cancelTPSLOrder={props.cancelTPSLOrder}
    >
      <Flex direction="column" width="100%" height="100%" itemAlign="start">
        {[...(props.additionalFilterItems ?? []), ...props.filterItems].length >
          0 && (
          <DataFilter
            items={[
              ...(props.additionalFilterItems ?? []),
              ...props.filterItems,
            ]}
            onFilter={(filter: any) => {
              if (
                props.additionalFilterItems?.some(
                  (item) => item.name === filter.name,
                )
              ) {
                props.onAdditionalFilter?.(filter);
                return;
              }
              props.onFilter(filter);
            }}
            trailing={
              [TabType.pending, TabType.tp_sl].includes(props.type) && (
                <CancelAll {...props} disabled={props.cancelAllDisabled} />
              )
            }
          />
        )}
        <TableComponent
          columns={mergedColumns as any}
          loading={props.isLoading}
          dataSource={mergedRows as any}
          bordered
          ignoreLoadingCheck={true}
          testIds={{
            body: props.testIds?.tableBody,
          }}
          classNames={{
            header: "oui-h-[38px]",
            root: "oui-items-start !oui-h-[calc(100%_-_49px)]",
          }}
          onRow={(record, index) => {
            return {
              className: cn(
                "oui-h-[48px]",
                grayCell(record)
                  ? "oui-text-base-contrast-20"
                  : "oui-text-base-contrast-80",
              ),
            };
          }}
          generatedRowKey={getOrderRowKey}
          renderRowContainer={(record: any, index, children) => {
            if (record.__supplemental) return children;
            if (
              props.type === TabType.tp_sl ||
              props.type === TabType.pending
            ) {
              children = (
                <TPSLOrderRowProvider order={record}>
                  {children}
                </TPSLOrderRowProvider>
              );
            }

            return (
              <SymbolProvider symbol={record.symbol}>{children}</SymbolProvider>
            );
          }}
          pagination={
            props.supplementalRows
              ? {
                  page,
                  pageSize: 20,
                  count: mergedRows?.length ?? 0,
                  onPageChange: setPage,
                }
              : props.pagination
          }
          manualPagination={
            props.supplementalRows ? false : props.manualPagination
          }
          features={[TableFeatures.DownloadFeature]}
          getTableInstance={(table) => {
            props.tableInstance.current = table;
          }}
        />
      </Flex>
    </OrderListProvider>
  );
};

export const MobileOrderList: FC<
  OrdersBuilderState & {
    classNames?: { root?: string; cell?: string; content?: string };
    showFilter?: boolean;
  }
> = (props) => {
  const { t } = useTranslation();

  return (
    <OrderListProvider
      cancelOrder={props.cancelOrder}
      editOrder={props.updateOrder}
      cancelAlgoOrder={props.cancelAlgoOrder}
      editAlgoOrder={props.updateAlgoOrder}
      // cancelTPSLOrder={props.cancelTPSLOrder}
    >
      <Grid
        cols={1}
        rows={2}
        className="oui-w-full oui-grid-rows-[auto,1fr]"
        gap={2}
      >
        {/* <Filter
          items={props.filterItems}
          onFilter={(value: any) => {
            props.onFilter(value);
          }}
          className="oui-px-3"
          
        /> */}

        {props.showFilter ? (
          <Flex gap={2} p={2} className="oui-rounded-b-xl oui-bg-base-9">
            {props.filterItems.map((item) => {
              // not support range type
              if (item.type !== "select") {
                return null;
              }
              return (
                <Picker
                  key={`item-${item.name}`}
                  options={item.options}
                  size={"sm"}
                  value={item.value}
                  className="oui-text-2xs oui-text-base-contrast-54 "
                  placeholder={
                    item.name === "side"
                      ? t("common.side.all")
                      : item.name === "status"
                        ? t("common.status.all")
                        : ""
                  }
                  onValueChange={(value) => {
                    //
                    props.onFilter?.({ name: item.name, value: value });
                  }}
                />
              );
            })}
          </Flex>
        ) : (
          <div></div>
        )}
        <ListView
          className={props.classNames?.root}
          contentClassName={props.classNames?.content}
          dataSource={props.dataSource}
          keyExtractor={getOrderRowKey}
          loadMore={props.loadMore}
          isLoading={props.isLoading}
          renderItem={(item, index) => {
            let children = (
              <OrderCellWidget
                item={item}
                index={index}
                className={props.classNames?.cell}
                type={props.type}
                onSymbolChange={props.onSymbolChange}
                sharePnLConfig={props.sharePnLConfig}
              />
            );
            if ([TabType.tp_sl, TabType.pending].includes(props.type)) {
              children = (
                <TPSLOrderRowProvider order={item}>
                  {children}
                </TPSLOrderRowProvider>
              );
            }
            return (
              <SymbolProvider symbol={item.symbol}>{children}</SymbolProvider>
            );
          }}
        />
      </Grid>
    </OrderListProvider>
  );
};

const CancelAll: FC<OrdersBuilderState & { disabled?: boolean }> = (props) => {
  const { t } = useTranslation();
  const { symbol } = props;

  const formattedSymbol = symbol ? formatSymbol(symbol, "base") : symbol;

  return (
    <Button
      variant="outlined"
      color="secondary"
      size="xs"
      disabled={props.disabled ?? (props.dataSource?.length ?? 0) == 0}
      className="disabled:oui-bg-transport"
      onClick={(e) => props.onCancelAll()}
      data-testid={`oui-testid-dataList-${props.type.toLowerCase()}-cancelAll-button`}
    >
      {symbol
        ? t("orders.cancelAll.ofSymbol", { symbol: formattedSymbol })
        : t("orders.cancelAll")}
    </Button>
  );
};
