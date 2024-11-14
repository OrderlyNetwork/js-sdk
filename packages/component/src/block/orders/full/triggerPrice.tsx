import Button from "@/button";
import { Popover, PopoverAnchor, PopoverContent } from "@/popover";
import { useSymbolContext } from "@/provider/symbolProvider";
import { Numeral } from "@/text";
import { NumeralWithCtx } from "@/text/numeralWithCtx";
import { cn } from "@/utils/css";
import { API, OrderSide, OrderStatus } from "@orderly.network/types";
import { commify } from "@orderly.network/utils";
import { Check, X } from "lucide-react";
import { FC, useContext, useEffect, useMemo, useRef, useState } from "react";
import { OrderListContext } from "../shared/orderListContext";
import { toast } from "@/toast";
import { Divider } from "@/divider";
import {
  cleanStringStyle,
  useDebouncedCallback,
  useEventEmitter,
} from "@orderly.network/hooks";
import { Input } from "@/input";

export const TriggerPrice = (props: { order: API.OrderExt }) => {
  const { order } = props;

  const [price, setPrice] = useState<string>("");

  useEffect(() => {
    setPrice(order.trigger_price?.toString() ?? "0");
  }, [order.trigger_price]);

  const isAlgoOrder = order?.algo_order_id !== undefined;
  const [open, setOpen] = useState(0);
  const [editting, setEditting] = useState(false);

  const componentRef = useRef<HTMLDivElement | null>(null);

  const handleClickOutside = (event: any) => {
    if (
      componentRef.current &&
      !componentRef.current.contains(event.target) &&
      open <= 0
    ) {
      setPrice(order.trigger_price?.toString() ?? "0");
      setEditting(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  if (!isAlgoOrder) {
    return <div>-</div>;
  }

  return (
    <span ref={componentRef} className="orderly-block">
      {!editting && open <= 0 ? (
        <NormalState order={order} price={price} setEditing={setEditting} />
      ) : (
        <EditingState
          order={order}
          price={price}
          setPrice={setPrice}
          editting={editting}
          setEditting={setEditting}
          open={open}
          setOpen={setOpen}
        />
      )}
    </span>
  );
};

const NormalState: FC<{
  order: any;
  price: string;
  setEditing: any;
}> = (props) => {
  const { order, price } = props;

  return (
    <div
      className={cn(
        "orderly-flex orderly-max-w-[110px] orderly-justify-start orderly-items-center orderly-gap-1 orderly-relative orderly-font-semibold"
      )}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        props.setEditing(true);
      }}
    >
      <div className="orderly-px-2 orderly-flex orderly-min-w-[70px] orderly-items-center orderly-h-[28px] orderly-bg-base-700 orderly-text-2xs orderly-font-semibold orderly-rounded-lg">
        {price}
      </div>
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
  const closePopover = () => {
    setOpen(0);
    setEditting(false);
  };
  const cancelPopover = () => {
    setOpen(-1);
    setPrice(order.trigger_price?.toString() ?? "0");
    setEditting(false);
  };

  const onClick = (event: any) => {
    event?.stopPropagation();
    event?.preventDefault();

    if (Number(price) === Number(order.trigger_price)) {
      setEditting(false);
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
      onClick(event);
    }
  };

  const onClickCancel = (order: any) => {
    setPrice(order.trigger_price);
    setEditting(false);
  };

  const onConfirm = useDebouncedCallback(
    () => {
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
    },
    500,
    {
      leading: true,
      trailing: false,
    }
  );

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Popover
      open={open > 0}
      onOpenChange={(open: boolean) => setOpen(open ? 1 : 0)}
    >
      <div
        className={
          "orderly-flex orderly-justify-start orderly-items-center orderly-gap-1 orderly-relative orderly-font-semibold"
        }
        ref={boxRef}
      >
        <div
          className={cn("orderly-absolute orderly-left-1 orderly-flex", {
            "orderly-animate-in orderly-fade-in orderly-zoom-in": editting,
            "orderly-animate-out orderly-fade-out orderly-zoom-out orderly-hidden":
              !editting,
          })}
        >
          <button
            className="hover:orderly-bg-base-contrast/10 orderly-h-[25px] orderly-rounded orderly-px-1 orderly-text-base-contrast-54 hover:orderly-text-base-contrast-80"
            onClick={() => onClickCancel(order)}
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
            value={commify(price)}
            onChange={(e) => setPrice(cleanStringStyle(e.target.value))}
            onFocus={() => setEditting(true)}
            // onBlur={() => {
            //   setTimeout(() => {
            //     setEditting(false);
            //     if (open <= 0) {
            //       setPrice(order.trigger_price?.toString() ?? "0");
            //     }
            //   }, 100);
            // }}
            autoFocus
            onKeyDown={handleKeyDown}
            containerClassName="orderly-h-auto orderly-pl-7"
            className="orderly-w-full orderly-flex-1 orderly-pl-9 orderly-pr-9 orderly-bg-base-700 orderly-px-2 orderly-py-1 orderly-rounded "
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
            <Check size={18} />
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
                You agree changing the trigger price of {base}-PERP order to{" "}
                <span className="orderly-text-warning">{commify(price)}</span>.
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
