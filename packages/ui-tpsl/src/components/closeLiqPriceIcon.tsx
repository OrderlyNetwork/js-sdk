import { ERROR_MSG_CODES, OrderValidationResult } from "@orderly.network/hooks";
import { useOrderEntryFormErrorMsg } from "@orderly.network/react-app";
import { cn, ExclamationFillIcon, Tooltip } from "@orderly.network/ui";

const CloseToLiqPriceIcon = ({
  slPriceError,
  className,
}: {
  slPriceError: OrderValidationResult | null;
  className?: string;
}) => {
  const { getErrorMsg } = useOrderEntryFormErrorMsg(slPriceError);
  const isSlPriceWarning =
    slPriceError?.sl_trigger_price?.type === ERROR_MSG_CODES.SL_PRICE_WARNING;

  const icon = (
    <ExclamationFillIcon
      onMouseEnter={(e) => e.stopPropagation()}
      onMouseLeave={(e) => e.stopPropagation()}
      onPointerEnter={(e) => e.stopPropagation()}
      onPointerLeave={(e) => e.stopPropagation()}
      className={cn(
        "oui-size-4 oui-text-warning-darken hover:oui-cursor-pointer",
        className,
      )}
    />
  );
  if (!isSlPriceWarning || !slPriceError) return null;

  return (
    <Tooltip
      content={getErrorMsg("sl_trigger_price")}
      className="oui-max-w-[240px] oui-text-base-contrast-80"
    >
      {icon}
    </Tooltip>
  );
};
CloseToLiqPriceIcon.displayName = "CloseToLiqPriceIcon";

export { CloseToLiqPriceIcon };
