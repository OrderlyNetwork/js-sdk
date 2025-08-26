import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useOrderEntity } from "@orderly.network/hooks";
import { useOrderEntryFormErrorMsg } from "@orderly.network/react-app";
import { API, OrderSide, OrderType } from "@orderly.network/types";
import {
  cn,
  Flex,
  Popover,
  toast,
  Text,
  inputFormatter,
} from "@orderly.network/ui";
import { commifyOptional } from "@orderly.network/utils";
import { EditType } from "../../../type";
import { getOrderStatus, isGrayCell } from "../../../utils/util";
import { useSymbolContext } from "../../provider/symbolContext";
import { CustomInput } from "../customInput";
import { useOrderListContext } from "../orderListContext";
import { ConfirmContent } from "./editOrder/confirmContent";

export const TrailingCallback = (props: {
  order: API.AlgoOrder;
  disableEdit?: boolean;
}) => {
  const { order } = props;
  const { callback_value, callback_rate } = order;

  const disableEdit = props.disableEdit || order.is_triggered;

  const { callbackUnit, originValue } = useMemo(() => {
    const callbackUnit: "quote" | "percentage" = callback_value
      ? "quote"
      : "percentage";
    const originValue =
      callbackUnit === "quote"
        ? callback_value?.toString()
        : ((callback_rate || 0) * 100)?.toString();
    return { callbackUnit, originValue };
  }, [callback_value, callback_rate]);

  const [value, setValue] = useState<string>(originValue!);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const { editAlgoOrder } = useOrderListContext();

  const { base, quote_dp } = useSymbolContext();

  const { errors, validate, clearErrors } = useOrderEntity({
    symbol: order.symbol,
    order_type: order.algo_type as OrderType,
    side: order.side as OrderSide,
    order_quantity: order.quantity?.toString(),
    callback_unit: callbackUnit,
    callback_value: callbackUnit === "quote" ? value : undefined,
    callback_rate: callbackUnit === "percentage" ? value : undefined,
  });
  const { getErrorMsg } = useOrderEntryFormErrorMsg(errors);

  const closePopover = useCallback(() => {
    setOpen(false);
    setEditing(false);
  }, []);

  const cancelPopover = useCallback(() => {
    closePopover();
    setValue(originValue!);
  }, [originValue]);

  useEffect(() => {
    // if value is not changed, then don't validate
    if (value === originValue) {
      clearErrors();
      return;
    }
    validate()
      .then((order) => {
        console.log("order", order);
      })
      .catch((errors) => {
        console.log("errors", errors);
      });
  }, [value, originValue]);

  const onConfirm = useCallback(() => {
    setSubmitting(true);

    const data: any = {
      algo_order_id: order.algo_order_id,
      // symbol: order.symbol,
      // order_type: order.type,
      // side: order.side,
      // client_order_id: order.client_order_id,
      // order_tag: order.order_tag,
      // order_quantity: order.quantity,
      callback_value: callbackUnit === "quote" ? value : undefined,
      callback_rate:
        callbackUnit === "percentage" ? `${Number(value) / 100}` : undefined,
    };

    editAlgoOrder(order.algo_order_id.toString(), data)
      .then((result: any) => {
        closePopover();
        setValue(value);
      })
      .catch((err: any) => {
        toast.error(err.message);
        cancelPopover();
      })
      .finally(() => setSubmitting(false));
  }, [order.algo_order_id, callbackUnit, value, cancelPopover]);

  const onClick = useCallback(
    async (event: any) => {
      event?.stopPropagation();
      event?.preventDefault();

      // if value is not changed, then don't open popover
      if (value === originValue) {
        setEditing(false);
        return;
      }

      setOpen(true);
    },
    [value, originValue],
  );

  const handleKeyDown = useCallback(
    (event: any) => {
      if (event.key === "Enter") {
        onClick(event);
      }
    },
    [onClick],
  );

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        !open
      ) {
        cancelPopover();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, cancelPopover]);

  const renderContent = () => {
    if (!editing || disableEdit) {
      return (
        <NormalState
          status={getOrderStatus(order)}
          value={value}
          suffix={callbackUnit === "percentage" ? "%" : undefined}
          setEditing={setEditing}
          disableEdit={disableEdit}
        />
      );
    }

    return (
      <CustomInput
        value={value}
        onChange={setValue}
        onClick={onClick}
        handleKeyDown={handleKeyDown}
        error={getErrorMsg(
          callbackUnit === "quote" ? "callback_value" : "callback_rate",
        )}
        formatters={
          callbackUnit === "quote"
            ? [
                inputFormatter.currencyFormatter,
                inputFormatter.dpFormatter(quote_dp),
              ]
            : [inputFormatter.dpFormatter(1)]
        }
      />
    );
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      content={
        <ConfirmContent
          type={
            callbackUnit === "quote"
              ? EditType.callbackValue
              : EditType.callbackRate
          }
          base={base}
          value={callbackUnit === "quote" ? value : `${value}%`}
          cancelPopover={cancelPopover}
          isSubmitting={submitting}
          onConfirm={onConfirm}
        />
      }
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        ref={containerRef}
      >
        {renderContent()}
      </div>
    </Popover>
  );
};

type NormalStateProps = {
  status?: string;
  value: string;
  setEditing: any;
  disableEdit?: boolean;
  suffix?: string;
};

const NormalState = memo((props: NormalStateProps) => {
  const { status, value, disableEdit } = props;

  return (
    <div
      className={cn(
        "oui-flex oui-items-center oui-justify-start",
        "oui-relative oui-max-w-[110px] oui-gap-1 oui-font-semibold",
        isGrayCell(status) && "oui-text-base-contrast-20",
      )}
      onClick={(e) => {
        if (!disableEdit) {
          e.stopPropagation();
          e.preventDefault();
          props.setEditing(true);
        }
      }}
    >
      <Flex
        r="base"
        className={cn(
          "oui-h-[28px] oui-min-w-[70px]",
          !disableEdit &&
            "oui-border oui-border-line-12 oui-bg-base-7 oui-px-2",
        )}
      >
        <Text size="2xs">
          {commifyOptional(value)}
          {props.suffix}
        </Text>
      </Flex>
    </div>
  );
});
