import React, { useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  AddCircleIcon,
  Button,
  CloseIcon,
  cn,
  EditIcon,
  Flex,
  Input,
  inputFormatter,
  modal,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
  Select,
  Text,
  Tips,
  Tooltip,
  useScreen,
} from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { DEFAULT_BINARY_BASE_TICK } from "../binary/binaryOrderRules";
import {
  blockReasonLabels,
  orderTypeLabels,
  outcomeLabels,
  sideLabels,
} from "../predictionLabels";
import {
  formatContractPrice,
  formatUsdAmount,
  usePredictionFormatters,
} from "../predictionShared";
import { PercentageControls } from "./form";
import { BinarySlippage } from "./form/binarySlippage.ui";
import type { TradePanelProps, PredictionTradeMode } from "./tradePanel.script";

/** Render a bps coefficient as a percent; missing config is never "free". */
const formatFeeBps = (bps: number | undefined) =>
  bps == null ? "--%" : `${(bps / 100).toFixed(2)}%`;

const PredictionOrderInput: React.FC<{
  id: string;
  label: string;
  value: string;
  suffix: React.ReactNode;
  onChange?: (value: string) => void;
  error?: string;
  errorMsgVisible: boolean;
  dp?: number;
  displayDp?: number;
  position: "top" | "middle" | "bottom" | "single";
}> = ({
  id,
  label,
  value,
  suffix,
  onChange,
  error,
  errorMsgVisible,
  dp = 4,
  displayDp,
  position,
}) => (
  <Input.tooltip
    tooltip={errorMsgVisible ? error : undefined}
    tooltipProps={{
      content: {
        className:
          "oui-max-w-[min(320px,calc(100vw-32px))] oui-whitespace-normal",
      },
    }}
    color={error ? "danger" : undefined}
    id={id}
    name={id}
    fullWidth
    size="lg"
    autoComplete="off"
    inputMode="decimal"
    placeholder="0"
    value={value}
    formatters={[
      {
        onRenderBefore: inputFormatter.dpFormatter(displayDp ?? dp)
          .onRenderBefore,
        onSendBefore: inputFormatter.dpFormatter(dp).onSendBefore,
      },
      inputFormatter.numberFormatter,
      inputFormatter.currencyFormatter,
      inputFormatter.decimalPointFormatter,
    ]}
    prefix={
      <label
        htmlFor={id}
        className="oui-text-2xs oui-absolute oui-start-2 oui-top-[7px] oui-text-base-contrast-36"
      >
        {label}
      </label>
    }
    suffix={
      typeof suffix === "string" ? (
        suffix
      ) : (
        <div className="oui-text-2xs oui-absolute oui-end-0 oui-top-0 oui-flex oui-h-full oui-flex-col oui-items-end oui-justify-end oui-p-2 oui-text-base-contrast-36">
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
        position === "top" && "oui-rounded-b oui-rounded-t-xl",
        position === "middle" && "oui-rounded",
        position === "bottom" && "oui-rounded-b-xl oui-rounded-t",
      ),
      input: "oui-mb-1 oui-mt-5 oui-h-5",
      suffix:
        "oui-absolute oui-end-0 oui-top-0 oui-items-end oui-justify-end oui-py-2 oui-text-2xs oui-text-base-contrast-36",
    }}
    onValueChange={onChange}
  />
);

/** Filled buy/sell button tone shared by the side switch and the submit button. */
const orderSideTone = (buy: boolean) =>
  buy
    ? "oui-bg-success-darken hover:oui-bg-success-darken/80 active:oui-bg-success-darken/80"
    : "oui-bg-danger-darken hover:oui-bg-danger-darken/80 active:oui-bg-danger-darken/80";

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
          "oui-shrink-0 oui-text-base-contrast-54",
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
        "oui-min-w-0 oui-break-words oui-text-end oui-font-medium oui-text-base-contrast",
        valueClassName,
      )}
    >
      {value}
    </span>
  </div>
);

export const TradePanel: React.FC<TradePanelProps> = (state) => {
  const { t } = useTranslation();
  const { formatUsd, formatContracts } = usePredictionFormatters();
  const tradeMode = state.tradeMode;
  const [oneTapEditorOpen, setOneTapEditorOpen] = useState(false);
  const { isMobile } = useScreen();
  const {
    oneTapAmounts,
    draftOneTapAmounts,
    oneTapEditorError,
    isOneTap,
    isBuyContext,
    canAdjustAmount,
    estimatedFee,
    oneTapEstimatedSlippage,
    submitButtonRef,
  } = state;
  const orderEntryAccountReady = state.orderEntryAccountReady ?? false;
  const orderEntryFunded = state.orderEntryFunded ?? false;
  const getOrderError = (field: "price" | "amount" | "total") => {
    const error = state.visibleOrderError;
    if (!error) return undefined;
    const target = state.orderType === "market" ? "amount" : error.field;
    if (target !== field) return undefined;
    // Exhaustive over the validation key union so every key stays a literal
    // `t("key")` call; interpolation options match each key's en text.
    switch (error.key) {
      case "orderEntry.orderPrice.error.required":
        return t("orderEntry.orderPrice.error.required");
      case "orderEntry.orderQuantity.error.required":
        return t("orderEntry.orderQuantity.error.required");
      case "orderEntry.orderQuantity.error.min":
        return t("orderEntry.orderQuantity.error.min", {
          value: error.value,
        });
      case "orderEntry.total.error.min":
        return t("orderEntry.total.error.min", { value: error.value });
      case "prediction.message.downMinimumOrder":
        return t("prediction.message.downMinimumOrder", {
          value: error.value,
          upPrice:
            error.upPrice == null
              ? undefined
              : new Decimal(error.upPrice).toFixed(),
          minQuantity:
            error.minQuantity == null
              ? undefined
              : new Decimal(error.minQuantity).toFixed(),
          minTotal:
            error.minTotal == null
              ? undefined
              : new Decimal(error.minTotal).toFixed(2),
        });
      case "prediction.message.noExecutableQuotes":
        return t("prediction.message.noExecutableQuotes");
      case "prediction.message.insufficientBalance":
        return t("prediction.message.insufficientBalance");
      case "prediction.message.insufficientContracts":
        return t("prediction.message.insufficientContracts");
      case "prediction.message.slippageExceeded":
        return t("prediction.message.slippageExceeded");
      case "prediction.invalidOrder":
        return t("prediction.invalidOrder");
    }
  };
  const outcomeLabel = outcomeLabels()[state.selectedOutcome];
  const inputUnit = state.amountUnit === "quote" ? "USDC" : outcomeLabel;
  const buttonLabel = `${sideLabels()[state.orderSide]} ${outcomeLabel}`;
  const availableValue = !orderEntryFunded
    ? `0 ${isBuyContext ? "USDC" : outcomeLabel}`
    : isBuyContext
      ? `${formatUsd(state.balance)} USDC`
      : `${formatContracts(state.availablePositionQuantity)} ${outcomeLabel}`;
  const maxDisplayValue = orderEntryFunded
    ? state.hasMaxAmountEstimate
      ? `${state.amountUnit === "quote" ? formatUsd(state.maxAmount) : formatContracts(state.maxAmount)} ${inputUnit}`
      : `-- ${inputUnit}`
    : `0 ${inputUnit}`;
  const sliderColor = canAdjustAmount
    ? state.orderSide === "buy"
      ? "buy"
      : "sell"
    : undefined;
  const selectTradeMode = state.setTradeMode;
  const saveOneTapAmounts = () => {
    if (state.saveOneTapAmounts()) setOneTapEditorOpen(false);
  };

  return (
    <aside className="oui-rounded-xl oui-bg-base-9">
      <div className="oui-prediction-orderEntry-form oui-min-w-0 oui-p-2 oui-text-base-contrast-54">
        {isMobile ? (
          <Select.options
            size="md"
            value={tradeMode}
            options={(["limit", "market", "oneTap"] as const).map((type) => ({
              value: type,
              label:
                type === "oneTap"
                  ? t("prediction.oneTap")
                  : orderTypeLabels()[type],
            }))}
            disabled={!orderEntryAccountReady}
            onValueChange={(type) =>
              selectTradeMode(type as PredictionTradeMode)
            }
            classNames={{
              trigger:
                "oui-w-full oui-h-8 oui-rounded-md oui-border-line-12 oui-bg-base-8",
            }}
          />
        ) : (
          <div className="oui-flex oui-w-full oui-gap-1">
            {(["limit", "market", "oneTap"] as const).map((type) => (
              <button
                key={type}
                type="button"
                disabled={!orderEntryAccountReady}
                aria-pressed={tradeMode === type}
                onClick={() => selectTradeMode(type)}
                className={cn(
                  "oui-text-xs oui-flex oui-h-8 oui-flex-1 oui-items-center oui-justify-center oui-gap-x-1 oui-rounded oui-px-3 oui-py-0.5 oui-font-semibold disabled:oui-cursor-not-allowed",
                  tradeMode === type
                    ? "oui-bg-base-5 oui-text-base-contrast"
                    : "oui-bg-base-7 oui-text-base-contrast-36",
                )}
              >
                <Text size="xs">
                  {type === "oneTap"
                    ? t("prediction.oneTap")
                    : orderTypeLabels()[type]}
                </Text>
              </button>
            ))}
          </div>
        )}

        {!isOneTap && (
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
                  state.orderSide === side && orderEntryAccountReady
                    ? orderSideTone(side === "buy")
                    : "oui-bg-base-7 oui-text-base-contrast-36 hover:oui-bg-base-6 active:oui-bg-base-6",
                )}
              >
                {sideLabels()[side]}
              </Button>
            ))}
          </div>
        )}

        {isOneTap && (
          <div className="oui-mt-3 oui-flex oui-items-center oui-justify-between">
            <Text
              size="xs"
              className="oui-font-semibold oui-text-base-contrast"
            >
              {t("prediction.oneTapBuy")}
            </Text>
            <PopoverRoot
              open={oneTapEditorOpen}
              onOpenChange={(open) => {
                setOneTapEditorOpen(open);
                if (open) state.beginOneTapEdit();
              }}
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="oui-text-xs oui-flex oui-items-center oui-gap-1 oui-font-semibold oui-text-primary hover:oui-opacity-80"
                >
                  <EditIcon size={14} color="inherit" opacity={1} />
                  {t("common.edit")}
                </button>
              </PopoverTrigger>
              <PopoverContent
                side="bottom"
                align="end"
                className="oui-w-80 oui-max-w-[calc(100vw-24px)] oui-p-3 sm:oui-w-[440px]"
              >
                <Text size="xs" className="oui-font-semibold">
                  {t("prediction.oneTapBuy")}
                </Text>
                <div className="oui-mt-3 oui-grid oui-grid-cols-[1rem_minmax(0,1fr)_minmax(0,1fr)_1rem] oui-items-center oui-gap-2">
                  <span />
                  {(["up", "down"] as const).map((outcome) => (
                    <Text
                      key={outcome}
                      size="xs"
                      className={cn(
                        "oui-font-semibold",
                        outcome === "up"
                          ? "oui-text-trade-profit"
                          : "oui-text-trade-loss",
                      )}
                    >
                      {outcomeLabels()[outcome]} · USDC
                    </Text>
                  ))}
                  <span />
                  {draftOneTapAmounts.up.map((_, index) => (
                    <React.Fragment key={index}>
                      <span className="oui-text-xs">{index + 1}</span>
                      {(["up", "down"] as const).map((outcome) => (
                        <Input
                          key={outcome}
                          size="md"
                          fullWidth
                          className="oui-min-w-0"
                          value={draftOneTapAmounts[outcome][index]}
                          onValueChange={(nextValue) =>
                            state.updateOneTapDraft(outcome, index, nextValue)
                          }
                        />
                      ))}
                      {draftOneTapAmounts.up.length > 1 ? (
                        <button
                          type="button"
                          aria-label={`${t("prediction.oneTapRemoveRow")} ${index + 1}`}
                          onClick={() => state.removeOneTapRow(index)}
                          className="oui-flex oui-size-4 oui-items-center oui-justify-center oui-text-base-contrast-54 hover:oui-text-base-contrast"
                        >
                          <CloseIcon size={14} color="inherit" opacity={1} />
                        </button>
                      ) : (
                        <span className="oui-size-4" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
                {oneTapEditorError && (
                  <div className="oui-mt-2" role="alert">
                    <Text size="2xs" color="danger">
                      {t("prediction.oneTapInvalidAmounts")}
                    </Text>
                  </div>
                )}
                {draftOneTapAmounts.up.length < 3 && (
                  <button
                    type="button"
                    onClick={state.addOneTapRow}
                    className="oui-text-xs oui-mt-3 oui-block oui-text-primary hover:oui-opacity-80"
                  >
                    + {t("prediction.oneTapAddPreset")}
                  </button>
                )}
                <div className="oui-mt-3 oui-flex oui-items-center oui-justify-between oui-gap-2">
                  <Button
                    size="sm"
                    variant="text"
                    color="secondary"
                    onClick={state.resetOneTapDraft}
                  >
                    {t("common.reset")}
                  </Button>
                  <div className="oui-flex oui-gap-2">
                    <Button
                      size="sm"
                      variant="outlined"
                      color="secondary"
                      onClick={() => setOneTapEditorOpen(false)}
                    >
                      {t("common.cancel")}
                    </Button>
                    <Button size="sm" onClick={saveOneTapAmounts}>
                      {t("common.save")}
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </PopoverRoot>
          </div>
        )}

        {isOneTap ? (
          <div className="oui-mt-2 oui-grid oui-grid-cols-2 oui-gap-2 oui-overflow-hidden oui-rounded-lg oui-bg-base-10 oui-p-0.5 xl:oui-mt-3">
            {(["up", "down"] as const).map((outcome) => (
              <div
                key={outcome}
                className={cn(
                  "oui-text-xs oui-flex oui-h-12 oui-flex-col oui-items-center oui-justify-center oui-rounded-md oui-font-semibold oui-leading-tight",
                  outcome === "up"
                    ? "oui-bg-trade-profit/15 oui-text-trade-profit"
                    : "oui-bg-trade-loss/15 oui-text-trade-loss",
                )}
              >
                <span>{outcomeLabels()[outcome]}</span>
                <span className="oui-mt-0.5 oui-tabular-nums">
                  {state.executablePrices.buy[outcome] == null
                    ? "--"
                    : `$${formatContractPrice(state.executablePrices.buy[outcome]!)}`}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="oui-mt-2 oui-grid oui-grid-cols-2 oui-gap-2 oui-overflow-hidden oui-rounded-lg oui-bg-base-10 oui-p-0.5 xl:oui-mt-3">
            {(["up", "down"] as const).map((outcome) => {
              const isActive = state.selectedOutcome === outcome;
              return (
                <button
                  key={outcome}
                  type="button"
                  onClick={() => state.setSelectedOutcome(outcome)}
                  className={cn(
                    "oui-text-xs oui-flex oui-h-12 oui-flex-col oui-items-center oui-justify-center oui-rounded-md oui-font-semibold oui-leading-tight oui-transition-colors",
                    outcome === "up"
                      ? isActive
                        ? "oui-bg-trade-profit/15 oui-text-trade-profit"
                        : "oui-text-base-contrast-54 hover:oui-bg-trade-profit/10"
                      : isActive
                        ? "oui-bg-trade-loss/15 oui-text-trade-loss"
                        : "oui-text-base-contrast-54 hover:oui-bg-trade-loss/10",
                  )}
                >
                  <span>{outcomeLabels()[outcome]}</span>
                  <span className="oui-mt-0.5 oui-tabular-nums">
                    {state.executablePrices[state.orderSide][outcome] == null
                      ? "--"
                      : `$${formatContractPrice(state.executablePrices[state.orderSide][outcome]!)}`}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div className="oui-text-2xs oui-mt-2 oui-flex oui-items-center oui-justify-between xl:oui-mt-3">
          <Tips
            title={t("common.tips")}
            content={
              <div className="oui-text-2xs oui-text-pretty oui-leading-normal oui-text-base-contrast-80">
                {t(
                  isBuyContext
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
            {isBuyContext && (
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

        {isOneTap && (
          <div className="oui-mt-2 oui-grid oui-grid-cols-2 oui-gap-2 xl:oui-mt-3">
            {oneTapAmounts.up.map((_, index) => (
              <React.Fragment key={index}>
                {(["up", "down"] as const).map((outcome) => {
                  const quoteAmount = oneTapAmounts[outcome][index];
                  const { blockReason, disabled, payout } =
                    state.oneTapOptions[outcome][index];
                  return (
                    <button
                      key={outcome}
                      type="button"
                      title={
                        blockReason != null
                          ? blockReasonLabels()[blockReason]
                          : undefined
                      }
                      disabled={oneTapEditorOpen || disabled}
                      onClick={() =>
                        state.placeOneTapOrder(outcome, quoteAmount)
                      }
                      className={cn(
                        "oui-text-xs oui-flex oui-min-h-12 oui-min-w-0 oui-flex-col oui-items-center oui-justify-center oui-rounded-md oui-p-1 oui-font-semibold oui-text-white oui-transition-opacity hover:oui-opacity-80 disabled:oui-cursor-not-allowed disabled:oui-opacity-40",
                        outcome === "up"
                          ? "oui-bg-success-darken"
                          : "oui-bg-danger-darken",
                      )}
                    >
                      <span className="oui-text-base oui-leading-6 lg:oui-text-lg">
                        ${quoteAmount}
                      </span>
                      <span className="oui-text-2xs oui-font-normal oui-tabular-nums">
                        {t("prediction.oneTapWin")}{" "}
                        <span className="oui-font-normal">
                          ${formatUsd(payout)}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        )}

        {!isOneTap && (
          <div className="oui-mt-2 oui-space-y-1 xl:oui-mt-3">
            {state.orderType === "limit" && (
              <>
                <PredictionOrderInput
                  errorMsgVisible={state.errorMsgVisible}
                  id="prediction-limit-price"
                  error={getOrderError("price")}
                  label={t("common.price")}
                  value={state.limitPrice}
                  suffix="USDC"
                  onChange={state.setLimitPrice}
                  position="top"
                />
                <PredictionOrderInput
                  errorMsgVisible={state.errorMsgVisible}
                  id="prediction-order-amount"
                  error={getOrderError("amount")}
                  label={t("common.amount")}
                  value={state.amount}
                  suffix={inputUnit}
                  dp={
                    state.amountUnit === "quote"
                      ? 2
                      : new Decimal(
                          state.selectedRow?.base_tick ??
                            DEFAULT_BINARY_BASE_TICK,
                        ).decimalPlaces()
                  }
                  onChange={state.setAmount}
                  position="middle"
                />
                <PredictionOrderInput
                  errorMsgVisible={state.errorMsgVisible}
                  id="prediction-total-value"
                  error={getOrderError("total")}
                  label={t("common.totalValue")}
                  value={
                    state.totalInput ??
                    (state.orderQuantity > 0
                      ? formatUsd(state.orderNotional)
                      : "")
                  }
                  suffix="USDC"
                  dp={2}
                  displayDp={
                    state.totalInput == null &&
                    Number.isFinite(state.orderNotional) &&
                    state.orderNotional > 0 &&
                    new Decimal(state.orderNotional).lt(0.01)
                      ? new Decimal(state.orderNotional).decimalPlaces()
                      : 2
                  }
                  onChange={state.setTotal}
                  position="bottom"
                />
              </>
            )}

            {state.orderType === "market" && (
              <PredictionOrderInput
                errorMsgVisible={state.errorMsgVisible}
                id="prediction-order-amount"
                error={getOrderError("amount")}
                label={t("common.amount")}
                value={state.amount}
                suffix={inputUnit}
                onChange={state.setAmount}
                dp={
                  state.amountUnit === "quote"
                    ? 2
                    : new Decimal(
                        state.selectedRow?.base_tick ??
                          DEFAULT_BINARY_BASE_TICK,
                      ).decimalPlaces()
                }
                position="single"
              />
            )}
          </div>
        )}

        {!isOneTap && (
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
                  className="oui-text-2xs oui-flex oui-items-center oui-gap-1 oui-text-base-contrast-54 disabled:oui-cursor-not-allowed"
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
        )}

        {!isOneTap && (
          <>
            <div className="oui-text-xs oui-mt-4 oui-space-y-2">
              <InfoRow
                label={t("prediction.contracts")}
                value={
                  state.orderQuantity > 0
                    ? formatContracts(state.orderQuantity)
                    : "--"
                }
              />
              <InfoRow
                label={t("prediction.orderValue")}
                value={formatUsdAmount(
                  state.orderQuantity > 0 ? state.orderNotional : null,
                  { suffix: " USDC" },
                )}
              />
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
                value={formatUsdAmount(
                  state.orderQuantity > 0 ? state.estimatedPayout : null,
                  { suffix: " USDC" },
                )}
                dashed
              />
            </div>

            <Button
              ref={submitButtonRef}
              className={cn(
                "oui-mt-4",
                !orderEntryFunded
                  ? "oui-bg-base-5 oui-text-base-contrast-36"
                  : orderSideTone(state.orderSide === "buy"),
              )}
              fullWidth
              size="md"
              disabled={state.submitDisabled}
              loading={state.isSubmitting}
              onClick={state.placeOrder}
            >
              {buttonLabel}
            </Button>
          </>
        )}

        <div className="oui-text-2xs oui-mt-2 oui-text-center oui-font-normal oui-text-base-contrast-54">
          {t("prediction.tradingAgreement")}{" "}
          <span className="oui-border-b oui-border-base-contrast-36 oui-text-base-contrast-54">
            {t("prediction.termOfUse")}
          </span>
        </div>

        <div className="oui-text-xs oui-mt-4 oui-space-y-2">
          {state.orderType === "market" && (
            <BinarySlippage
              slippage={state.slippage}
              setSlippage={state.setSlippage}
              quoteTick={state.selectedRow?.quote_tick}
              estimated={
                isOneTap ? oneTapEstimatedSlippage : state.estimatedSlippage
              }
            />
          )}
          <Flex itemAlign="center" justify="between" width="100%">
            <Text className="oui-truncate" size="2xs">
              {t("common.fees")}
            </Text>
            <Flex gap={1} className="oui-whitespace-nowrap oui-font-normal">
              <Text className="oui-truncate" size="2xs">
                {t("dmm.taker")}:
              </Text>
              <Text size="2xs" className="oui-text-base-contrast-80">
                {formatFeeBps(state.feeRates.takerBps)}
              </Text>
              <Text size="2xs">/</Text>
              <Text className="oui-truncate" size="2xs">
                {t("dmm.maker")}:
              </Text>
              <Text size="2xs" className="oui-text-base-contrast-80">
                {formatFeeBps(state.feeRates.makerBps)}
              </Text>
            </Flex>
          </Flex>
          {/* One-tap presets each size off their own protection price; the
            estimates below price the form, which that mode does not show. */}
          {!isOneTap &&
            state.orderSide === "buy" &&
            state.orderQuantity > 0 && (
              <>
                {/* Curve estimate C*r*p*(1-p); hidden (not zero) when the
                  account has no valid binary fee config. */}
                <InfoRow
                  label={t("prediction.estimatedFee")}
                  value={formatUsdAmount(estimatedFee, { suffix: " USDC" })}
                  dashed
                />
                <InfoRow
                  label={t("prediction.requiredFrozen")}
                  value={formatUsdAmount(state.requiredFrozen, {
                    suffix: " USDC",
                    approximate: state.fundingEstimateMode === "approximate",
                  })}
                  dashed
                />
              </>
            )}
        </div>
      </div>
    </aside>
  );
};
