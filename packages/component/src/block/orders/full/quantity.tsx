import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { API, OrderSide, OrderType } from "@orderly.network/types";
import { Check, X } from "lucide-react";
import { cn } from "@/utils/css";
import { Popover, PopoverAnchor, PopoverContent } from "@/popover";
import { commify } from "@orderly.network/utils";
import { useSymbolContext } from "@/provider/symbolProvider";
import Button from "@/button";
import { OrderListContext } from "../shared/orderListContext";
import { toast } from "@/toast";
import { Divider } from "@/divider";
import { cleanStringStyle, useDebouncedCallback } from "@orderly.network/hooks";
import { Input } from "@/input";
import { AlgoOrderRootType } from "@orderly.network/types";
import { useTPSLOrderRowContext } from "@/block/tp_sl/tpslOrderRowContext";

export const OrderQuantity = (props: {
  order: API.OrderExt | API.AlgoOrder;
}) => {
  const { order } = props;

  const [quantity, setQuantity] = useState<string>(order.quantity.toString());
  // const { editOrder } = useContext(OrderListContext);

  const [open, setOpen] = useState(0);
  const [editting, setEditting] = useState(false);

  useEffect(() => {
    setQuantity(order.quantity.toString());
  }, [props.order.quantity]);

  const componentRef = useRef<HTMLDivElement | null>(null);

  const handleClickOutside = (event: any) => {
    if (
      componentRef.current &&
      !componentRef.current.contains(event.target) &&
      open <= 0
    ) {
      setQuantity(order.quantity.toString());
      setEditting(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <span ref={componentRef} className="orderly-block">
      {!editting && open <= 0 ? (
        <NormalState
          order={order}
          quantity={quantity}
          setEditing={setEditting}
        />
      ) : (
        <EditingState
          order={order}
          quantity={quantity}
          setQuantity={setQuantity}
          editting={editting}
          setEditting={setEditting}
          open={open}
          setOpen={setOpen}
        />
      )}
    </span>
  );

  // if (!editting && open <= 0) {
  //   return (
  //     <NormalState order={order} quantity={quantity} setEditing={setEditting} />
  //   );
  // }

  // return (
  //   <EditingState
  //     order={order}
  //     quantity={quantity}
  //     setQuantity={setQuantity}
  //     editting={editting}
  //     setEditting={setEditting}
  //     open={open}
  //     setOpen={setOpen}
  //   />
  // );
};

const NormalState: FC<{
  order: API.AlgoOrder | API.OrderExt;
  quantity: string;
  setEditing: any;
  partial?: boolean;
}> = (props) => {
  const { order, quantity } = props;

  const executed = (order as API.OrderExt).total_executed_quantity;

  return (
    <div
      className={cn(
        "orderly-flex orderly-max-w-[110px] orderly-justify-start orderly-items-center orderly-gap-1 orderly-relative orderly-font-semibold",
        {
          "orderly-text-trade-profit": order.side === OrderSide.BUY,
          "orderly-text-trade-loss": order.side === OrderSide.SELL,
        }
      )}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        props.setEditing(true);
      }}
    >
      {"algo_type" in order &&
      order.algo_type === AlgoOrderRootType.TP_SL ? null : (
        <>
          <span>{executed}</span>
          <span>/</span>
        </>
      )}

      <div className="orderly-px-2 orderly-flex orderly-min-w-[70px] orderly-items-center orderly-h-[28px] orderly-bg-base-700 orderly-text-2xs orderly-font-semibold orderly-rounded-lg">
        {quantity}
      </div>
    </div>
  );
};

const EditingState: FC<{
  order: API.OrderExt | API.AlgoOrder;
  quantity: string;
  setQuantity: any;
  editting: boolean;
  setEditting: any;
  open: number;
  setOpen: any;
}> = (props) => {
  const {
    order,
    quantity,
    setQuantity: originSetQuantity,
    editting,
    setEditting,
    setOpen,
    open,
  } = props;

  const [error, setError] = useState<string>();

  const { editOrder, editAlgoOrder, checkMinNotional } =
    useContext(OrderListContext);
  const { onUpdateOrder: onUpdateTPSLOrder, position } =
    useTPSLOrderRowContext();

  const setQuantity = (qty: string) => {
    originSetQuantity(qty);
    const positionQty = Math.abs(position?.position_qty || 0);
    if (position && Number(qty) > positionQty) {
      setError(
        `Quantity should be less than position quantity : ${positionQty}`
      );
    } else {
      setError(undefined);
    }
  };

  const closePopover = () => {
    setOpen(0);
    setEditting(false);
  };
  const cancelPopover = () => {
    setOpen(-1);
    setQuantity(order.quantity.toString());
    setEditting(false);
  };

  const boxRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLDivElement>(null);
  const { base } = useSymbolContext();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const docClickHandler = (event: MouseEvent) => {
      // close the input when click outside of boxRef
      const el = boxRef?.current;
      if (!el || el.contains(event.target as Node)) {
        return;
      }

      const el2 = confirmRef?.current;
      if (!el2 || el2.contains(event.target as Node)) {
        return;
      }

      setQuantity(order.quantity.toString());
      setEditting(false);
    };

    document.body.addEventListener("click", docClickHandler);

    return () => {
      document.body.removeEventListener("click", docClickHandler);
    };
  }, []);

  const clickHandler = () => {
    if (!!error) {
      return;
    }

    if (Number(quantity) === Number(order.quantity)) {
      setEditting(false);
      return;
    }

    const price =
      order.algo_order_id !== undefined ? order.trigger_price : order.price;
    if (price !== null && order.reduce_only !== true) {
      const notionalText = checkMinNotional(order.symbol, price, quantity);
      if (notionalText) {
        toast.error(notionalText);
        setIsSubmitting(false);
        cancelPopover();
        return;
      }
    }

    setOpen(1);
  };

  const onClick = (event: MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    clickHandler();
  };

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      event.stopPropagation();
      event.preventDefault();
      clickHandler();
    }
  };

  const onConfirm = useDebouncedCallback(
    () => {
      setIsSubmitting(true);

      let params: any = {
        symbol: order.symbol,
        order_type: order.type,
        side: order.side,
        order_price: order.price,
        order_quantity: quantity,
        // reduce_only: Boolean(order.reduce_only),
        algo_order_id: order.algo_order_id,
      };

      if (
        typeof params.algo_order_id !== "undefined" &&
        params.order_type === "MARKET"
      ) {
        // stop market order
        const { order_price, ...rest } = params;
        params = rest;
      }

      if (typeof order.reduce_only !== "undefined") {
        params.reduce_only = order.reduce_only;
      }

      if (order.order_tag !== undefined) {
        params = { ...params, order_tag: order.order_tag };
      }

      // @ts-ignore
      if (order.visible_quantity === 0) {
        params["visible_quantity"] = 0;
      }

      // @ts-ignore
      if (order.tag !== undefined) {
        // @ts-ignore
        params["order_tag"] = order.tag;
      }

      let future;

      if ("algo_type" in order && order.algo_type === AlgoOrderRootType.TP_SL) {
        future = onUpdateTPSLOrder(order as API.AlgoOrderExt, params);
      } else {
        if (order.algo_order_id !== undefined) {
          future = editAlgoOrder(order.algo_order_id.toString(), params);
        } else {
          future = editOrder(
            (order as API.OrderExt).order_id.toString(),
            params
          );
        }
      }

      // @ts-ignore
      future
        .then(
          (result) => {
            closePopover();
            setQuantity(quantity.toString());
            // setTimeout(() => inputRef.current?.blur(), 300);
          },
          (err) => {
            toast.error(err.message);
            setQuantity(order.quantity.toString());
            cancelPopover();
          }
        )
        .finally(() => setIsSubmitting(false));
    },
    500,
    {
      leading: true,
      trailing: false,
    }
  );

  return (
    <Popover
      open={open > 0}
      onOpenChange={(open: boolean) => setOpen(open ? 1 : 0)}
    >
      <div
        className={cn(
          "orderly-flex orderly-min-w-[120px] orderly-justify-start orderly-items-center orderly-relative orderly-font-semibold",
          {
            "orderly-text-trade-profit": order.side === OrderSide.BUY,
            "orderly-text-trade-loss": order.side === OrderSide.SELL,
          }
        )}
        ref={boxRef}
      >
        <div
          className={cn("orderly-absolute orderly-left-1 orderly-flex", {
            "orderly-animate-in orderly-fade-in orderly-zoom-in": editting,
            "orderly-animate-out orderly-fade-out orderly-zoom-out  orderly-hidden":
              !editting,
          })}
        >
          <button
            className="hover:orderly-bg-base-contrast/10 orderly-h-[25px] orderly-rounded orderly-px-1 orderly-text-base-contrast-54 hover:orderly-text-base-contrast-80"
            // @ts-ignore
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setEditting(false);
              setQuantity(order.quantity.toString());
            }}
          >
            {/* @ts-ignore */}
            <X size={14} />
          </button>

          <Divider
            vertical
            className="orderly-ml-[1px] before:orderly-h-[16px] orderly-min-w-[2px]"
          />
        </div>

        <PopoverAnchor asChild>
          <Input
            ref={inputRef}
            type="text"
            value={commify(quantity)}
            onChange={(e) => setQuantity(cleanStringStyle(e.target.value))}
            onFocus={() => setEditting(true)}
            // onBlur={() => {
            //   setTimeout(() => {
            //     setEditting(false);
            //     if (open <= 0) {
            //       setQuantity(order.quantity.toString());
            //     }
            //   }, 100);
            // }}
            error={!!error}
            helpText={error}
            onKeyDown={handleKeyDown}
            autoFocus
            containerClassName="orderly-h-auto orderly-pl-7 orderly-flex-1"
            className="orderly-flex-1 orderly-pl-9 orderly-pr-9 orderly-bg-base-700 orderly-px-2 orderly-py-1 orderly-rounded"
            tooltipClassName="orderly-z-50"
          />
        </PopoverAnchor>
        <div
          className={cn("orderly-absolute orderly-right-1 orderly-flex", {
            "orderly-animate-in orderly-fade-in orderly-zoom-in": editting,
            "orderly-animate-out orderly-fade-out orderly-zoom-out  orderly-hidden":
              !editting,
          })}
        >
          <Divider
            vertical
            className="before:orderly-h-[16px] orderly-min-w-[2px] orderly-mr-[1px]"
          />

          <button
            className="hover:orderly-bg-base-contrast/10 orderly-h-[25px] orderly-rounded orderly-px-1 orderly-text-base-contrast-54 hover:orderly-text-base-contrast-80"
            // @ts-ignore
            onMouseDown={onClick}
          >
            {/* @ts-ignore */}
            <Check size={14} />
          </button>

          <PopoverContent
            align="end"
            side="top"
            className="orderly-w-[340px]"
            onCloseAutoFocus={(e) => {
              if (inputRef.current && open === -1) {
                inputRef.current.focus();
              }
            }}
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div className="orderly-pt-5 orderly-relative">
              <div className="orderly-text-base-contrast-54 orderly-text-2xs desktop:orderly-text-sm">
                You agree changing the quantity of {base}-PERP order to{" "}
                <span className="orderly-text-warning">
                  {commify(quantity)}
                </span>
                .
              </div>
              <div className="orderly-grid orderly-grid-cols-2 orderly-gap-2 orderly-mt-5">
                <Button
                  color="tertiary"
                  onClick={cancelPopover}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  // @ts-ignore
                  ref={confirmRef}
                  loading={isSubmitting}
                  onClick={onConfirm}
                >
                  Confirm
                </Button>
              </div>
              <button
                className="orderly-absolute orderly-right-0 orderly-top-0 orderly-text-base-contrast-54"
                onClick={cancelPopover}
              >
                {/* @ts-ignore */}
                <X size={18} />
              </button>
            </div>
          </PopoverContent>
        </div>
      </div>
    </Popover>
  );
};
