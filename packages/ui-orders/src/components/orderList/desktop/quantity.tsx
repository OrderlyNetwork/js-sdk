import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { API, OrderSide } from "@orderly.network/types";
import { AlgoOrderRootType } from "@orderly.network/types";
import {
  cn,
  Flex,
  Popover,
  toast,
  Text,
  Slider,
  Button,
  PopoverTrigger,
  PopoverRoot,
  PopoverContent,
} from "@orderly.network/ui";
import { ConfirmContent, EditType } from "./editOrder/confirmContent";
import { InnerInput } from "./editOrder/innerInput";
import { useOrderListContext } from "../orderListContext";
import { useTPSLOrderRowContext } from "../tpslOrderRowContext";
import { useSymbolContext } from "../symbolProvider";
import { grayCell } from "../../../utils/util";
import { useMaxQty, useOrderEntry, utils } from "@orderly.network/hooks";
import { commifyOptional, Decimal } from "@orderly.network/utils";
import { useTranslation } from "@orderly.network/i18n";

export const OrderQuantity = (props: {
  order: API.OrderExt | API.AlgoOrder;
  disableEdit?: boolean;
  otherOrderQuantity?: (order: any) => number | undefined;
}) => {
  const { order, otherOrderQuantity } = props;
  const { reduce_only } = order;
  const [quantity, originSetQuantity] = useState<string>(
    order.quantity.toString()
  );

  const [editing, setEditing] = useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    setQuantity(order.quantity.toString());
  }, [props.order.quantity]);

  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();

  const { editOrder, editAlgoOrder, checkMinNotional } = useOrderListContext();
  const { onUpdateOrder: onUpdateTPSLOrder, position } =
    useTPSLOrderRowContext();

  const { base_dp, base, base_tick } = useSymbolContext();

  const setQuantity = async (qty: string, maxQty?: number): Promise<void> => {
    originSetQuantity(qty);
    const positionQty = Math.abs(position?.position_qty || 0);

    if (position && reduce_only && Number(qty) > positionQty) {
      setError(
        t("orders.quantity.lessThanPosition", {
          quantity: positionQty,
        })
      );
    } else {
      const quantity = Number(qty);
      if (maxQty && quantity > maxQty) {
        setError(
          t("orders.quantity.lessThan", {
            quantity: commifyOptional(maxQty, {
              fix: base_dp,
            }),
          })
        );
      } else {
        setError(undefined);
      }
    }
    return Promise.resolve();
  };

  const closePopover = () => {
    setOpen(false);
    setEditing(false);
  };
  const cancelPopover = () => {
    setOpen(false);
    setQuantity(order.quantity.toString());
    setEditing(false);
  };
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const clickHandler = () => {
    // console.log(
    //   "xxxxx click handler",
    //   checkMinNotional,
    //   quantity,
    //   error,
    //   quantity
    // );

    if (!!error) {
      return;
    }

    if (Number(quantity) === Number(order.quantity)) {
      setEditing(false);
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
  const quantitySliderRef = useRef<HTMLDivElement | null>(null);

  const handleClickOutside = (event: any) => {
    if (
      componentRef.current &&
      quantitySliderRef.current &&
      !componentRef.current.contains(event.target as Node) &&
      !quantitySliderRef.current.contains(event.target as Node) &&
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
  }, [open, order.quantity]);

  const trigger = () => {
    if (!editing || props.disableEdit) {
      return (
        <NormalState
          order={order}
          quantity={quantity}
          setEditing={setEditing}
          disableEdit={props.disableEdit}
        />
      );
    }

    return (
      <EditState
        inputRef={inputRef}
        quantitySliderRef={quantitySliderRef}
        base_dp={base_dp}
        base_tick={base_tick}
        quantity={quantity}
        setQuantity={setQuantity}
        editing={editing}
        setEditing={setEditing}
        handleKeyDown={handleKeyDown}
        onClick={onClick}
        onClose={cancelPopover}
        symbol={order.symbol}
        reduce_only={reduce_only}
        positionQty={position?.position_qty}
        error={error}
        confirmOpen={open}
        side={order.side}
        order={order}
        setError={setError}
      />
    );

    // return (
    //   <InnerInput
    //       inputRef={inputRef}
    //       dp={base_dp}
    //       value={quantity}
    //       setValue={setQuantity}
    //       setEditing={setEditing}
    //       handleKeyDown={handleKeyDown}
    //       onClick={onClick}
    //       onClose={cancelPopover}
    //       hintInfo={error} />
    // );
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
      contentProps={{
        onOpenAutoFocus: (e) => {
          // e.preventDefault();
          // e.stopPropagation();
        },
      }}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        ref={componentRef}
      >
        {trigger()}
      </div>
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
        grayCell(order) && "oui-text-base-contrast-20"
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

          !props.disableEdit &&
            "oui-bg-base-7 oui-px-2 oui-border oui-border-line-12"
        )}
      >
        <Text size="2xs">{quantity}</Text>
      </Flex>
    </Flex>
  );
};

const EditState: FC<{
  inputRef: any;
  quantitySliderRef: any;
  base_dp: number;
  base_tick: number;
  quantity: string;
  setQuantity: (quantity: string, maxQty: number) => Promise<void>;
  editing: boolean;
  confirmOpen: boolean;
  setEditing: (value: boolean) => void;
  handleKeyDown: (e: any) => void;
  onClick: (e: any) => void;
  onClose: () => void;
  error?: string;
  symbol: string;
  reduce_only: boolean;
  positionQty?: number;
  side?: string;
  order: any;
  setError: (err: string) => void;
}> = (props) => {
  const {
    inputRef,
    quantitySliderRef,
    base_dp,
    base_tick,
    quantity,
    setQuantity,
    editing,
    setEditing,
    handleKeyDown,
    onClick,
    onClose,
    error,
    symbol,
    reduce_only,
    positionQty,
    confirmOpen,
    side,
    order,
  } = props;

  // const { maxQty } = useOrderEntry(symbol, {
  //   initialOrder: {
  //     side,
  //   },
  // });

  const maxQty = useMaxQty(symbol, order.side, order.reduce_only);

  const qty = useMemo(() => {
    if (reduce_only) {
      return Math.abs(positionQty ?? 0);
    }
    return order.quantity + Math.abs(maxQty);
  }, [order.quantity, maxQty, reduce_only, positionQty]);

  const [sliderValue, setSliderValue] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (sliderValue === undefined) {
      const sliderValue = new Decimal(quantity)
        .div(qty)
        .abs()
        .mul(100)
        .toNumber();
      setSliderValue(sliderValue);
    }
  }, [sliderValue, qty, quantity]);

  const formatQuantity = async (_qty: string | number): Promise<void> => {
    if (base_tick > 0) {
      _qty = utils.formatNumber(_qty, base_tick) ?? _qty;
    }
    return setQuantity(`${_qty}`, qty);
  };

  return (
    <PopoverRoot open={!confirmOpen}>
      <PopoverTrigger>
        <InnerInput
          inputRef={inputRef}
          dp={base_dp}
          value={quantity}
          setValue={(e: string) => {
            const quantity = Math.abs(Math.min(Number(e), qty)).toString();
            setQuantity(e, qty);
            if (e.endsWith(".")) return;
            if (Number(quantity) === 0) {
              setSliderValue(0);
              return;
            }
            const sliderValue = new Decimal(e)
              .div(qty)
              .mul(100)
              .toDecimalPlaces(2, Decimal.ROUND_DOWN)
              .toNumber();
            setSliderValue(Math.min(100, sliderValue));
          }}
          setEditing={setEditing}
          handleKeyDown={handleKeyDown}
          onClick={onClick}
          onClose={onClose}
          onBlur={(e) => {
            formatQuantity(e.target.value);
          }}
          hintInfo={error}
        />
      </PopoverTrigger>
      <PopoverContent
        className="oui-w-[360px] oui-rounded-xl"
        align="start"
        side="bottom"
        onOpenAutoFocus={(event) => {
          // event.stopPropagation();
          event.preventDefault();
        }}
      >
        <Flex
          p={1}
          gap={2}
          width={"100%"}
          itemAlign={"start"}
          ref={quantitySliderRef}
        >
          <Text.numeral
            size="xs"
            intensity={98}
            className="oui-min-w-[30px] "
            dp={2}
            padding={false}
            unit="%"
            rm={Decimal.ROUND_DOWN}
          >
            {`${sliderValue}`}
          </Text.numeral>
          <Flex
            direction={"column"}
            width={"100%"}
            gap={2}
            className="oui-mt-[6px]"
          >
            <Slider
              markCount={4}
              value={[sliderValue ?? 0]}
              onValueChange={(e) => {
                const values = Array.from(e.values());
                setSliderValue(values[0]);
                const quantity = new Decimal(values[0])
                  .div(100)
                  .mul(qty)
                  .abs()
                  .toFixed(base_dp, Decimal.ROUND_DOWN);
                setQuantity(quantity, qty);
              }}
              onValueCommit={(values) => {
                const quantity = new Decimal(values[0])
                  .div(100)
                  .mul(qty)
                  .abs()
                  .toFixed(base_dp, Decimal.ROUND_DOWN);
                formatQuantity(quantity).finally(() => {
                  inputRef.current.focus();
                });
              }}
            />
            <Buttons
              onClick={(value) => {
                setSliderValue(value * 100);
                let quantity = new Decimal(value)
                  .mul(qty)
                  .abs()
                  .toFixed(base_dp, Decimal.ROUND_DOWN);
                quantity = utils.formatNumber(quantity, base_tick) ?? quantity;

                setQuantity(quantity, qty);
                setTimeout(() => {
                  inputRef.current.focus();
                  inputRef.current.setSelectionRange(
                    quantity.length,
                    quantity.length
                  );
                }, 100);
              }}
            />
          </Flex>
        </Flex>
      </PopoverContent>
    </PopoverRoot>
  );

  // return (
  //   <Popover
  //     open={editing}
  //     onOpenChange={setSliderOpen}
  //     content={
  //       <Flex p={1} gap={2} width={"100%"} itemAlign={"start"}>
  //         <Text size="xs" intensity={98} className="oui-min-w-[30px]">
  //           {`${sliderValue}%`}
  //         </Text>
  //         <Flex direction={"column"} width={"100%"} gap={2}>
  //           <Slider
  //             markCount={4}
  //             value={[sliderValue]}
  //             onValueChange={(e) => {
  //               const values = Array.from(e.values());
  //               setSliderValue(values[0]);
  //               // resetQuantity(values[0]);
  //             }}
  //           />
  //           <Buttons
  //             onClick={(value) => {
  //               setSliderValue(value * 100);
  //               // resetQuantity(value * 100);
  //             }}
  //           />
  //         </Flex>
  //       </Flex>
  //     }
  //   >
  //     <InnerInput
  //       inputRef={inputRef}
  //       dp={base_dp}
  //       value={quantity}
  //       setValue={setQuantity}
  //       setEditing={setEditing}
  //       handleKeyDown={handleKeyDown}
  //       onClick={onClick}
  //       onClose={onClose}
  //       hintInfo={error}
  //       onFocus={(e) => {
  //         setSliderOpen(true);
  //       }}
  //       onBlur={(e) => {
  //         setSliderOpen(false);
  //       }}
  //     />
  //   </Popover>
  // );
};

const Buttons = (props: { onClick: (value: number) => void }) => {
  const list = [
    {
      label: "0%",
      value: 0,
    },
    {
      label: "25%",
      value: 0.25,
    },
    {
      label: "50%",
      value: 0.5,
    },
    {
      label: "75%",
      value: 0.75,
    },
    {
      label: "Max",
      value: 1,
    },
  ];

  return (
    <Flex gap={2} width={"100%"}>
      {list.map((item, index) => {
        return (
          <Button
            key={index}
            variant="outlined"
            color="secondary"
            size="xs"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              props.onClick(item.value);
            }}
            className="oui-w-1/5"
          >
            {item.label}
          </Button>
        );
      })}
    </Flex>
  );
};
