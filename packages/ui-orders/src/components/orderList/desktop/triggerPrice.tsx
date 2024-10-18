import { API } from "@orderly.network/types";
import { FC, useContext, useEffect, useRef, useState } from "react";
import { cn, Flex, Popover, toast, Text } from "@orderly.network/ui";

import { ConfirmContent, EditType } from "./editOrder/confirmContent";
import { InnerInput } from "./editOrder/innerInput";
import { useOrderListContext } from "../orderListContext";
import { useSymbolContext } from "../symbolProvider";
import { grayCell } from "../../../utils/util";

export const TriggerPrice = (props: {
  order: API.AlgoOrderExt;
  disableEdit?: boolean;
}) => {
  const { order } = props;

  const [price, setPrice] = useState<string>("");

  useEffect(() => {
    setPrice(order.trigger_price?.toString() ?? "0");
  }, [order.trigger_price]);

  const isAlgoOrder = order?.algo_order_id !== undefined;
  const isBracketOrder = (order?.algo_type === 'BRACKET');
  const [open, setOpen] = useState(false);
  const [editting, setEditting] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { editAlgoOrder, checkMinNotional } = useOrderListContext();

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
        (result: any) => {
          closePopover();
          setPrice(price);
          // setTimeout(() => inputRef.current?.blur(), 300);
        },
        (err: any) => {
          toast.error(err.message);

          setPrice(order.trigger_price?.toString() ?? "--");
          cancelPopover();
        }
      )
      .finally(() => setIsSubmitting(false));
  };

  const inputRef = useRef<HTMLInputElement>(null);

  if (!isAlgoOrder || isBracketOrder) {
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
        dp={quote_dp}
        value={price}
        setPrice={setPrice}
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
          type={EditType.triggerPrice}
          base={base}
          value={price}
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
