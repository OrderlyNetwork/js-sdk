import { useTranslation } from "@veltodefi/i18n";
import { OrderlyOrder, OrderSide, OrderType } from "@veltodefi/types";
import { Button, cn } from "@veltodefi/ui";
import { OrderTypeSelect } from "../orderTypeSelect";
import { LeverageBadge } from "./LeverageBadge";

type OrderEntryHeaderProps = {
  symbol: string;
  side: OrderSide;
  canTrade: boolean;
  order_type: OrderType;
  setOrderValue: (key: keyof OrderlyOrder, value: any) => void;
  symbolLeverage?: number;
};

export function OrderEntryHeader(props: OrderEntryHeaderProps) {
  const { canTrade, side, order_type, setOrderValue } = props;
  const { t } = useTranslation();

  return (
    <>
      <div
        className={cn(
          "oui-grid oui-w-full oui-flex-1 oui-gap-x-2 lg:oui-flex lg:oui-gap-x-[6px]",
          "oui-grid-cols-2",
        )}
      >
        <Button
          onClick={() => {
            props.setOrderValue("side", OrderSide.BUY);
          }}
          size={"md"}
          fullWidth
          data-type={OrderSide.BUY}
          className={cn(
            side === OrderSide.BUY && canTrade
              ? "oui-bg-success-darken hover:oui-bg-success-darken/80 active:oui-bg-success-darken/80"
              : "oui-bg-base-7 oui-text-base-contrast-36 hover:oui-bg-base-6 active:oui-bg-base-6",
          )}
          data-testid="oui-testid-orderEntry-side-buy-button"
        >
          {t("common.buy")}
        </Button>
        <Button
          onClick={() => {
            props.setOrderValue("side", OrderSide.SELL);
          }}
          data-type={OrderSide.SELL}
          fullWidth
          size={"md"}
          className={cn(
            side === OrderSide.SELL && props.canTrade
              ? "oui-bg-danger-darken hover:oui-bg-danger-darken/80 active:oui-bg-danger-darken/80"
              : "oui-bg-base-7 oui-text-base-contrast-36 hover:oui-bg-base-6 active:oui-bg-base-6",
          )}
          data-testid="oui-testid-orderEntry-side-sell-button"
        >
          {t("common.sell")}
        </Button>
      </div>
      <div
        className={cn(
          "oui-grid oui-gap-x-2 lg:oui-flex lg:oui-gap-x-[6px]",
          "oui-grid-cols-2",
        )}
      >
        <div className="oui-w-full">
          <OrderTypeSelect
            type={order_type!}
            side={side}
            canTrade={canTrade}
            onChange={(type) => {
              setOrderValue("order_type", type);
            }}
          />
        </div>
        <div className="oui-w-full">
          <LeverageBadge
            symbol={props.symbol}
            side={props.side}
            symbolLeverage={props.symbolLeverage}
          />
        </div>
      </div>
    </>
  );
}
