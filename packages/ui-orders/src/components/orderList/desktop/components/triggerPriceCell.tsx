import { useCallback, useState } from "react";
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

export const TriggerPriceCell = (props: {
  order: API.AlgoOrderExt;
  disabled?: boolean;
}) => {
  const { order } = props;
  const originValue = order.trigger_price?.toString();

  const [value, setValue] = useState<string>(originValue);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    field: "trigger_price",
    originValue,
    value,
  });

  const onConfirm = useCallback(() => {
    setIsSubmitting(true);

    const data: any = {
      trigger_price: value,
      algo_order_id: order.algo_order_id,
    };

    editAlgoOrder(`${order.algo_order_id}`, data)
      .then((result: any) => {
        closePopover();
        setValue(value);
      })
      .catch((err: any) => {
        toast.error(err.message);
        cancelPopover();
      })
      .finally(() => setIsSubmitting(false));
  }, [order.algo_order_id, value, cancelPopover]);

  const renderContent = () => {
    if (!editing || props.disabled) {
      return (
        <PreviewCell
          value={value}
          status={getOrderStatus(order)}
          setEditing={setEditing}
          disabled={props.disabled}
        />
      );
    }

    return (
      <EditableCellInput
        value={value}
        onChange={setValue}
        onClick={onClick}
        error={error}
        formatters={[inputFormatter.dpFormatter(quote_dp)]}
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
          value={value}
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
        ref={containerRef}
      >
        {renderContent()}
      </div>
    </Popover>
  );
};
