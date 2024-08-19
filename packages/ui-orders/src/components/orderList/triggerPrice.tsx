import { API, OrderSide, OrderStatus } from "@orderly.network/types";
import { commify, Decimal } from "@orderly.network/utils";
import { FC, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useEventEmitter, useSymbolPriceRange } from "@orderly.network/hooks";
import { cleanStringStyle } from "@orderly.network/hooks";
import {
  Button,
  cn,
  Divider,
  Flex,
  Input,
  Popover,
  PopoverAnchor,
  PopoverContent,
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

export const TriggerPrice = (props: {
  order: API.OrderExt;
  disableEdit?: boolean;
}) => {
  const { order } = props;

  const [price, setPrice] = useState<string>("");

  useEffect(() => {
    setPrice(order.trigger_price?.toString() ?? "0");
  }, [order.trigger_price]);

  const isAlgoOrder = order?.algo_order_id !== undefined;
  const [open, setOpen] = useState(false);
  const [editting, setEditting] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { editAlgoOrder, checkMinNotional } = useContext(OrderListContext);

  
  const { base, quote_dp } = useSymbolContext();
  const closePopover = () => {
    setOpen(false);
    setEditting(false);
  };
  const cancelPopover = () => {
    setPrice(order.trigger_price?.toString() ?? "0");
    setOpen(false);
    setEditting(false);
  };

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

  const onClick = (event: any) => {
    event?.stopPropagation();
    event?.preventDefault();

    setEditting(false);

    if (Number(price) === Number(order.trigger_price)) {
      return;
    }

    if (order.price && order.reduce_only !== true) {
      const notionalText = checkMinNotional(
        order.symbol,
        order.price,
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

    let data: any = {
      // price: price,
      quantity: order.quantity,
      trigger_price: price,
      symbol: order.symbol,
      // order_type: order.type,
      // side: order.side,
      // reduce_only: Boolean(order.reduce_only),
      algo_order_id: order.algo_order_id,
    };

    if (order.order_tag !== undefined) {
      data = { ...data, order_tag: order.order_tag };
    }

    editAlgoOrder(`${order.algo_order_id}`, data)
      .then(
        (result) => {
          closePopover();
          setPrice(price);
          // setTimeout(() => inputRef.current?.blur(), 300);
        },
        (err) => {
          toast.error(err.message);

          setPrice(order.trigger_price?.toString() ?? "--");
          cancelPopover();
        }
      )
      .finally(() => setIsSubmitting(false));
  };

  const inputRef = useRef<HTMLInputElement>(null);

  if (!isAlgoOrder) {
    return <Text>{`--`}</Text>;
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
        <Text size="2xs">{price}</Text>
      </Flex>
    </div>
  );
};

const EditingState: FC<{
  order: API.OrderExt;
  price: string;
  setPrice: any;
  editting: boolean;
  setEditting: any;
  open: number;
  setOpen: any;
}> = (props) => {
  const { order, price, setPrice, editting, setEditting, setOpen, open } =
    props;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { editAlgoOrder, checkMinNotional } = useContext(OrderListContext);

  const ee = useEventEmitter();

  const boxRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const { base, quote_dp } = useSymbolContext();
  const closePopover = () => setOpen(0);
  const cancelPopover = () => {
    setOpen(-1);
    setPrice(order.trigger_price?.toString() ?? "0");
  };

  useEffect(() => {
    const clickHandler = (event: MouseEvent) => {
      // close the input when click outside of boxRef
      const el = boxRef?.current;
      if (!el || el.contains(event.target as Node)) {
        return;
      }
      const el2 = confirmRef?.current;
      if (!el2 || el2.contains(event.target as Node)) {
        return;
      }

      setPrice(order.trigger_price?.toString() ?? "0");
      setEditting(false);
    };

    document.body.addEventListener("click", clickHandler);

    return () => {
      document.body.removeEventListener("click", clickHandler);
    };
  }, []);

  const onClick = () => {
    // event.stopPropagation();
    // event.preventDefault();

    setEditting(false);

    if (Number(price) === Number(order.trigger_price)) {
      return;
    }

    if (order.price && order.reduce_only !== true) {
      const notionalText = checkMinNotional(
        order.symbol,
        order.price,
        order.quantity
      );
      if (notionalText) {
        toast.error(notionalText);
        setIsSubmitting(false);
        cancelPopover();
        return;
      }
    }

    setOpen(1);
  };

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      event.stopPropagation();
      event.preventDefault();
      onClick();
    }
  };

  const onClickCancel = (order: any) => {
    setPrice(order.trigger_price);
    setEditting(false);
  };

  const onConfirm = () => {
    setIsSubmitting(true);

    let data: any = {
      // price: price,
      quantity: order.quantity,
      trigger_price: price,
      symbol: order.symbol,
      // order_type: order.type,
      // side: order.side,
      // reduce_only: Boolean(order.reduce_only),
      algo_order_id: order.algo_order_id,
    };

    if (order.order_tag !== undefined) {
      data = { ...data, order_tag: order.order_tag };
    }

    editAlgoOrder(`${order.algo_order_id}`, data)
      .then(
        (result) => {
          closePopover();
          setPrice(price);
          // setTimeout(() => inputRef.current?.blur(), 300);
        },
        (err) => {
          toast.error(err.message);

          setPrice(order.trigger_price?.toString());
          cancelPopover();
        }
      )
      .finally(() => setIsSubmitting(false));
  };

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Popover
      open={open > 0}
      onOpenChange={(open: boolean) => setOpen(open ? 1 : 0)}
      content={undefined}
    >
      <div
        className={
          "oui-flex oui-justify-start oui-items-center oui-gap-1 oui-relative oui-font-semibold"
        }
        ref={boxRef}
      >
        <div
          className={cn(
            "oui-absolute oui-left-1 oui-flex",
            editting
              ? "oui-animate-in oui-fade-in oui-zoom-in"
              : "oui-animate-out oui-fade-out oui-zoom-out oui-hidden"
          )}
        >
          <button
            className="hover:oui-bg-base-contrast/10 oui-h-[25px] oui-rounded oui-px-1 oui-text-base-contrast-54 hover:oui-text-base-contrast-80"
            onClick={() => onClickCancel(order)}
          >
            <CloseIcon size={14} />
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
            value={commify(price)}
            onChange={(e) => setPrice(cleanStringStyle(e.target.value))}
            onFocus={() => setEditting(true)}
            onBlur={() => {
              setTimeout(() => {
                setEditting(false);
                if (open <= 0) {
                  setPrice(order.trigger_price?.toString() ?? "0");
                }
              }, 100);
            }}
            autoFocus
            onKeyDown={handleKeyDown}
            containerClassName="oui-h-auto oui-pl-7"
            className="oui-w-full oui-flex-1 oui-pl-9 oui-pr-9 oui-bg-base-700 oui-px-2 oui-py-1 oui-rounded "
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
            <CheckIcon size={18} />
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
                You agree changing the trigger price of {base}-PERP order to{" "}
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
                <Button
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
                <CloseIcon size={18} />
              </button>
            </div>
          </PopoverContent>
        </div>
      </div>
    </Popover>
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
        You agree changing the trigger price of {base}-PERP order to{" "}
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
          inputFormatter.dpFormatter(quote_dp, {
            roundingMode: Decimal.ROUND_DOWN,
          }),
        ]}
        value={price}
        onChange={(e) => setPrice(e.target.value)}
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
              setPrice(order.trigger_price.toString());
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
