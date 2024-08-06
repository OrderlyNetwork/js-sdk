import { FC } from "react";
import { Divider, Flex, Text } from "@orderly.network/ui";
import { OrdersBuilderState } from "./orderList.script";
import { AuthGuardDataTable } from "@orderly.network/ui-connector";
import { useOrderColumn } from "./useColumn";

export const OrderList: FC<OrdersBuilderState> = (props) => {
  const columns = useOrderColumn(props.type);

  console.log("order list", props.dataSource, columns);
  

  return (
    <Flex direction={"column"} width={"100%"}>
      <Divider className="oui-w-full" />
      <AuthGuardDataTable
        columns={columns}
        dataSource={props.dataSource}
      ></AuthGuardDataTable>
    </Flex>
  );
};
