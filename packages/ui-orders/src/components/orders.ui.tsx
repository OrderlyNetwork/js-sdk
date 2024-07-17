import { DataTable } from "@orderly.network/ui";
import { useOrderColumn } from "./useColumn";
import { OrderStatus, API } from "@orderly.network/types";
import { OrdersBuilderState } from "./useBuilder.script";

export const Orders = (props: OrdersBuilderState) => {
  const { ordersStatus, dataSource, isLoading } = props;

  return (
    <OrderTable
      status={ordersStatus}
      dataSource={dataSource}
      isLoading={isLoading}
    />
  );
};
// ----------------- Orders ui component end -----------------

type OrderTableProps = {
  status: OrderStatus;
  dataSource: API.OrderExt[] | null;
  isLoading?: boolean;
};

// ----------------- OrderTable start -----------------
const OrderTable = (props: OrderTableProps) => {
  const colums = useOrderColumn(props.status);

  return (
    <DataTable
      columns={colums}
      dataSource={props.dataSource}
      loading={props.isLoading}
    />
  );
};
// ----------------- OrderTable end -----------------
