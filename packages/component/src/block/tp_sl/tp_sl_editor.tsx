import { FC, useEffect, useMemo, useState } from "react";
import { TPSLForm } from "@/block/tp_sl/tpAndslForm";
import {
  useLocalStorage,
  useTaskProfitAndStopLoss,
  useMediaQuery,
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

export const TPSLEditor: FC<{
  symbol: string;
  /**
   * The maximum quantity that can be set for the TP/SL order
   */
  maxQty: number;
  onSuccess?: () => void;
  onCancel?: () => void;
  position: API.PositionTPSLExt;
  order?: API.AlgoOrder;
  canModifyQty?: boolean;
  isEditing?: boolean;
}> = (props) => {
  const { symbol, maxQty } = props;
  const [orderEntity, setOrderEntity] =
    useState<Partial<AlgoOrderEntity> | null>();
  const [open, setOpen] = useState(false);

  const [order, { submit, setValue, validate }] = useTaskProfitAndStopLoss(
    {
      symbol,
      position_qty: props.position.position_qty,
      average_open_price: props.position.average_open_price,
    },
    {
      defaultOrder: props.order,
    }
  );

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

  const onSubmit = () => {
    return submit().then(
      () => {
        setOpen(false);
        props.onSuccess?.();
      },
      (error) => {
        toast.error(error.message);
      }
    );
  };

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
            } else if (order.algo_order_id) {
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
          console.log(error);
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
    <>
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
      />
      <SimpleDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        maxWidth={"xs"}
        onCancel={() => setOpen(false)}
        onOk={() => onSubmit()}
        closable
      >
        {mode === "delete" ? (
          <div className="orderly-p-5">
            {`Are you sure you want to cancel this ${
              order.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL
                ? "Position TP/SL"
                : "TP/SL"
            } order?`}
          </div>
        ) : (
          <AlgoOrderConfirmView
            //@ts-ignore
            order={{
              ...orderEntity,
              // ...order,
              symbol,
              algo_order_id: order.algo_order_id,
            }}
            tp_trigger_price={order.tp_trigger_price}
            sl_trigger_price={order.sl_trigger_price}
            symbol={symbol}
            isTable={isTablet}
            oldOrder={props.order}
          />
        )}
      </SimpleDialog>
    </>
  );
};
