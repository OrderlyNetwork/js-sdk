import { useTranslation } from "@orderly.network/i18n";
import { MarginMode, OrderSide, OrderType } from "@orderly.network/types";
import { Button, cn, injectable, ThrottledButton } from "@orderly.network/ui";
import { AssetInfo } from "./assetInfo";
import { Available } from "./available";
import { OrderTypeSelect } from "./orderTypeSelect";
import { QuantitySlider } from "./quantitySlider";

/** Props exposed for plugin interceptors targeting OrderType tabs area. */
export type OrderEntryTypeTabsProps = {
  type: OrderType;
  side: OrderSide;
  canTrade: boolean;
  onChange: (type: OrderType) => void;
  marketOrderDisabled?: boolean;
  marketOrderDisabledTooltip?: string;
};

/** Props exposed for plugin interceptors targeting Buy/Sell switch area. */
export type OrderEntryBuySellSwitchProps = {
  side: OrderSide;
  canTrade: boolean;
  onSideChange: (side: OrderSide) => void;
};

/** Props exposed for plugin interceptors targeting Available balance row. */
export type OrderEntryAvailableProps = {
  currentLtv: number;
  canTrade: boolean;
  quote?: string;
  freeCollateral: number;
  marginMode?: MarginMode;
};

/** Props exposed for plugin interceptors targeting quantity slider area. */
export type OrderEntryQuantitySliderProps = {
  canTrade: boolean;
  side: OrderSide;
  order_quantity?: string;
  maxQty: number;
};

/** Props exposed for plugin interceptors targeting submit+asset-info section. */
export type OrderEntrySubmitSectionProps = {
  buttonLabel: string;
  side: OrderSide;
  canTrade: boolean;
  isMutating: boolean;
  onSubmit: () => void;
  assetInfo: {
    canTrade: boolean;
    quote: string;
    estLiqPrice: number | null;
    estLiqPriceDistance: number | null;
    estLeverage: number | null;
    currentLeverage: number | null;
    slippage: string;
    dp: number;
    setSlippage: (slippage: string) => void;
    estSlippage: number | null;
    orderType: OrderType;
    disableFeatures?: ("slippageSetting" | "feesInfo")[];
    symbol: string;
    side: OrderSide;
  };
};

export const OrderEntryTypeTabsInjectabled = injectable<OrderEntryTypeTabsProps>(
  (props: OrderEntryTypeTabsProps) => {
    return (
      <div className="oui-w-full">
        <OrderTypeSelect
          type={props.type}
          side={props.side}
          canTrade={props.canTrade}
          onChange={props.onChange}
          marketOrderDisabled={props.marketOrderDisabled}
          marketOrderDisabledTooltip={props.marketOrderDisabledTooltip}
        />
      </div>
    );
  },
  "Trading.OrderEntry.TypeTabs",
);

export const OrderEntryBuySellSwitchInjectabled =
  injectable<OrderEntryBuySellSwitchProps>(
    (props: OrderEntryBuySellSwitchProps) => {
      const { t } = useTranslation();
      return (
        <div
          className={cn(
            "oui-orderEntry-side",
            "oui-grid oui-w-full oui-flex-1 oui-gap-x-2 lg:oui-flex lg:oui-gap-x-[6px]",
            "oui-grid-cols-2",
          )}
        >
          <Button
            onClick={() => {
              props.onSideChange(OrderSide.BUY);
            }}
            size={"md"}
            fullWidth
            data-type={OrderSide.BUY}
            className={cn(
              "oui-orderEntry-side-buy-btn",
              props.side === OrderSide.BUY && props.canTrade
                ? "oui-bg-success-darken hover:oui-bg-success-darken/80 active:oui-bg-success-darken/80"
                : "oui-bg-base-7 oui-text-base-contrast-36 hover:oui-bg-base-6 active:oui-bg-base-6",
            )}
            data-testid="oui-testid-orderEntry-side-buy-button"
          >
            {t("common.buy")}
          </Button>
          <Button
            onClick={() => {
              props.onSideChange(OrderSide.SELL);
            }}
            data-type={OrderSide.SELL}
            fullWidth
            size={"md"}
            className={cn(
              "oui-orderEntry-side-sell-btn",
              props.side === OrderSide.SELL && props.canTrade
                ? "oui-bg-danger-darken hover:oui-bg-danger-darken/80 active:oui-bg-danger-darken/80"
                : "oui-bg-base-7 oui-text-base-contrast-36 hover:oui-bg-base-6 active:oui-bg-base-6",
            )}
            data-testid="oui-testid-orderEntry-side-sell-button"
          >
            {t("common.sell")}
          </Button>
        </div>
      );
    },
    "Trading.OrderEntry.BuySellSwitch",
  );

export const OrderEntryAvailableInjectabled = injectable<OrderEntryAvailableProps>(
  (props: OrderEntryAvailableProps) => {
    return (
      <Available
        currentLtv={props.currentLtv}
        canTrade={props.canTrade}
        quote={props.quote}
        freeCollateral={props.freeCollateral}
        marginMode={props.marginMode}
      />
    );
  },
  "Trading.OrderEntry.Available",
);

export const OrderEntryQuantitySliderInjectabled =
  injectable<OrderEntryQuantitySliderProps>(
    (props: OrderEntryQuantitySliderProps) => {
      return (
        <QuantitySlider
          canTrade={props.canTrade}
          side={props.side}
          order_quantity={props.order_quantity}
          maxQty={props.maxQty}
        />
      );
    },
    "Trading.OrderEntry.QuantitySlider",
  );

export const OrderEntrySubmitSectionInjectabled =
  injectable<OrderEntrySubmitSectionProps>(
    (props: OrderEntrySubmitSectionProps) => {
      return (
        <>
          {/* Submit button */}
          <ThrottledButton
            fullWidth
            id={"order-entry-submit-button"}
            data-type={OrderSide.BUY}
            className={cn(
              "oui-orderEntry-submit-btn",
              props.side === OrderSide.BUY
                ? "orderly-order-entry-submit-button-buy oui-bg-success-darken hover:oui-bg-success-darken/80 active:oui-bg-success-darken/80"
                : "orderly-order-entry-submit-button-sell oui-bg-danger-darken hover:oui-bg-danger-darken/80 active:oui-bg-danger-darken/80",
            )}
            onClick={props.onSubmit}
            loading={props.isMutating}
            disabled={!props.canTrade}
          >
            {props.buttonLabel}
          </ThrottledButton>

          {/* Asset info */}
          <AssetInfo
            canTrade={props.assetInfo.canTrade}
            quote={props.assetInfo.quote}
            estLiqPrice={props.assetInfo.estLiqPrice}
            estLiqPriceDistance={props.assetInfo.estLiqPriceDistance}
            estLeverage={props.assetInfo.estLeverage}
            currentLeverage={props.assetInfo.currentLeverage}
            slippage={props.assetInfo.slippage}
            dp={props.assetInfo.dp}
            setSlippage={props.assetInfo.setSlippage}
            estSlippage={props.assetInfo.estSlippage}
            orderType={props.assetInfo.orderType}
            disableFeatures={props.assetInfo.disableFeatures}
            symbol={props.assetInfo.symbol}
            side={props.assetInfo.side}
          />
        </>
      );
    },
    "Trading.OrderEntry.SubmitSection",
  );
