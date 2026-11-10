import { useEffect } from "react";
import { useOrderStream } from "@orderly.network/hooks";
import { AlgoOrderRootType, API, OrderStatus } from "@orderly.network/types";
import {
  registerSimpleDialog,
  registerSimpleSheet,
  SimpleDialog,
  SimpleSheet,
} from "@orderly.network/ui";
import { useEditBracketOrder } from "./editBracketOrder.script";
import { EditBracketOrderUI } from "./editBracketOrder.ui";

export const EditBracketOrderWidget = (props: {
  order: API.AlgoOrderExt;
  close?: () => void;
}) => {
  const state = useEditBracketOrder({ order: props.order });
  return <EditBracketOrderUI {...state} onClose={props.close} />;
};

export const EditBracketOrderModal = ({
  mode,
  open,
  onOpenChange,
  order,
}: {
  mode: "dialog" | "sheet";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: API.AlgoOrderExt;
}) => {
  const content = open ? (
    <EditBracketOrderWidget
      key={order.algo_order_id}
      order={order}
      close={() => onOpenChange(false)}
    />
  ) : null;

  if (mode === "sheet") {
    return (
      <SimpleSheet open={open} onOpenChange={onOpenChange}>
        {content}
      </SimpleSheet>
    );
  }
  return (
    <SimpleDialog
      open={open}
      onOpenChange={onOpenChange}
      classNames={{ content: "oui-w-[420px]" }}
    >
      {content}
    </SimpleDialog>
  );
};

export const EditBracketOrderSheetId = "EditBracketOrderSheetId";
export const EditBracketOrderDialogId = "EditBracketOrderDialogId";

const LiveEditBracketOrderWidget = ({
  order,
  close,
}: Parameters<typeof EditBracketOrderWidget>[0]) => {
  const [orders, { isLoading, isValidating, error, hasMore, loadMore }] =
    useOrderStream(
      {
        symbol: order.symbol,
        status: OrderStatus.INCOMPLETE,
        includes: [AlgoOrderRootType.BRACKET],
      },
      { stopOnUnmount: true },
    );
  const latest = orders?.find(
    (item) =>
      "algo_order_id" in item &&
      Number(item.algo_order_id) === Number(order.algo_order_id),
  ) as API.AlgoOrderExt | undefined;

  useEffect(() => {
    if (isLoading || isValidating || error || !orders || latest) return;
    if (hasMore) {
      void loadMore();
    } else {
      close?.();
    }
  }, [
    isLoading,
    isValidating,
    error,
    orders,
    latest,
    hasMore,
    loadMore,
    close,
  ]);

  return latest ? (
    <EditBracketOrderWidget order={latest} close={close} />
  ) : null;
};

registerSimpleSheet(EditBracketOrderSheetId, LiveEditBracketOrderWidget);

registerSimpleDialog(EditBracketOrderDialogId, LiveEditBracketOrderWidget, {
  classNames: {
    content: "oui-w-[420px]",
  },
});
