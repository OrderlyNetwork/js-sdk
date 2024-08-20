import { API } from "@orderly.network/types";
import { commify, commifyOptional, Decimal } from "@orderly.network/utils";
import { FC, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useSymbolPriceRange } from "@orderly.network/hooks";
import {
  Button,
  cn,
  Flex,
  Input,
  Popover,
  toast,
  Tooltip,
  Text,
  CloseIcon,
  CheckIcon,
  inputFormatter,
} from "@orderly.network/ui";
import { OrderListContext } from "./orderListContext";
import { useSymbolContext } from "./symbolProvider";
import { grayCell } from "../../utils/util";

export const Price = (props: {
  order: API.OrderExt;
  disableEdit?: boolean;
}) => {
  const { order } = props;

  const [price, setPrice] = useState<string>(
    order.price?.toString() ?? "Market"
  );

  const [open, setOpen] = useState(false);
  const [editting, setEditting] = useState(false);

  const isAlgoOrder = order?.algo_order_id !== undefined;
  // console.log("price node", order);

  const isStopMarket = order?.type === "MARKET" && isAlgoOrder;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { editOrder, editAlgoOrder, checkMinNotional } =
    useContext(OrderListContext);

  const { base, quote_dp } = useSymbolContext();
  const closePopover = () => {
    setOpen(false);
    setEditting(false);
  };
  const cancelPopover = () => {
    setOpen(false);
    setPrice(order.price?.toString() ?? "Market");
    setEditting(false);
  };

  const onClick = (event: any) => {
    event?.stopPropagation();
    event?.preventDefault();

    if (price === `${order.price}`) {
      setEditting(false);
      return;
    }

    if (order.reduce_only !== true) {
      const notionalText = checkMinNotional(
        order.symbol,
        price,
        order.quantity
      );
      if (notionalText) {
        toast.error(notionalText);
        setIsSubmitting(false);
        cancelPopover();
        return;
      }
    }

    setOpen(true);
  };

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      onClick(event);
    }
  };

  const onConfirm = () => {
    setIsSubmitting(true);

    let order_id = order.order_id;
    let data: any = {
      order_price: price,
      order_quantity: order.quantity,
      symbol: order.symbol,
      order_type: order.type,
      side: order.side,
      // reduce_only: Boolean(order.reduce_only),
    };
    if (typeof order.reduce_only !== "undefined") {
      data.reduce_only = order.reduce_only;
    }

    if (order.order_tag !== undefined) {
      data = { ...data, order_tag: order.order_tag };
    }

    if (isAlgoOrder) {
      order_id = order.algo_order_id as number;
      data = {
        ...data,
        order_id,
        price: price,
        algo_order_id: order_id,
      };
    }

    if (order?.visible_quantity === 0) {
      data["visible_quantity"] = 0;
    }

    // @ts-ignore
    if (order.tag !== undefined) {
      // @ts-ignore
      data["order_tag"] = order.tag;
    }

    let future;
    if (order.algo_order_id !== undefined) {
      future = editAlgoOrder(order.algo_order_id.toString(), data);
    } else {
      future = editOrder(order.order_id.toString(), data);
    }

    future
      .then(
        (result) => {
          closePopover();
          setPrice(price);
          // setTimeout(() => inputRef.current?.blur(), 300);
        },
        (err) => {
          toast.error(err.message);

          setPrice(order.price!.toString());
          cancelPopover();
        }
      )
      .finally(() => setIsSubmitting(false));
  };

  const inputRef = useRef<HTMLInputElement>(null);

  const rangeInfo = useSymbolPriceRange(
    order.symbol,
    // @ts-ignore
    order.side,
    isAlgoOrder ? order.trigger_price : undefined
  );

  const hintInfo = useMemo(() => {
    if (!rangeInfo) return "";
    if (isStopMarket) return "";
    if (!editting) return "";

    if (Number(price) > rangeInfo.max) {
      return `Price can not be greater than ${rangeInfo.max} USDC.`;
    }
    if (Number(price) < rangeInfo.min) {
      return `Price can not be less than ${rangeInfo.min} USDC.`;
    }
    return "";
  }, [isStopMarket, editting, rangeInfo, price]);

  useEffect(() => {
    {
      if (!!props.order.price) {
        setPrice(`${props.order.price}`);
      }
    }
  }, [props.order.price]);

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

  const isAlgoMarketOrder = order.algo_order_id && order.type == "MARKET";

  if (isAlgoMarketOrder) {
    return <span>Market</span>;
  }

  const trigger = () => {
    if (!editting || props.disableEdit) {
      return (
        <NormalState
          order={order}
          price={price}
          setEditing={setEditting}
          disableEdit={props.disableEdit}
        />
      );
    }

    return (
      <InnerInput
        inputRef={inputRef}
        quote_dp={quote_dp}
        price={price}
        setPrice={setPrice}
        setEditting={setEditting}
        open={open}
        order={order}
        handleKeyDown={handleKeyDown}
        onClick={onClick}
        hintInfo={hintInfo}
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
          price={price}
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
  order: any;
  price: string;
  setEditing: any;
  disableEdit?: boolean;
}> = (props) => {
  const { order, price } = props;

  return (
    <div
      className={cn(
        "oui-flex oui-max-w-[110px] oui-justify-start oui-items-center oui-gap-1 oui-relative oui-font-semibold",
        grayCell(order) && "oui-text-base-conrast-20"
      )}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        props.setEditing(true);
      }}
    >
      <Flex
        r="base"
        className={cn(
          "oui-min-w-[70px] oui-h-[28px]",
          !props.disableEdit && "oui-bg-base-7 oui-px-2"
        )}
      >
        <Text size="2xs">{commifyOptional(price)}</Text>
      </Flex>
    </div>
  );
};

const ConfirmContent: FC<{
  base: string;
  price: string;
  cancelPopover: () => void;
  isSubmitting: boolean;
  onConfirm: (e: any) => void;
}> = (props) => {
  const { base, price, cancelPopover, isSubmitting, onConfirm } = props;
  return (
    <div className="oui-pt-5 oui-relative">
      <div className="oui-text-base-contrast-54 oui-text-2xs desktop:oui-text-sm">
        You agree changing the price of {base}-PERP order to{" "}
        <span className="oui-text-warning">{commify(price)}</span>.
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
  quote_dp: number;
  price: string;
  setPrice: any;
  setEditting: any;
  open: boolean;
  order: any;
  error?: string;
  handleKeyDown: (e: any) => void;
  onClick: (e: any) => void;
  hintInfo?: string;
}> = (props) => {
  const {
    inputRef,
    quote_dp,
    price,
    setPrice,
    setEditting,
    open,
    order,
    error,
    handleKeyDown,
    onClick,
    hintInfo,
  } = props;

  console.log("xxxx InnerInput", open);

  useEffect(() => {
    const input = inputRef.current;
    if (input) {
      const length = input.value.length;
      input.setSelectionRange(length, length);
    }
    setEditting(true);
  }, []);
  return (
    <Tooltip content={hintInfo} open={(hintInfo?.length || 0) > 0}>
      <Input
        ref={inputRef}
        type="text"
        size="sm"
        formatters={[
          inputFormatter.numberFormatter,
          inputFormatter.dpFormatter(quote_dp),
        ]}
        value={price}
        onValueChange={(e) => setPrice(e)}
        helpText={error}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onKeyDown={handleKeyDown}
        autoFocus
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
              e.stopPropagation();
              e.preventDefault();
              setEditting(false);
              setPrice(order.price.toString());
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
    </Tooltip>
  );
};
