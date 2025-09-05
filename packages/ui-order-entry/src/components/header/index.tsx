import { useTranslation } from "@orderly.network/i18n";
import { OrderlyOrder, OrderSide, OrderType } from "@orderly.network/types";
import { Button, cn, Flex } from "@orderly.network/ui";
import { OrderTypeSelect } from "../orderTypeSelect";
import { LeverageBadge } from "./LeverageBadge";

type OrderEntryHeaderProps = {
  symbol: string;
  side: OrderSide;
  canTrade: boolean;
  order_type: OrderType;
  setOrderValue: (key: keyof OrderlyOrder, value: any) => void;
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
          // showSheet ? "oui-grid-cols-3" : "oui-grid-cols-2",
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
          "oui-grid oui-w-full oui-gap-x-2 lg:oui-flex lg:oui-gap-x-[6px]",
          "oui-grid-cols-2",
        )}
      >
        <OrderTypeSelect
          type={order_type!}
          side={side}
          canTrade={canTrade}
          onChange={(type) => {
            setOrderValue("order_type", type);
          }}
        />
        <LeverageBadge symbol={props.symbol} side={props.side} />
      </div>
    </>
  );
}
