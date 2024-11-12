import { FC, useEffect, useMemo, useState } from "react";
import { TPSLForm } from "@/block/tp_sl/tpAndslForm";
import {
  useLocalStorage,
  useTPSLOrder,
  useMediaQuery,
  useDebouncedCallback,
} from "@orderly.network/hooks";
import {
  MEDIA_TABLET,
  type API,
  AlgoOrderRootType,
} from "@orderly.network/types";
import { toast } from "@/toast";
import { AlgoOrderConfirmView } from "./algoOrderConfirmView";
import { SimpleDialog } from "@/dialog/simpleDialog";
import { AlgoOrderEntity } from "@orderly.network/types";
import { cn } from "@/utils";

export const TPSLEditor: FC<{
  symbol: string;
  /**
   * The maximum quantity that can be set for the TP/SL order
   */
  maxQty: number;
  onSuccess?: () => void;
  onCancel?: () => void;
  position: API.Position;
  order?: API.AlgoOrder;
  canModifyQty?: boolean;
  isEditing?: boolean;
  onTypeChange?: (type: AlgoOrderRootType) => void;
  quoteDp?: number;
}> = (props) => {
  const { symbol, maxQty, quoteDp } = props;
  const [orderEntity, setOrderEntity] =
    useState<Partial<AlgoOrderEntity> | null>();
  const [open, setOpen] = useState(false);

  const [order, { submit, setValue, validate, errors }] = useTPSLOrder(
    {
      symbol,
      position_qty: props.position.position_qty,
      average_open_price: props.position.average_open_price,
    },
    {
      defaultOrder: props.order,
    }
  );
  const [showError, setShowError] = useState(false);

  const isTablet = useMediaQuery(MEDIA_TABLET);

  const [needConfirm, setNeedConfirm] = useLocalStorage(
    "orderly_order_confirm",
    true
  );

  const [mode, setMode] = useState<"delete" | "create" | "update">("delete");

  const title = useMemo(() => {
    if (mode === "delete") {
      return "Cancel order";
    } else if (mode === "create") {
      return "Confirm Order";
    } else {
      return "Edit Order";
    }
  }, [mode]);

  const onSubmit = useDebouncedCallback(() => {
    return submit().then(
      () => {
        setOpen(false);
        props.onSuccess?.();
      },
      (error) => {
        toast.error(error.message);
      }
    );
  }, 500, {
    leading: true, trailing: false
  });

  useEffect(() => {
    let type: AlgoOrderRootType;

    if (order.quantity === maxQty) {
      type = AlgoOrderRootType.POSITIONAL_TP_SL;
    } else {
      type = AlgoOrderRootType.TP_SL;
    }

    props.onTypeChange?.(type);
  }, [order.quantity, maxQty]);

  const onConfirm = () => {
    // check the order status, if it is a new order, then create it, otherwise update it,
    // if the quantity is not equal to the position quantity, then create new TP/SL order
    return Promise.resolve()
      .then(() => {
        return validate();
      })
      .then(
        (orderEntity) => {
          // console.log("order", order, symbol, orderEntity);
          if (needConfirm) {
            const isRemove = !order.tp_trigger_price && !order.sl_trigger_price;
            if (isRemove) {
              setMode("delete");
            } else if (
              !!order.algo_order_id &&
              order.algo_type === orderEntity.algo_type
            ) {
              setMode("update");
            } else {
              setMode("create");
            }
            setOrderEntity(orderEntity);
            setOpen(true);
            return false;
          }
          return true;
        },
        (error) => {
          // console.log(error);
          setShowError(true);
          return false;
        }
      )
      .then((pass) => {
        if (pass) {
          return onSubmit();
        }
      });
  };

  useEffect(() => {
    return () => {
      setOpen(false);
    };
  }, []);

  return (
    <div id="orderly-tp_sl-order-edit-content">
      <TPSLForm
        className={open ? "orderly-hidden" : ""}
        maxQty={maxQty}
        onChange={setValue}
        symbol={symbol}
        onSubmit={onConfirm}
        onCancel={props.onCancel}
        order={order}
        canModifyQty={props.canModifyQty}
        isEditing={props.isEditing}
        oldOrder={props.order}
        errors={showError ? errors : null}
      />
      {mode === "delete" ? (
        <SimpleDialog
          open={open}
          onOpenChange={setOpen}
          title={title}
          maxWidth={props.isEditing ? "xs" : "sm"}
          onCancel={() => setOpen(false)}
          // @ts-ignore
          onOk={() => onSubmit()}
          closable
        >
          <div className="orderly-p-5">
            {`Are you sure you want to cancel this ${
              order.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL
                ? "Position TP/SL"
                : "TP/SL"
            } order?`}
          </div>
        </SimpleDialog>
      ) : (
        <SimpleDialog
          open={open}
          onOpenChange={setOpen}
          title={title}
          maxWidth={props.isEditing ? "xs" : "sm"}
          // onCancel={() => setOpen(false)}
          // onOk={() => onSubmit()}
          closable
        >
          <AlgoOrderConfirmView
            //@ts-ignore
            order={{
              ...orderEntity,
              // ...order,
              symbol,
              algo_order_id: order.algo_order_id,
            }}
            isEditing={props.isEditing}
            tp_trigger_price={order.tp_trigger_price}
            sl_trigger_price={order.sl_trigger_price}
            symbol={symbol}
            oldOrder={props.order}
            onCancel={() => setOpen(false)}
            // @ts-ignore
            onConfirm={() => onSubmit()}
            quoteDp={quoteDp}
          />
        </SimpleDialog>
      )}
    </div>
  );
};
