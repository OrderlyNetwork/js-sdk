import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { API, OrderSide } from "@orderly.network/types";
import { commify, Decimal } from "@orderly.network/utils";
import { AlgoOrderRootType } from "@orderly.network/types";
import {
  Button,
  cn,
  Flex,
  Input,
  Popover,
  toast,
  Text,
  CloseIcon,
  CheckIcon,
  inputFormatter,
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
    useContext(OrderListContext);
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
        base_dp={base_dp}
        quantity={quantity}
        setQuantity={setQuantity}
        setEditting={setEditting}
        open={open}
        order={order}
        handleKeyDown={handleKeyDown}
        onClick={onClick}
      />
    );
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      content={
        <ConfirmContent
          base={base}
          quantity={quantity}
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

const ConfirmContent: FC<{
  base: string;
  quantity: string;
  cancelPopover: () => void;
  isSubmitting: boolean;
  onConfirm: (e: any) => void;
}> = (props) => {
  const { base, quantity, cancelPopover, isSubmitting, onConfirm } = props;
  return (
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
        <Button loading={isSubmitting} onClick={onConfirm}>
          Confirm
        </Button>
      </div>
      <button
        className="oui-absolute oui-right-0 oui-top-0 oui-text-base-contrast-54"
        onClick={cancelPopover}
      >
        <CloseIcon size={18} />
      </button>
    </div>
  );
};

const InnerInput: FC<{
  inputRef: any;
  base_dp: number;
  quantity: string;
  setQuantity: any;
  setEditting: any;
  open: boolean;
  order: any;
  error?: string;
  handleKeyDown: (e: any) => void;
  onClick: (e: any) => void;
}> = (props) => {
  const {
    inputRef,
    base_dp,
    quantity,
    setQuantity,
    setEditting,
    open,
    order,
    error,
    handleKeyDown,
    onClick,
  } = props;
  useEffect(() => {
    const input = inputRef.current;
    if (input) {
      const length = input.value.length;
      input.setSelectionRange(length, length);
    }
    setEditting(true);
  }, []);
  return (
    <Input
      ref={inputRef}
      type="text"
      size="sm"
      formatters={[
        inputFormatter.numberFormatter,
        inputFormatter.dpFormatter(base_dp),
      ]}
      value={quantity}
      onValueChange={(e) => setQuantity(e)}
      helpText={error}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      onKeyDown={handleKeyDown}
      autoFocus
      // containerClassName="oui-h-auto oui-pl-7 oui-flex-1"
      // className="oui-flex-1 oui-pl-9 oui-pr-9 oui-bg-base-700 oui-px-2 oui-py-1 oui-rounded"
      classNames={{
        root: "oui-bg-base-700 oui-px-2 oui-py-1 oui-rounded",
        input: "oui-px-2",
      }}
      prefix={
        <CloseIcon
          size={14}
          color="white"
          opacity={1}
          className="oui-cursor-pointer oui-opacity-50 hover:oui-opacity-100"
          onClick={(e) => {
            setEditting(false);
            setQuantity(order.quantity.toString());
          }}
        />
      }
      suffix={
        <button onClick={onClick}>
          <CheckIcon
            size={18}
            color="white"
            opacity={1}
            className="oui-cursor-pointer oui-opacity-50 hover:oui-opacity-100"
          />
        </button>
      }
    />
  );
};
