import { API } from "@orderly.network/types";
import { commifyOptional } from "@orderly.network/utils";
import { FC, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useSymbolPriceRange } from "@orderly.network/hooks";
import { cn, Flex, Popover, toast, Text } from "@orderly.network/ui";

import { ConfirmContent, EditType } from "./editOrder/confirmContent";
import { InnerInput } from "./editOrder/innerInput";
import { useOrderListContext } from "../orderListContext";
import { useSymbolContext } from "../symbolProvider";
import { grayCell } from "../../../utils/util";

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

  const { editOrder, editAlgoOrder, checkMinNotional } = useOrderListContext();

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
        (result: any) => {
          closePopover();
          setPrice(price);
          // setTimeout(() => inputRef.current?.blur(), 300);
        },
        (err: any) => {
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

  if (isAlgoMarketOrder || price === "Market") {
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
        dp={quote_dp}
        value={price}
        setPrice={setPrice}
        setEditting={setEditting}
        handleKeyDown={handleKeyDown}
        onClick={onClick}
        onClose={cancelPopover}
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
          type={EditType.price}
          base={base}
          value={price}
          cancelPopover={cancelPopover}
          isSubmitting={isSubmitting}
          onConfirm={onConfirm}
        />
      }
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
