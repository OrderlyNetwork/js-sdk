import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { API, OrderSide } from "@orderly.network/types";
import { AlgoOrderRootType } from "@orderly.network/types";
import { cn, Flex, Popover, toast, Text } from "@orderly.network/ui";
import { ConfirmContent, EditType } from "./editOrder/confirmContent";
import { InnerInput } from "./editOrder/innerInput";
import { useOrderListContext } from "../orderListContext";
import { useTPSLOrderRowContext } from "../tpslOrderRowContext";
import { useSymbolContext } from "../symbolProvider";
import { grayCell } from "../../../utils/util";

export const OrderQuantity = (props: {
  order: API.OrderExt | API.AlgoOrder;
  disableEdit?: boolean;
}) => {
  const { order } = props;

  const [quantity, originSetQuantity] = useState<string>(
    order.quantity.toString()
  );

  const [editting, setEditting] = useState(false);

  useEffect(() => {
    setQuantity(order.quantity.toString());
  }, [props.order.quantity]);

  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();

  const { editOrder, editAlgoOrder, checkMinNotional } =
    useOrderListContext();
  const { onUpdateOrder: onUpdateTPSLOrder, position } =
    useTPSLOrderRowContext();

  const { base_dp, base } = useSymbolContext();

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
    setOpen(false);
    setEditting(false);
  };
  const cancelPopover = () => {
    setOpen(false);
    setQuantity(order.quantity.toString());
    setEditting(false);
  };
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const clickHandler = () => {
    console.log("xxxxx click handler", checkMinNotional, quantity);

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

    setOpen(true);
  };

  const onClick = (event: any) => {
    event?.stopPropagation();
    event?.preventDefault();

    clickHandler();
  };

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      event?.stopPropagation();
      event?.preventDefault();
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

    if (order?.visible_quantity === 0) {
      params["visible_quantity"] = 0;
    }

    // @ts-ignore
    if (order?.tag !== undefined) {
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

    future
      .then(
        (result: any) => {
          closePopover();
          setQuantity(quantity.toString());
          // setTimeout(() => inputRef.current?.blur(), 300);
        },
        (err: any) => {
          toast.error(err.message);
          setQuantity(order.quantity.toString());
          cancelPopover();
        }
      )
      .finally(() => setIsSubmitting(false));
  }, [quantity]);

  const componentRef = useRef<HTMLDivElement | null>(null);

  const handleClickOutside = (event: any) => {
    if (
      componentRef.current &&
      !componentRef.current.contains(event.target as Node) &&
      !open
    ) {
      cancelPopover();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const trigger = () => {
    if (!editting || props.disableEdit) {
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
      <InnerInput
        inputRef={inputRef}
        dp={base_dp}
        value={quantity}
        setPrice={setQuantity}
        setEditting={setEditting}
        handleKeyDown={handleKeyDown}
        onClick={onClick}
        onClose={cancelPopover}
      />
    );
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      content={
        <ConfirmContent
          type={EditType.quantity}
          base={base}
          value={quantity}
          cancelPopover={cancelPopover}
          isSubmitting={isSubmitting}
          onConfirm={onConfirm}
        />
      }
    >
      <div ref={componentRef}>{trigger()}</div>
    </Popover>
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
        grayCell(order) && "oui-text-base-conrast-20"
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
          !props.disableEdit && "oui-bg-base-7 oui-px-2"
        )}
      >
        <Text size="2xs">{quantity}</Text>
      </Flex>
    </Flex>
  );
};
