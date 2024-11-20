import { FC } from "react";
import {
  Flex,
  Pagination,
  Filter,
  ListView,
  Button,
  Grid,
  Picker,
  DataFilter,
  cn,
} from "@orderly.network/ui";
import { OrdersBuilderState } from "./orderList.script";
import { AuthGuardTableView } from "@orderly.network/ui-connector";
import { grayCell } from "../../utils/util";
import { SymbolProvider } from "./symbolProvider";
import { OrderListProvider } from "./orderListContext";
import { TabType } from "../orders.widget";
import { TPSLOrderRowProvider } from "./tpslOrderRowContext";
import { useOrderColumn } from "./desktop/useColumn";
import { OrderCellWidget } from "./mobile";

export const DesktopOrderList: FC<OrdersBuilderState> = (props) => {
  const columns = useOrderColumn({
    _type: props.type,
    onSymbolChange: props.onSymbolChange,
    pnlNotionalDecimalPrecision: props.pnlNotionalDecimalPrecision,
  });
  return (
    <OrderListProvider
      cancelOrder={props.cancelOrder}
      editOrder={props.updateOrder}
      cancelAlgoOrder={props.cancelAlgoOrder}
      editAlgoOrder={props.updateAlgoOrder}
      // cancelTPSLOrder={props.cancelTPSLOrder}
    >
      <Flex direction="column" width="100%" height="100%" itemAlign="start">
        {/* <Divider className="oui-w-full" /> */}
        {props.filterItems.length > 0 && (
          <DataFilter
            items={props.filterItems}
            onFilter={(value: any) => {
              props.onFilter(value);
            }}
            // className="oui-px-3"
            trailing={
              [TabType.pending, TabType.tp_sl].includes(props.type) && (
                <CancelAll {...props} />
              )
            }
          />
        )}
        <AuthGuardTableView
          columns={columns}
          loading={props.isLoading}
          dataSource={props.dataSource}
          bordered
          ignoreLoadingCheck={true}
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
                  : "oui-text-base-contrast-80"
              ),
            };
          }}
          generatedRowKey={(record, index) =>
            `${props.type}${index}${
              record.order_id || record.algo_order_id
            }_index${index}`
          }
          renderRowContainer={(record: any, index, children) => {
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
          pagination={props.pagination}
          manualPagination={props.manualPagination}
        />
      </Flex>
    </OrderListProvider>
  );
};

export const MobileOrderList: FC<
  OrdersBuilderState & {
    classNames?: {
      root?: string;
      cell?: string;
      content?: string;
    };
    showFilter?: boolean;
  }
> = (props) => {
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
        className="oui-grid-rows-[auto,1fr] oui-w-full"
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
          <Flex gap={2} p={2} className="oui-bg-base-9 oui-rounded-b-xl">
            {props.filterItems.map((item) => {
              // not support range type
              if (item.type !== "select") return <></>;
              return (
                <Picker
                  options={item.options}
                  size={"sm"}
                  value={item.value}
                  className="oui-text-2xs oui-text-base-contrast-54 "
                  placeholder={
                    item.name === "side"
                      ? "All sides"
                      : item.name === "status"
                      ? "All status"
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
              />
            );
            if (props.type === TabType.tp_sl) {
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

const CancelAll: FC<OrdersBuilderState> = (props) => {
  return (
    <Button
      variant="outlined"
      color="secondary"
      size="xs"
      disabled={(props.dataSource?.length ?? 0) == 0}
      className="disabled:oui-bg-transport"
      onClick={(e) => props.onCancelAll()}
    >
      Cancel all
    </Button>
  );
};
