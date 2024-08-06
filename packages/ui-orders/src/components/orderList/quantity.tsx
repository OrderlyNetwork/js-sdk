import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { API, OrderSide, OrderType } from "@orderly.network/types";
import { commify } from "@orderly.network/utils";
import { cleanStringStyle } from "@orderly.network/hooks";
import { AlgoOrderRootType } from "@orderly.network/types";
import {
  Box,
  Button,
  cn,
  Divider,
  Flex,
  Input,
  Popover,
  PopoverAnchor,
  PopoverContent,
  toast,
  Text,
} from "@orderly.network/ui";
import { OrderListContext } from "./orderListContext";
import { useTPSLOrderRowContext } from "./tpslOrderRowContext";
import { useSymbolContext } from "./symbolProvider";
import { grayCell } from "../../utils/util";

export const OrderQuantity = (props: {
  order: API.OrderExt | API.AlgoOrder;
  disableEdit?: boolean;
}) => {
  const { order } = props;

  const [quantity, setQuantity] = useState<string>(order.quantity.toString());
  // const { editOrder } = useContext(OrderListContext);

  const [open, setOpen] = useState(0);
  const [editting, setEditting] = useState(false);

  useEffect(() => {
    setQuantity(order.quantity.toString());
  }, [props.order.quantity]);

  if ((!editting && open <= 0) || props.disableEdit) {
    return (
      <NormalState
        order={order}
        quantity={quantity}
        setEditing={setEditting}
        disableEdit={props.disableEdit}
      />
    );
  }

  return (
    <EditingState
      order={order}
      quantity={quantity}
      setQuantity={setQuantity}
      editting={editting}
      setEditting={setEditting}
      open={open}
      setOpen={setOpen}
    />
  );
};

const NormalState: FC<{
  order: API.AlgoOrder | API.OrderExt;
  quantity: string;
  setEditing: any;
  partial?: boolean;
  disableEdit?: boolean;
}> = (props) => {
  const { order, quantity } = props;

  const executed = (order as API.OrderExt).total_executed_quantity;
  

  return (
    <Flex
      direction="row"
      justify={"start"}
      gap={1}
      className={cn(
        "oui-max-w-[110px] oui-relative",

        order.side === OrderSide.BUY && "oui-text-trade-profit",
        order.side === OrderSide.SELL && "oui-text-trade-loss",
        grayCell(order) && 'oui-text-base-conrast-20'
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

      <Flex
        r="base"
        className={cn(
          "oui-min-w-[70px] oui-h-[28px]",
          !props.disableEdit && "oui-bg-base-7 oui-px-1"
        )}
      >
        <Text size="2xs">{quantity}</Text>
      </Flex>
    </Flex>
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

  const closePopover = () => setOpen(0);
  const cancelPopover = () => {
    setOpen(-1);
    setQuantity(order.quantity.toString());
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

    setEditting(false);
    if (Number(quantity) === Number(order.quantity)) {
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

  const onConfirm = useCallback(() => {
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
        future = editOrder((order as API.OrderExt).order_id.toString(), params);
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
  }, [quantity]);

  return (
    <Popover
      open={open > 0}
      onOpenChange={(open: boolean) => setOpen(open ? 1 : 0)}
      content={undefined}
    >
      <div
        className={cn(
          "oui-flex oui-min-w-[120px] oui-justify-start oui-items-center oui-relative oui-font-semibold oui-z-10",

          order.side === OrderSide.BUY && "oui-text-trade-profit",
          order.side === OrderSide.SELL && "oui-text-trade-loss"
        )}
        ref={boxRef}
      >
        <div
          className={cn(
            "oui-absolute oui-left-1 oui-flex",
            editting
              ? "oui-animate-in oui-fade-in oui-zoom-in"
              : "oui-animate-out oui-fade-out oui-zoom-out  oui-hidden"
          )}
        >
          <button
            className="hover:oui-bg-base-contrast/10 oui-h-[25px] oui-rounded oui-px-1 oui-text-base-contrast-54 hover:oui-text-base-contrast-80"
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
            direction="vertical"
            className="oui-ml-[1px] before:oui-h-[16px] oui-min-w-[2px]"
          />
        </div>

        <PopoverAnchor asChild>
          <Input
            ref={inputRef}
            type="text"
            value={commify(quantity)}
            onChange={(e) => setQuantity(cleanStringStyle(e.target.value))}
            onFocus={() => setEditting(true)}
            onBlur={() => {
              setTimeout(() => {
                setEditting(false);
                if (open <= 0) {
                  setQuantity(order.quantity.toString());
                }
              }, 100);
            }}
            // error={!!error}
            helpText={error}
            onKeyDown={handleKeyDown}
            autoFocus
            containerClassName="oui-h-auto oui-pl-7 oui-flex-1"
            className="oui-flex-1 oui-pl-9 oui-pr-9 oui-bg-base-700 oui-px-2 oui-py-1 oui-rounded"
          />
        </PopoverAnchor>
        <div
          className={cn(
            "oui-absolute oui-right-1 oui-flex",
            editting
              ? "oui-animate-in oui-fade-in oui-zoom-in"
              : "oui-animate-out oui-fade-out oui-zoom-out  oui-hidden"
          )}
        >
          <Divider
            direction="vertical"
            className="before:oui-h-[16px] oui-min-w-[2px] oui-mr-[1px]"
          />

          <button
            className="hover:oui-bg-base-contrast/10 oui-h-[25px] oui-rounded oui-px-1 oui-text-base-contrast-54 hover:oui-text-base-contrast-80"
            // @ts-ignore
            onMouseDown={onClick}
          >
            {/* @ts-ignore */}
            <Check size={14} />
          </button>

          <PopoverContent
            align="end"
            side="top"
            className="oui-w-[340px]"
            onCloseAutoFocus={(e) => {
              if (inputRef.current && open === -1) {
                inputRef.current.focus();
              }
            }}
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div className="oui-pt-5 oui-relative">
              <div className="oui-text-base-contrast-54 oui-text-2xs desktop:oui-text-sm">
                You agree changing the quantity of {base}-PERP order to{" "}
                <span className="oui-text-warning">{commify(quantity)}</span>.
              </div>
              <div className="oui-grid oui-grid-cols-2 oui-gap-2 oui-mt-5">
                <Button
                  color="secondary"
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
                className="oui-absolute oui-right-0 oui-top-0 oui-text-base-contrast-54"
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
