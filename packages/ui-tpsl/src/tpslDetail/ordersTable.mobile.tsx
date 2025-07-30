import { useMemo, useState } from "react";
import { API, PositionType } from "@orderly.network/types";
import { Flex, Button, cn, ThrottledButton, toast } from "@orderly.network/ui";
import { AuthGuardDataTable } from "@orderly.network/ui-connector";
import { useColumn } from "./useColum";

export const OrdersTableMobile = (props: {
  orders: API.AlgoOrder[];
  editTPSLOrder: (order: API.AlgoOrder) => void;
  canCancelOrder: (order: API.AlgoOrder) => Promise<void>;
}) => {
  const { orders, editTPSLOrder } = props;
  const columns = useColumn({ onCancelOrder: () => Promise.resolve() });
  const orderIds = useMemo(() => {
    return orders.reduce(
      (acc, curr) => {
        acc[curr.algo_order_id] = true;
        return acc;
      },
      {} as Record<string, boolean>,
    );
  }, [orders]);
  return (
    <AuthGuardDataTable
      columns={columns}
      dataSource={orders}
      expanded={orderIds}
      bordered
      getRowCanExpand={() => true}
      expandRowRender={(row) => {
        return (
          <Flex gap={2} justify={"end"}>
            <Button
              variant="outlined"
              size="sm"
              color="gray"
              className="oui-h-6 oui-text-2xs oui-text-base-contrast-54"
              onClick={() => props.editTPSLOrder(row.original)}
            >
              Edit
            </Button>
            <DeleteBtn
              order={row.original}
              onCancelOrder={props.canCancelOrder}
            />
          </Flex>
        );
      }}
      className="oui-px-2 oui-bg-transparent oui-text-2xs"
      classNames={{
        scroll: cn(
          !orders || orders.length === 0
            ? "!oui-min-h-[170px]"
            : "!oui-min-h-[100px]",
        ),
      }}
      onRow={(record, index) => {
        return {
          className: cn(
            "oui-h-[53px] oui-cursor-svg-edit !oui-p-0 !oui-border-none",
          ),
        };
      }}
      generatedRowKey={(record) => record.algo_order_id}
    />
  );
};

export const DeleteBtn = (props: {
  order: API.AlgoOrder;
  onCancelOrder?: (order: API.AlgoOrder) => Promise<void>;
}) => {
  const [loading, setLoading] = useState(false);
  return (
    <ThrottledButton
      className="oui-text-2xs oui-text-base-contrast-54 oui-h-6"
      size="sm"
      loading={loading}
      variant="outlined"
      color="gray"
      onClick={(e) => {
        e.stopPropagation();
        console.log("delete");
        setLoading(true);
        props
          .onCancelOrder?.(props.order)
          .then(
            () => {},
            (error) => {
              toast.error(error.message);
            },
          )
          .finally(() => {
            setLoading(false);
          });
      }}
    >
      Delete
    </ThrottledButton>
  );
};
