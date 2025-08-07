import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useSymbolPriceRange } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { API } from "@orderly.network/types";
import { OrderType } from "@orderly.network/types";
import { cn, Flex, Popover, toast, Text } from "@orderly.network/ui";
import { commifyOptional } from "@orderly.network/utils";
import { grayCell } from "../../../utils/util";
import { useSymbolContext } from "../../provider/symbolContext";
import { useOrderListContext } from "../orderListContext";
import { ConfirmContent, EditType } from "./editOrder/confirmContent";
import { InnerInput } from "./editOrder/innerInput";

export const Price = (props: {
  order: API.OrderExt;
  disableEdit?: boolean;
}) => {
  const { order } = props;
  const { t } = useTranslation();

  const [price, setPrice] = useState<string>(() => {
    if (order.type === OrderType.MARKET && !order.price) {
      return "Market";
    }
    return order.price?.toString() ?? "Market";
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  const isAlgoOrder = order?.algo_order_id !== undefined;

  const isStopMarket = order?.type === "MARKET" && isAlgoOrder;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { editOrder, editAlgoOrder, checkMinNotional } = useOrderListContext();

  const { base, quote_dp } = useSymbolContext();
  const rangeInfo = useSymbolPriceRange(
    order.symbol,
    // @ts-ignore
    order.side,
    isAlgoOrder ? order.trigger_price : undefined,
  );
  const closePopover = () => {
    setOpen(false);
    setEditing(false);
  };
  const cancelPopover = () => {
    setOpen(false);
    setPrice(order.price?.toString() ?? "Market");
    setEditing(false);
  };

  const hintInfo = useMemo(() => {
    if (!rangeInfo) return "";
    if (isStopMarket) return "";
    if (!editing) return "";

    if (Number(price) > rangeInfo.max) {
      return t("orders.price.greaterThan", { max: rangeInfo.max });
    }
    if (Number(price) < rangeInfo.min) {
      return t("orders.price.lessThan", { min: rangeInfo.min });
    }
    return "";
  }, [isStopMarket, editing, rangeInfo, price, t]);

  const onClick = (event: any) => {
    event?.stopPropagation();
    event?.preventDefault();

    if (hintInfo.length > 0) {
      return;
    }

    if (price === `${order.price}`) {
      setEditing(false);
      return;
    }

    if (order.reduce_only !== true) {
      const notionalText = checkMinNotional(
        order.symbol,
        price,
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
          cancelPopover();
        },
      )
      .finally(() => setIsSubmitting(false));
  };

  const inputRef = useRef<HTMLInputElement>(null);

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
  }, [open, order.price]);

  const isAlgoMarketOrder = order.algo_order_id && order.type == "MARKET";

  if (isAlgoMarketOrder || price === "Market") {
    return <span>{t("common.marketPrice")}</span>;
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
            "oui-bg-base-7 oui-px-2  oui-border oui-border-line-12",
        )}
      >
        <Text size="2xs">{commifyOptional(price)}</Text>
      </Flex>
    </div>
  );
};
