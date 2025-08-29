import { useCallback, useMemo, useState } from "react";
import { API } from "@orderly.network/types";
import { Popover, toast, inputFormatter } from "@orderly.network/ui";
import { EditType } from "../../../../type";
import { getOrderStatus } from "../../../../utils/util";
import { useSymbolContext } from "../../../provider/symbolContext";
import { useOrderListContext } from "../../orderListContext";
import { ConfirmContent } from "../editOrder/confirmContent";
import { usePopoverState } from "../hooks/usePopoverState";
import { useValidateField } from "../hooks/useValidateField";
import { EditableCellInput } from "./editableCellInput";
import { PreviewCell } from "./previewCell";

export const TrailingCallback = (props: {
  order: API.AlgoOrderExt;
  disabled?: boolean;
}) => {
  const { order } = props;
  const { callback_value, callback_rate } = order;

  const isCallbackValue = !!callback_value;
  const isCallbackRate = !!callback_rate;

  const originValue = useMemo(() => {
    return callback_rate
      ? (callback_rate * 100).toString()
      : callback_value?.toString()!;
  }, [callback_value, callback_rate]);

  const [value, setValue] = useState<string>(originValue!);
  const [submitting, setSubmitting] = useState(false);

  const disabled = props.disabled || order.is_triggered;

  const { editAlgoOrder } = useOrderListContext();

  const { base, quote_dp } = useSymbolContext();

  const {
    open,
    setOpen,
    editing,
    setEditing,
    containerRef,
    closePopover,
    cancelPopover,
    onClick,
  } = usePopoverState({
    originValue,
    value,
    setValue,
  });

  const { error } = useValidateField({
    order,
    originValue,
    value,
    field: isCallbackValue ? "callback_value" : "callback_rate",
    fieldValues: {
      callback_value: isCallbackValue ? value : undefined,
      callback_rate: isCallbackRate ? value : undefined,
    },
  });

  const onConfirm = useCallback(() => {
    setSubmitting(true);

    const data: any = {
      algo_order_id: order.algo_order_id,
      callback_value: isCallbackValue ? value : undefined,
      callback_rate: isCallbackRate ? `${Number(value) / 100}` : undefined,
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
  }, [order.algo_order_id, value, cancelPopover]);

  const renderContent = () => {
    const suffix = isCallbackRate ? "%" : undefined;

    if (!editing || disabled) {
      return (
        <PreviewCell
          status={getOrderStatus(order)}
          value={value}
          setEditing={setEditing}
          disabled={disabled}
          suffix={suffix}
        />
      );
    }

    const formatters = isCallbackRate
      ? [inputFormatter.dpFormatter(1)]
      : [
          inputFormatter.currencyFormatter,
          inputFormatter.dpFormatter(quote_dp),
        ];

    return (
      <EditableCellInput
        value={value}
        onChange={setValue}
        onClick={onClick}
        error={error}
        suffix={suffix}
        formatters={formatters}
      />
    );
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      content={
        <ConfirmContent
          type={isCallbackRate ? EditType.callbackRate : EditType.callbackValue}
          base={base}
          value={isCallbackRate ? `${value}%` : value}
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
