import { API } from "@orderly.network/types";
import { cn } from "@orderly.network/ui";
import { AuthGuardDataTable } from "@orderly.network/ui-connector";
import { useColumn } from "./useColum";

export const OrdersTable = (props: {
  orders: API.AlgoOrder[];
  editTPSLOrder: (order: API.AlgoOrder) => void;
  onCancelOrder: (order: API.AlgoOrder) => Promise<void>;
}) => {
  const { orders } = props;
  const columns = useColumn({ onCancelOrder: props.onCancelOrder });
  return (
    <AuthGuardDataTable
      columns={columns}
      dataSource={orders}
      className="oui-bg-transparent oui-text-2xs"
      bordered
      classNames={{
        scroll: cn(
          !orders || orders.length === 0
            ? "!oui-min-h-[170px]"
            : "!oui-min-h-[100px]",
        ),
      }}
      onRow={(record) => {
        return {
          className: cn(
            "oui-h-[53px] oui-cursor-svg-edit !oui-border-none !oui-p-0",
          ),
          onClick: () => {
            props.editTPSLOrder(record);
          },
        };
      }}
    />
  );
};
