import { FC } from "react";
import { Divider, Flex, Text } from "@orderly.network/ui";
import { OrdersBuilderState } from "./orderList.script";
import { AuthGuardDataTable } from "@orderly.network/ui-connector";
import { useOrderColumn } from "./useColumn";
import { grayCell } from "../../utils/util";
import { SymbolProvider } from "./symbolProvider";
import { OrderListProvider } from "./orderListContext";

export const OrderList: FC<OrdersBuilderState> = (props) => {
  const columns = useOrderColumn(props.type);

  console.log("order list", props.dataSource, columns);
  
  return (
    <OrderListProvider
      cancelOrder={props.cancelOrder}
      editOrder={props.updateOrder}
      cancelAlgoOrder={props.cancelAlgoOrder}
      editAlgoOrder={props.updateAlgoOrder}
      // cancelTPSLOrder={props.cancelTPSLOrder}
    >
      <Flex direction={"column"} width={"100%"}>
        <Divider className="oui-w-full" />
        <AuthGuardDataTable
          columns={columns}
          loading={props.isLoading}
          dataSource={props.dataSource}
          onRow={(record, index) => {
            return {
              className: grayCell(record) ?  "oui-text-base-contrast-20" : ''
            }
          }}
          generatedRowKey={(record, index) =>
            `${props.type}${index}${record.order_id || record.algo_order_id}`
          }
          renderRowContainer={(record, index, children) => {
            return (
              <SymbolProvider
                key={index}
                symbol={record.symbol}
                children={children}
              />
            );
          }}
        ></AuthGuardDataTable>
      </Flex>
    </OrderListProvider>
  );
};
