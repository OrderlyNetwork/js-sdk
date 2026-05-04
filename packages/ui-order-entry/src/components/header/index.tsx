import {
  MarginMode,
  OrderlyOrder,
  OrderSide,
  OrderType,
} from "@orderly.network/types";
import {
  OrderEntryBuySellSwitchInjectabled,
  OrderEntryTypeTabsInjectabled,
} from "../orderEntry.injectabled";
import { LeverageBadge } from "./LeverageBadge";

type OrderEntryHeaderProps = {
  symbol: string;
  side: OrderSide;
  canTrade: boolean;
  order_type: OrderType;
  setOrderValue: (key: keyof OrderlyOrder, value: unknown) => void;
  symbolLeverage?: number;
  marginMode?: MarginMode;
  /** When true, Market order type is disabled (e.g. symbol in POST_ONLY mode). */
  marketOrderDisabled?: boolean;
  /** Tooltip when hovering over the disabled Market button. */
  marketOrderDisabledTooltip?: string;
};

export function OrderEntryHeader(props: OrderEntryHeaderProps) {
  const { canTrade, side, order_type, setOrderValue } = props;

  return (
    <>
      <div className="oui-w-full">
        <LeverageBadge
          symbol={props.symbol}
          side={props.side}
          symbolLeverage={props.symbolLeverage}
          marginMode={props.marginMode}
          disabled={!props.canTrade}
        />
      </div>
      <OrderEntryTypeTabsInjectabled
        type={order_type!}
        side={side}
        canTrade={canTrade}
        onChange={(type: OrderType) => {
          setOrderValue("order_type", type);
        }}
        marketOrderDisabled={props.marketOrderDisabled}
        marketOrderDisabledTooltip={props.marketOrderDisabledTooltip}
      />
      <OrderEntryBuySellSwitchInjectabled
        side={side}
        canTrade={canTrade}
        onSideChange={(nextSide: OrderSide) => {
          props.setOrderValue("side", nextSide);
        }}
      />
    </>
  );
}
