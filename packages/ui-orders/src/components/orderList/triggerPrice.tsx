import { API, OrderSide, OrderStatus } from "@orderly.network/types";
import { commify } from "@orderly.network/utils";
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
  const [open, setOpen] = useState(0);
  const [editting, setEditting] = useState(false);

  if (!isAlgoOrder) {
    return <Text>{`--`}</Text>;
  }

  if ((!editting && open <= 0) || props.disableEdit) {
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
    <EditingState
      order={order}
      price={price}
      setPrice={setPrice}
      editting={editting}
      setEditting={setEditting}
      open={open}
      setOpen={setOpen}
    />
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
        grayCell(order) && 'oui-text-base-conrast-20'
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
          !props.disableEdit && "oui-bg-base-7 oui-px-1"
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
  const confirmRef = useRef<HTMLDivElement>(null);
  const { base, base_dp } = useSymbolContext();
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

    // @ts-ignore
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
    // @ts-ignore
    editAlgoOrder(`${order.algo_order_id}`, data)
      .then(
        (result) => {
          closePopover();
          setPrice(price);
          // setTimeout(() => inputRef.current?.blur(), 300);
        },
        (err) => {
          toast.error(err.message);
          // @ts-ignore
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
            {/* @ts-ignore */}
            <Check size={18} />
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
