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
import {
  useDebouncedCallback,
  useSymbolPriceRange,
} from "@orderly.network/hooks";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { Divider } from "@/divider";
import { cleanStringStyle } from "@orderly.network/hooks";
import { Input } from "@/input";

export const Price = (props: { order: API.OrderExt }) => {
  const { order } = props;

  const [price, setPrice] = useState<string>(
    order.price?.toString() ?? "Market"
  );

  const [open, setOpen] = useState(0);
  const [editting, setEditting] = useState(false);

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
      !componentRef.current.contains(event.target) &&
      open <= 0
    ) {
      setPrice(order.price?.toString() ?? "Market");
      setEditting(false);
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

  // if (!editting && open <= 0) {
  //   return <NormalState order={order} price={price} setEditing={setEditting} />;
  // }

  // return (
  //   <EditingState
  //     order={order}
  //     price={price}
  //     setPrice={setPrice}
  //     editting={editting}
  //     setEditting={setEditting}
  //     open={open}
  //     setOpen={setOpen}
  //   />
  // );
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

  const isAlgoOrder = order?.algo_order_id !== undefined;
  // console.log("price node", order);

  const isStopMarket = order?.type === "MARKET" && isAlgoOrder;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { editOrder, editAlgoOrder, checkMinNotional } =
    useContext(OrderListContext);

  const boxRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const { base, base_dp } = useSymbolContext();
  const closePopover = () => {
    setOpen(0);
    setEditting(false);
  };
  const cancelPopover = () => {
    setOpen(-1);
    setPrice(order.price?.toString() ?? "Market");
    setEditting(false);
  };

  const onClick = (event: any) => {
    event?.stopPropagation();
    event?.preventDefault();

    if (Number(price) === Number(order.price)) {
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

    setOpen(1);
  };

  const onClickCancel = (order: any) => {
    setPrice(order.price);
    setEditting(false);
  };

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      onClick(event);
    }
  };

  const onConfirm = useDebouncedCallback(
    () => {
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

      // @ts-ignore
      if (order.visible_quantity === 0) {
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

      // @ts-ignore
      future
        .then(
          (result) => {
            setPrice(price);
            closePopover();
            // setTimeout(() => inputRef.current?.blur(), 300);
          },
          (err) => {
            toast.error(err.message);
            // @ts-ignore
            setPrice(order.price?.toString());
            cancelPopover();
          }
        )
        .finally(() => setIsSubmitting(false));
    },
    500,
    { leading: true, trailing: false }
  );

  const inputRef = useRef<HTMLInputElement>(null);
  // @ts-ignore
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
        <PopoverAnchor>
          {isStopMarket && <span>Market</span>}
          {!isStopMarket && (
            <Tooltip open={hintInfo.length > 0}>
              <TooltipTrigger asChild>
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
                  //       setPrice(order.price?.toString() ?? "Market");
                  //     }
                  //   }, 100);
                  // }}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  containerClassName="orderly-h-auto orderly-pl-7"
                  className="orderly-w-full orderly-flex-1 orderly-pl-9 orderly-pr-9 orderly-bg-base-700 orderly-px-2 orderly-py-1 orderly-rounded"
                />
              </TooltipTrigger>
              <TooltipContent
                className="orderly-max-w-[270px] orderly-rounded-lg orderly-bg-base-400 orderly-p-3 orderly-z-50"
                align="center"
              >
                {hintInfo}
                <TooltipArrow
                  width={10}
                  height={7}
                  className="orderly-fill-base-400"
                />
              </TooltipContent>
            </Tooltip>
          )}
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
                You agree changing the price of {base}-PERP order to{" "}
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
                {/* @ts-ignore */}
                <Button
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
