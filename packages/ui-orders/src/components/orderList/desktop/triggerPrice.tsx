import { FC, useEffect, useMemo, useRef, useState } from "react";
import { API, OrderType } from "@orderly.network/types";
import { cn, Flex, Popover, toast, Text } from "@orderly.network/ui";
import { EditType } from "../../../type";
import { grayCell } from "../../../utils/util";
import { useSymbolContext } from "../../provider/symbolContext";
import { useOrderListContext } from "../orderListContext";
import { ConfirmContent } from "./editOrder/confirmContent";
import { InnerInput } from "./editOrder/innerInput";

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
  const isBracketOrder = order?.algo_type === "BRACKET";
  const isTrailingStopOrder = order?.algo_type === OrderType.TRAILING_STOP;

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { editAlgoOrder, checkMinNotional } = useOrderListContext();

  const { base, quote_dp, quote_max, quote_min } = useSymbolContext();

  const hintInfo = useMemo(() => {
    if (!isAlgoOrder || isBracketOrder) if (!editing) return undefined;
    if (Number(price) > quote_max) {
      return `Trigger price must be less than ${quote_max}`;
    } else if (Number(price) < quote_min) {
      return `Trigger price must be greater than ${quote_min}`;
    }
  }, [editing, price, isAlgoOrder, isBracketOrder]);

  const closePopover = () => {
    setOpen(false);
    setEditing(false);
  };
  const cancelPopover = () => {
    setPrice(order.trigger_price?.toString() ?? "0");
    setOpen(false);
    setEditing(false);
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
  }, [open, order.trigger_price]);

  const onClick = (event: any) => {
    event?.stopPropagation();
    event?.preventDefault();

    setEditing(false);

    if (Number(price) === Number(order.trigger_price)) {
      return;
    }

    if (order.price && order.reduce_only !== true) {
      const notionalText = checkMinNotional(
        order.symbol,
        order.price,
        order.quantity,
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
    if ((hintInfo ?? "").length > 0) {
      return;
    }
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
        },
      )
      .finally(() => setIsSubmitting(false));
  };

  const inputRef = useRef<HTMLInputElement>(null);

  if (!isAlgoOrder || isBracketOrder || isTrailingStopOrder) {
    return <Text>{`--`}</Text>;
  }
  const trigger = () => {
    if (!editing || props.disableEdit) {
      return (
        <NormalState
          order={order}
          price={price}
          setEditing={setEditing}
          disableEdit={props.disableEdit}
        />
      );
    }

    return (
      <InnerInput
        inputRef={inputRef}
        dp={quote_dp}
        value={price}
        setValue={setPrice}
        setEditing={setEditing}
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
          type={EditType.triggerPrice}
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
        grayCell(order) && "oui-text-base-contrast-20",
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
          !props.disableEdit &&
            "oui-bg-base-7 oui-px-2 oui-border oui-border-line-12",
        )}
      >
        <Text size="2xs">{price}</Text>
      </Flex>
    </div>
  );
};
