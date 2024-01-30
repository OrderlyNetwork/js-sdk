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
import { useSymbolPriceRange } from "@orderly.network/hooks";
import { Tooltip, TooltipArrow, TooltipContent, TooltipTrigger } from "@radix-ui/react-tooltip";

export const TriggerPrice = (props: { order: API.OrderExt }) => {
    const { order } = props;

    const [price, setPrice] = useState<string>(
        order.price?.toString() ?? "Market"
    );

    const isAlgoOrder = true;// order?.algo_order_id !== undefined;





    const [open, setOpen] = useState(0);
    const [editting, setEditting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { editOrder } = useContext(OrderListContext);

    const boxRef = useRef<HTMLDivElement>(null);
    const { base, base_dp } = useSymbolContext();
    const closePopover = () => setOpen(0);
    const cancelPopover = () => setOpen(-1);

    useEffect(() => {
        const clickHandler = (event: MouseEvent) => {
            // close the input when click outside of boxRef
            const el = boxRef?.current;
            if (!el || el.contains(event.target as Node)) {
                return;
            }

            setEditting(false);
        };

        document.body.addEventListener("click", clickHandler);

        return () => {
            document.body.removeEventListener("click", clickHandler);
        };
    }, []);

    const onClick = (event: MouseEvent) => {
        // event.stopPropagation();
        // event.preventDefault();

        setEditting(false);

        if (Number(price) === Number(order.price)) {
            return;
        }

        setOpen(1);
    };

    const onClickCancel = (order: any) => {
        setPrice(order.price);
        setEditting(false);
    };

    const onConfirm = () => {
        setIsSubmitting(true);
        // @ts-ignore
        editOrder(order.order_id, {
            order_price: price,
            order_quantity: order.quantity,
            symbol: order.symbol,
            order_type: order.type,
            side: order.side,
            reduce_only: Boolean(order.reduce_only),
        })
            .then(
                (result) => {
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
    };

    const inputRef = useRef<HTMLInputElement>(null);

    if (!isAlgoOrder) {
        return <div>-</div>
    }

    return (
        <Popover
            open={open > 0}
            onOpenChange={(open: boolean) => setOpen(open ? 1 : 0)}
        >
            <div
                className={
                    "orderly-max-w-[130px] orderly-flex orderly-justify-start orderly-items-center orderly-gap-1 orderly-relative orderly-font-semibold"
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
                        className="hover:orderly-bg-base-contrast/10 orderly-rounded orderly-px-1 orderly-text-base-contrast-54 hover:orderly-text-base-contrast-80"
                        onClick={() => onClickCancel(order)}
                    >
                        {/* @ts-ignore */}
                        <X size={18} />
                    </button>
                </div>


                <PopoverAnchor asChild>

                    {order.status === OrderStatus.NEW ? (
                        <PriceInput
                            inputRef={inputRef}
                            symbol={order.symbol}
                            price={price}
                            setPrice={setPrice}
                            editting={editting}
                            setEditting={setEditting}
                            side={order.side}

                        />
                    ) : (
                        <Numeral precision={base_dp}>{price}</Numeral>
                    )}
                </PopoverAnchor>
                <div
                    className={cn("orderly-absolute orderly-right-1 orderly-flex", {
                        "orderly-animate-in orderly-fade-in orderly-zoom-in": editting,
                        "orderly-animate-out orderly-fade-out orderly-zoom-out  orderly-hidden":
                            !editting,
                    })}
                >
                    <button
                        className="hover:orderly-bg-base-contrast/10 orderly-rounded orderly-px-1 orderly-text-base-contrast-54 hover:orderly-text-base-contrast-80"
                        // @ts-ignore
                        onClick={onClick}
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
                                <Button loading={isSubmitting} onClick={onConfirm}>
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


export const PriceInput: FC<{
    symbol: string,
    inputRef: any,
    price: any,
    setPrice: any,
    editting: boolean,
    setEditting: any,
    side: string,

}> = (props) => {
    const { symbol, inputRef, price, setPrice, editting, setEditting, side } = props;
    const rangeInfo = useSymbolPriceRange(symbol);
    // const [open, setOpen] = useState(false);

    const hintInfo = useMemo(() => {
        if (!rangeInfo) return "";

        if (side === "BUY") {
            if (price > rangeInfo.max) {
                return `Price can not be higher than ${rangeInfo.max} USDC.`
            }
        } else {
            if (price < rangeInfo.min) {
                return `Price can not be lower than ${rangeInfo.min} USDC.`
            }
        }
        return "";

    }, [rangeInfo, price, side]);

    

    return (
        <Tooltip open={hintInfo.length > 0 && editting}>
            <TooltipTrigger asChild>
                <input
                    ref={inputRef}
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    onFocus={() => setEditting(true)}
                    className={cn(
                        "orderly-w-0 orderly-flex-1 orderly-bg-base-700 orderly-px-2 orderly-py-1 orderly-rounded focus-visible:orderly-outline-1 focus-visible:orderly-outline-primary-light focus-visible:orderly-outline focus-visible:orderly-ring-0",
                        {
                            "orderly-pl-8": editting,
                        }
                    )}
                />
            </TooltipTrigger>
            <TooltipContent 
                align="center"
                className="orderly-z-50 data-[state=delayed-open]:data-[side=top]:orderly-animate-slideDownAndFade data-[state=delayed-open]:data-[side=right]:orderly-animate-slideLeftAndFade data-[state=delayed-open]:data-[side=left]:orderly-animate-slideRightAndFade data-[state=delayed-open]:data-[side=bottom]:orderly-animate-slideUpAndFade orderly-text-base-contrast orderly-select-none orderly-rounded orderly-bg-base-400 orderly-px-[15px] orderly-py-[10px] orderly-text-3xs orderly-leading-none orderly-shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] orderly-will-change-[transform,opacity]"
                sideOffset={5}
            >
                <div>
                    {hintInfo}
                </div>
                <TooltipArrow className="orderly-fill-base-400" />
            </TooltipContent>
        </Tooltip>
    );
}