import React, { useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { OrderBookLadder } from "@orderly.network/trading";
import {
  AddCircleIcon,
  Button,
  CaretDownIcon,
  CaretUpIcon,
  cn,
  Input,
  inputFormatter,
  modal,
  Select,
  Spinner,
  Text,
  Tips,
  Tooltip,
  useScreen,
} from "@orderly.network/ui";
import { SlippageUI } from "@orderly.network/ui-order-entry";
import { PercentageControls } from "./orderEntry/form";
import type { PredictionState } from "./prediction.script";
import {
  accumulateOrderBookLevels,
  formatContractPrice,
  usePredictionFormatters,
} from "./predictionShared";

// Prediction books quote in USDC with two-decimal, 0.01-tick prices.
const predictionSymbolInfo = (base: string) => ({
  base_dp: 2,
  quote_dp: 2,
  base_tick: 0.01,
  base,
  quote: "USDC",
});

export const PredictionOrderBook: React.FC<
  Pick<
    PredictionState,
    | "orderBook"
    | "selectedOutcome"
    | "selectedPrice"
    | "setLimitPrice"
    | "setOrderType"
    | "isRoundTradable"
    | "roundPhase"
  >
> = ({
  orderBook,
  selectedOutcome,
  selectedPrice,
  setLimitPrice,
  setOrderType,
  isRoundTradable,
  roundPhase,
}) => {
  const { t } = useTranslation();
  const selectPrice = (price: number) => {
    setOrderType("limit");
    setLimitPrice(price.toFixed(2));
  };

  const asks = useMemo(
    // Asks render best-last, so cumulative totals grow from the last level.
    () => accumulateOrderBookLevels(orderBook.asks, "backward"),
    [orderBook.asks],
  );

  const bids = useMemo(
    () => accumulateOrderBookLevels(orderBook.bids, "forward"),
    [orderBook.bids],
  );

  const isPastRound =
    roundPhase === "closed" ||
    roundPhase === "resolving" ||
    roundPhase === "resolvedUp" ||
    roundPhase === "resolvedDown" ||
    roundPhase === "void";
  const emptyLevels = useMemo(
    () =>
      Array.from({ length: 7 }, () => [
        Number.NaN,
        Number.NaN,
        Number.NaN,
        Number.NaN,
      ]),
    [],
  );
  const displayedAsks = isPastRound ? emptyLevels : asks;
  const displayedBids = isPastRound ? emptyLevels : bids;
  const displayedPrice = isPastRound ? Number.NaN : selectedPrice;
  const base = selectedOutcome.toUpperCase();

  return (
    <section
      className={cn(
        "oui-prediction-orderBook oui-flex oui-h-full oui-min-h-[300px] oui-flex-col oui-overflow-hidden oui-rounded-xl oui-bg-base-9 xl:oui-min-h-[420px]",
        !isRoundTradable && "oui-pointer-events-none",
      )}
    >
      <div className="oui-flex oui-items-center oui-px-3 oui-pt-3">
        <span className="oui-text-sm oui-font-semibold oui-text-base-contrast">
          {t("prediction.orderBook")}
        </span>
      </div>
      <div className="oui-min-h-0 oui-flex-1 oui-pb-3">
        <OrderBookLadder
          asks={displayedAsks}
          bids={displayedBids}
          markPrice={displayedPrice}
          lastPrice={
            isPastRound
              ? [Number.NaN, Number.NaN]
              : [Math.max(selectedPrice - 0.01, 0), selectedPrice]
          }
          depths={["0.01"]}
          base={base}
          quote="USDC"
          symbolInfo={predictionSymbolInfo(base)}
          onItemClick={(item) => selectPrice(item[0])}
          showMarkPrice={false}
          cellHeight={20}
        />
      </div>
    </section>
  );
};

export const RoundOrderStatusCard: React.FC<
  Pick<PredictionState, "round" | "roundPhase"> & { restricted?: boolean }
> = ({ round, roundPhase, restricted }) => {
  const { t } = useTranslation();
  const { formatRoundWindow } = usePredictionFormatters();
  const isResolving = roundPhase === "closed" || roundPhase === "resolving";
  const resolvedOutcome =
    roundPhase === "resolvedUp"
      ? "up"
      : roundPhase === "resolvedDown"
        ? "down"
        : null;

  return (
    <section
      className={cn(
        "oui-flex oui-h-full oui-min-h-[360px] oui-flex-col oui-items-center oui-justify-center oui-rounded-xl oui-bg-base-9 oui-p-6 oui-text-center md:oui-h-auto",
        restricted && "oui-flex-1 2xl:oui-flex-none",
      )}
    >
      {restricted && (
        <div role="status">
          <h2 className="oui-text-lg oui-font-semibold oui-text-base-contrast">
            {t("prediction.region.restrictedTitle")}
          </h2>
          <p className="oui-mt-4 oui-max-w-72 oui-text-sm oui-font-normal oui-text-base-contrast-54">
            {t("prediction.region.restrictedDescription")}
          </p>
        </div>
      )}
      {!restricted && isResolving && (
        <>
          <Spinner size="lg" color="primary" />
          <h2 className="oui-mt-6 oui-text-lg oui-font-semibold oui-text-base-contrast">
            {t("prediction.resolution.determiningWinner")}
          </h2>
          <p className="oui-mt-4 oui-text-sm oui-font-normal oui-text-base-contrast-54">
            {t("prediction.btcUpDown")} · {formatRoundWindow(round)}
          </p>
          <p className="oui-mt-5 oui-max-w-72 oui-text-sm oui-font-normal oui-text-base-contrast-54">
            {t("prediction.resolution.pendingDescription")}
          </p>
        </>
      )}

      {!restricted && resolvedOutcome && (
        <>
          <div
            className={cn(
              "oui-flex oui-size-16 oui-items-center oui-justify-center oui-rounded-full",
              resolvedOutcome === "up"
                ? "oui-bg-trade-profit/15 oui-text-trade-profit"
                : "oui-bg-trade-loss/15 oui-text-trade-loss",
            )}
          >
            {resolvedOutcome === "up" ? (
              <CaretUpIcon size={32} color="inherit" opacity={1} />
            ) : (
              <CaretDownIcon size={32} color="inherit" opacity={1} />
            )}
          </div>
          <h2
            className={cn(
              "oui-mt-5 oui-text-lg oui-font-semibold",
              resolvedOutcome === "up"
                ? "oui-text-trade-profit"
                : "oui-text-trade-loss",
            )}
          >
            {t("prediction.resolution.outcome", {
              outcome: t(`prediction.${resolvedOutcome}`),
            })}
          </h2>
          <p className="oui-mt-4 oui-text-sm oui-font-normal oui-text-base-contrast-54">
            {t("prediction.btcUpDown")} · {formatRoundWindow(round)}
          </p>
        </>
      )}

      {!restricted && roundPhase === "void" && (
        <>
          <div className="oui-flex oui-size-16 oui-items-center oui-justify-center oui-rounded-full oui-bg-base-6 oui-text-2xl oui-text-base-contrast-54">
            —
          </div>
          <h2 className="oui-mt-5 oui-text-lg oui-font-semibold oui-text-base-contrast">
            {t("prediction.resolution.voided")}
          </h2>
          <p className="oui-mt-4 oui-text-sm oui-font-normal oui-text-base-contrast-54">
            {t("prediction.btcUpDown")} · {formatRoundWindow(round)}
          </p>
          <p className="oui-mt-5 oui-max-w-72 oui-text-sm oui-font-normal oui-text-base-contrast-54">
            {t("prediction.resolution.voidDescription")}
          </p>
        </>
      )}
    </section>
  );
};

const PredictionOrderInput: React.FC<{
  id: string;
  label: string;
  value: string;
  suffix: React.ReactNode;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  dp?: number;
  position: "top" | "middle" | "bottom" | "single";
}> = ({ id, label, value, suffix, onChange, readOnly, dp = 4, position }) => (
  <Input
    id={id}
    name={id}
    fullWidth
    size="lg"
    autoComplete="off"
    inputMode="decimal"
    placeholder="0"
    value={value}
    readOnly={readOnly}
    formatters={[
      inputFormatter.dpFormatter(dp),
      inputFormatter.numberFormatter,
      inputFormatter.currencyFormatter,
      inputFormatter.decimalPointFormatter,
    ]}
    prefix={
      <label
        htmlFor={id}
        className="oui-absolute oui-start-2 oui-top-[7px] oui-text-2xs oui-text-base-contrast-36"
      >
        {label}
      </label>
    }
    suffix={
      typeof suffix === "string" ? (
        suffix
      ) : (
        <div className="oui-absolute oui-end-0 oui-top-0 oui-flex oui-h-full oui-flex-col oui-items-end oui-justify-end oui-px-2 oui-py-2 oui-text-2xs oui-text-base-contrast-36">
          {suffix}
        </div>
      )
    }
    classNames={{
      // No resting border: the solid `fill` surface of the inner input
      // establishes the boundary (the focus outline stays available).
      root: cn(
        "oui-relative oui-h-[54px] oui-px-2 oui-py-1",
        position === "single" && "oui-rounded-xl",
        position === "top" && "oui-rounded-t-xl oui-rounded-b",
        position === "middle" && "oui-rounded",
        position === "bottom" && "oui-rounded-t oui-rounded-b-xl",
      ),
      input: "oui-mb-1 oui-mt-5 oui-h-5",
      suffix:
        "oui-absolute oui-end-0 oui-top-0 oui-items-end oui-justify-end oui-py-2 oui-text-2xs oui-text-base-contrast-36",
    }}
    onValueChange={onChange}
  />
);

const InfoRow: React.FC<{
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  valueClassName?: string;
  dashed?: boolean;
}> = ({ label, value, hint, valueClassName, dashed }) => (
  <div className="oui-flex oui-items-center oui-justify-between oui-gap-4">
    <Tooltip
      open={hint ? undefined : false}
      content={hint}
      className="oui-max-w-[330px] oui-bg-base-6"
      arrow={{ className: "oui-fill-base-6" }}
      delayDuration={300}
    >
      <span
        className={cn(
          "oui-text-base-contrast-54",
          hint && "oui-cursor-pointer",
          dashed &&
            "oui-border-b oui-border-dashed oui-border-line-12 oui-leading-4",
        )}
      >
        {label}
      </span>
    </Tooltip>
    <span
      className={cn(
        "oui-text-end oui-font-medium oui-text-base-contrast",
        valueClassName,
      )}
    >
      {value}
    </span>
  </div>
);

export const TradePanel: React.FC<
  PredictionState & {
    orderEntryAccountReady?: boolean;
    orderEntryFunded?: boolean;
  }
> = (state) => {
  const { t } = useTranslation();
  const { formatUsd, formatContracts } = usePredictionFormatters();
  // Fail closed: a TradePanel rendered without explicit auth flags must not
  // default to a tradable state (matches the gating in prediction.ui.tsx).
  const orderEntryAccountReady = state.orderEntryAccountReady ?? false;
  const { isMobile } = useScreen();
  const orderEntryFunded = state.orderEntryFunded ?? false;
  const outcomeLabel = t(`prediction.${state.selectedOutcome}`);
  const inputUnit = state.amountUnit === "quote" ? "USDC" : outcomeLabel;
  const buttonLabel = `${t(`common.${state.orderSide}`)} ${t(`prediction.${state.selectedOutcome}`)}`;
  const availableValue = !orderEntryFunded
    ? `0 ${state.orderSide === "buy" ? "USDC" : outcomeLabel}`
    : state.orderSide === "buy"
      ? `${formatUsd(state.balance)} USDC`
      : `${formatContracts(state.availableQuantity(state.selectedOutcome))} ${outcomeLabel}`;
  const amountUnitOptions = [
    { label: "USDC", value: "quote" },
    { label: outcomeLabel, value: "outcome" },
  ];
  const maxDisplayValue = orderEntryFunded
    ? `${state.amountUnit === "quote" ? formatUsd(state.maxAmount) : formatContracts(state.maxAmount)} ${inputUnit}`
    : `0 ${inputUnit}`;
  const canAdjustAmount =
    orderEntryAccountReady &&
    orderEntryFunded &&
    state.maxAmount > 0 &&
    state.selectedPrice > 0 &&
    state.selectedPrice < 1 &&
    state.isRoundTradable &&
    !state.isRegionRestricted;
  const sliderColor = canAdjustAmount
    ? state.orderSide === "buy"
      ? "buy"
      : "sell"
    : undefined;

  return (
    <aside className="oui-overflow-hidden oui-rounded-xl oui-bg-base-9">
      <div className="oui-prediction-orderEntry-form oui-min-w-0 oui-p-3 oui-text-base-contrast-54">
        {isMobile ? (
          <Select.options
            size="md"
            value={state.orderType}
            options={(["limit", "market"] as const).map((type) => ({
              value: type,
              label: t(`common.${type}`),
            }))}
            disabled={!orderEntryAccountReady}
            onValueChange={(type) =>
              state.setOrderType(type as "limit" | "market")
            }
            classNames={{
              trigger:
                "oui-w-full oui-h-8 oui-rounded-md oui-border-line-12 oui-bg-base-8",
            }}
          />
        ) : (
          <div className="oui-flex oui-w-full oui-gap-1">
            {(["limit", "market"] as const).map((type) => (
              <button
                key={type}
                type="button"
                disabled={!orderEntryAccountReady}
                aria-pressed={state.orderType === type}
                onClick={() => state.setOrderType(type)}
                className={cn(
                  "oui-flex oui-h-8 oui-flex-1 oui-items-center oui-justify-center oui-gap-x-1 oui-rounded oui-px-3 oui-py-0.5 oui-text-xs oui-font-semibold disabled:oui-cursor-not-allowed",
                  state.orderType === type
                    ? "oui-bg-base-5 oui-text-base-contrast"
                    : "oui-bg-base-7 oui-text-base-contrast-36",
                )}
              >
                <Text size="xs">{t(`common.${type}`)}</Text>
              </button>
            ))}
          </div>
        )}

        <div className="oui-mt-2 oui-grid oui-w-full oui-flex-1 oui-grid-cols-2 oui-gap-x-2 xl:oui-mt-3 xl:oui-flex xl:oui-gap-x-[6px]">
          {(["buy", "sell"] as const).map((side) => (
            <Button
              key={side}
              type="button"
              size="md"
              fullWidth
              aria-pressed={state.orderSide === side}
              onClick={() => state.setOrderSide(side)}
              className={cn(
                side === "buy"
                  ? state.orderSide === side && orderEntryAccountReady
                    ? "oui-bg-success-darken hover:oui-bg-success-darken/80 active:oui-bg-success-darken/80"
                    : "oui-bg-base-7 oui-text-base-contrast-36 hover:oui-bg-base-6 active:oui-bg-base-6"
                  : state.orderSide === side && orderEntryAccountReady
                    ? "oui-bg-danger-darken hover:oui-bg-danger-darken/80 active:oui-bg-danger-darken/80"
                    : "oui-bg-base-7 oui-text-base-contrast-36 hover:oui-bg-base-6 active:oui-bg-base-6",
              )}
            >
              {t(`common.${side}`)}
            </Button>
          ))}
        </div>

        <div className="oui-mt-2 oui-grid oui-grid-cols-2 oui-overflow-hidden oui-rounded-lg oui-bg-base-10 oui-p-0.5 xl:oui-mt-3">
          {(["up", "down"] as const).map((outcome) => {
            const isActive = state.selectedOutcome === outcome;
            return (
              <button
                key={outcome}
                type="button"
                onClick={() => state.setSelectedOutcome(outcome)}
                className={cn(
                  "oui-flex oui-h-12 oui-flex-col oui-items-center oui-justify-center oui-rounded-md oui-text-xs oui-font-semibold oui-leading-tight oui-transition-colors",
                  outcome === "up"
                    ? isActive
                      ? "oui-bg-trade-profit/15 oui-text-trade-profit"
                      : "oui-text-base-contrast-54 hover:oui-bg-trade-profit/10"
                    : isActive
                      ? "oui-bg-trade-loss/15 oui-text-trade-loss"
                      : "oui-text-base-contrast-54 hover:oui-bg-trade-loss/10",
                )}
              >
                <span>{t(`prediction.${outcome}`)}</span>
                <span className="oui-mt-0.5 oui-tabular-nums">
                  ${formatContractPrice(state.outcomePrices[outcome])}
                </span>
              </button>
            );
          })}
        </div>

        <div className="oui-mt-2 oui-flex oui-items-center oui-justify-between oui-text-2xs xl:oui-mt-3">
          <Tips
            title={t("common.tips")}
            content={
              <div className="oui-text-pretty oui-text-2xs oui-leading-normal oui-text-base-contrast-80">
                {t(
                  state.orderSide === "buy"
                    ? "prediction.available.buyHint"
                    : "prediction.available.sellHint",
                )}
              </div>
            }
            trigger={
              <Text
                size="2xs"
                className="oui-cursor-pointer oui-border-b oui-border-dashed oui-border-line-12 oui-text-base-contrast-54"
              >
                {t("common.available")}
              </Text>
            }
          />
          <div className="oui-flex oui-items-center oui-gap-1">
            <span className="oui-text-base-contrast-80">{availableValue}</span>
            {state.orderSide === "buy" && (
              <Button
                type="button"
                variant="text"
                size="xs"
                color="secondary"
                aria-label={t("common.deposit")}
                className="oui-p-0 hover:oui-text-base-contrast-80"
                disabled={state.isRegionRestricted}
                onClick={() =>
                  modal.show(
                    isMobile
                      ? "DepositAndWithdrawWithSheetId"
                      : "DepositAndWithdrawWithDialogId",
                    { activeTab: "deposit" },
                  )
                }
              >
                <AddCircleIcon opacity={1} />
              </Button>
            )}
          </div>
        </div>

        <div className="oui-mt-2 oui-space-y-1 xl:oui-mt-3">
          {state.orderType === "limit" && (
            <>
              <PredictionOrderInput
                id="prediction-limit-price"
                label={t("common.price")}
                value={state.limitPrice}
                suffix="USDC"
                onChange={state.setLimitPrice}
                position="top"
              />
              <PredictionOrderInput
                id="prediction-order-amount"
                label={t("common.amount")}
                value={state.amount}
                suffix={outcomeLabel}
                onChange={state.setAmount}
                position="middle"
              />
              <PredictionOrderInput
                id="prediction-total-value"
                label={t("common.totalValue")}
                value={
                  state.orderQuantity > 0 ? formatUsd(state.orderNotional) : ""
                }
                suffix="USDC"
                readOnly
                position="bottom"
              />
            </>
          )}

          {state.orderType === "market" && (
            <PredictionOrderInput
              id="prediction-order-amount"
              label={t("common.amount")}
              value={state.amount}
              suffix={
                <Select.options
                  size="xs"
                  showCaret
                  value={state.amountUnit}
                  options={amountUnitOptions}
                  valueFormatter={(value) =>
                    amountUnitOptions.find((option) => option.value === value)
                      ?.label
                  }
                  classNames={{
                    trigger:
                      "oui-w-auto oui-border-none oui-bg-transparent oui-p-0 oui-shadow-none oui-text-base-contrast",
                  }}
                  contentProps={{ className: "oui-min-w-[112px]" }}
                  onValueChange={state.setAmountUnit}
                />
              }
              onChange={state.setAmount}
              dp={state.amountUnit === "quote" ? 2 : 4}
              position="single"
            />
          )}
        </div>

        <div className="oui-mt-2 xl:oui-mt-3">
          <PercentageControls
            percentage={canAdjustAmount ? state.orderPercentage : 0}
            onPercentageChange={state.setOrderPercentage}
            color={sliderColor ?? "primary"}
            disabled={!canAdjustAmount}
            trailing={
              <button
                type="button"
                disabled={!canAdjustAmount}
                onClick={() => state.setOrderPercentage(100)}
                className="oui-flex oui-items-center oui-gap-1 oui-text-2xs oui-text-base-contrast-54 disabled:oui-cursor-not-allowed"
              >
                {t(
                  state.orderSide === "buy"
                    ? "orderEntry.maxBuy"
                    : "orderEntry.maxSell",
                )}
                <Text size="2xs" color={sliderColor}>
                  {maxDisplayValue}
                </Text>
              </button>
            }
          />
        </div>

        <div className="oui-mt-4 oui-space-y-2 oui-text-xs">
          <InfoRow
            label={t("prediction.odds")}
            hint={t("prediction.oddsHint")}
            value={
              <>
                <Text.numeral dp={2}>{state.odds}</Text.numeral>x
              </>
            }
            dashed
          />
          <InfoRow
            label={t("prediction.toWin")}
            hint={t("prediction.toWinHint")}
            value={
              state.orderQuantity > 0
                ? `${formatUsd(state.estimatedPayout)} USDC`
                : "-- USDC"
            }
            dashed
          />
        </div>

        <Button
          className={cn(
            "oui-mt-4",
            !orderEntryFunded
              ? "oui-bg-base-5 oui-text-base-contrast-36"
              : state.orderSide === "buy"
                ? "oui-bg-success-darken hover:oui-bg-success-darken/80 active:oui-bg-success-darken/80"
                : "oui-bg-danger-darken hover:oui-bg-danger-darken/80 active:oui-bg-danger-darken/80",
          )}
          fullWidth
          size="md"
          disabled={!orderEntryFunded || !state.canPlaceOrder}
          onClick={state.placeOrder}
        >
          {buttonLabel}
        </Button>

        <div className="oui-mt-2 oui-text-center oui-text-2xs oui-font-normal oui-text-base-contrast-54">
          {t("prediction.tradingAgreement")}{" "}
          <span className="oui-border-b oui-border-base-contrast-36 oui-text-base-contrast-54">
            {t("prediction.termOfUse")}
          </span>
        </div>

        <div className="oui-mt-4 oui-space-y-2 oui-text-xs">
          {state.orderType === "market" && (
            <SlippageUI
              slippage={state.slippage}
              setSlippage={state.setSlippage}
              estSlippage={state.estimatedSlippage}
            />
          )}
          <InfoRow
            label={t("common.fees")}
            value={`${t("dmm.taker")}: --% / ${t("dmm.maker")}: 0%`}
          />
        </div>
      </div>
    </aside>
  );
};
