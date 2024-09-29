import { FC } from "react";
import { Divider, Flex, Text, Pagination, Filter } from "@orderly.network/ui";
import { OrdersBuilderState } from "./orderList.script";
import { AuthGuardDataTable } from "@orderly.network/ui-connector";
import { grayCell } from "../../utils/util";
import { SymbolProvider } from "./symbolProvider";
import { OrderListProvider } from "./orderListContext";
import { TabType } from "../orders.widget";
import { TPSLOrderRowProvider } from "./tpslOrderRowContext";
import { useOrderColumn } from "./desktop/useColumn";

export const DesktopOrderList: FC<OrdersBuilderState> = (props) => {
  const columns = useOrderColumn(props.type);
  return (
    <OrderListProvider
      cancelOrder={props.cancelOrder}
      editOrder={props.updateOrder}
      cancelAlgoOrder={props.cancelAlgoOrder}
      editAlgoOrder={props.updateAlgoOrder}
      // cancelTPSLOrder={props.cancelTPSLOrder}
    >
      <Flex direction={"column"} width={"100%"} itemAlign={"start"}>
        {/* <Divider className="oui-w-full" /> */}
        <AuthGuardDataTable
          columns={columns}
          loading={props.isLoading}
          dataSource={props.dataSource}
          ignoreLoadingCheck={true}
          classNames={{
            root: "oui-items-start",
          }}
          onRow={(record, index) => {
            return {
              className: grayCell(record) ? "oui-text-base-contrast-20" : "",
            };
          }}
          generatedRowKey={(record, index) =>
            `${props.type}${index}${
              record.order_id || record.algo_order_id
            }_index${index}`
          }
          renderRowContainer={(record: any, index, children) => {
            if (props.type === TabType.tp_sl) {
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
        >
          {props.filterItems.length > 0 && (
            <Filter
              items={props.filterItems}
              onFilter={(value: any) => {
                props.onFilter(value);
              }}
            />
          )}

          <Pagination
            {...props.meta}
            onPageChange={props.setPage}
            onPageSizeChange={props.setPageSize}
          />
        </AuthGuardDataTable>
      </Flex>
    </OrderListProvider>
  );
};


export const MobileOrderList: FC<OrdersBuilderState> = (props) => {
  const columns = useOrderColumn(props.type);
  return (
    <OrderListProvider
      cancelOrder={props.cancelOrder}
      editOrder={props.updateOrder}
      cancelAlgoOrder={props.cancelAlgoOrder}
      editAlgoOrder={props.updateAlgoOrder}
      // cancelTPSLOrder={props.cancelTPSLOrder}
    >
      <Flex direction={"column"} width={"100%"} itemAlign={"start"}>
        {/* <Divider className="oui-w-full" /> */}
        <AuthGuardDataTable
          columns={columns}
          loading={props.isLoading}
          dataSource={props.dataSource}
          ignoreLoadingCheck={true}
          classNames={{
            root: "oui-items-start",
          }}
          onRow={(record, index) => {
            return {
              className: grayCell(record) ? "oui-text-base-contrast-20" : "",
            };
          }}
          generatedRowKey={(record, index) =>
            `${props.type}${index}${
              record.order_id || record.algo_order_id
            }_index${index}`
          }
          renderRowContainer={(record: any, index, children) => {
            if (props.type === TabType.tp_sl) {
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
        >
          {props.filterItems.length > 0 && (
            <Filter
              items={props.filterItems}
              onFilter={(value: any) => {
                props.onFilter(value);
              }}
            />
          )}

          <Pagination
            {...props.meta}
            onPageChange={props.setPage}
            onPageSizeChange={props.setPageSize}
          />
        </AuthGuardDataTable>
      </Flex>
    </OrderListProvider>
  );
};
