import React, { useState } from "react";
import { useLocalStorage } from "@orderly.network/hooks";
import { useTranslation, type LocaleMessages } from "@orderly.network/i18n";
import {
  AddCircleIcon,
  Button,
  CloseIcon,
  cn,
  EditIcon,
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
import type { PredictionOutcome, PredictionState } from "../prediction.script";
import {
  formatContractPrice,
  usePredictionFormatters,
} from "../predictionShared";
import { PercentageControls } from "./form";
import { BinarySlippage } from "./form/binarySlippage.ui";
import {
  DEFAULT_ONE_TAP_AMOUNTS,
  alignOneTapAmounts,
  resolveOneTapAmounts,
  validOneTapAmounts,
  type OneTapAmounts,
} from "./oneTapAmounts";

type TradeMode = "limit" | "market" | "oneTap";

/** Render a bps coefficient as a percent; missing config is never "free". */
const formatFeeBps = (bps: number | undefined) =>
  bps == null ? "--%" : `${(bps / 100).toFixed(2)}%`;

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
  const { formatUsd, formatContracts, chart } = usePredictionFormatters();
  const tradeMode = state.tradeMode;
  const [storedOneTapAmounts, setStoredOneTapAmounts] = useLocalStorage<
    OneTapAmounts | number[]
  >("orderly-prediction-one-tap-amounts", DEFAULT_ONE_TAP_AMOUNTS);
  const [oneTapEditorOpen, setOneTapEditorOpen] = useState(false);
  const [draftOneTapAmounts, setDraftOneTapAmounts] = useState<
    Record<PredictionOutcome, string[]>
  >({
    up: DEFAULT_ONE_TAP_AMOUNTS.up.map(String),
    down: DEFAULT_ONE_TAP_AMOUNTS.down.map(String),
  });
  const [oneTapEditorError, setOneTapEditorError] = useState(false);
  const oneTapAmounts = alignOneTapAmounts(
    resolveOneTapAmounts(storedOneTapAmounts, "up"),
    resolveOneTapAmounts(storedOneTapAmounts, "down"),
  );
  const isOneTap = tradeMode === "oneTap";
  const isBuyContext = isOneTap || state.orderSide === "buy";
  // Fail closed: a TradePanel rendered without explicit auth flags must not
  // default to a tradable state (matches the gating in prediction.ui.tsx).
  const orderEntryAccountReady = state.orderEntryAccountReady ?? false;
  const { isMobile } = useScreen();
  const orderEntryFunded = state.orderEntryFunded ?? false;
  const outcomeLabel = t(`prediction.${state.selectedOutcome}`);
  const inputUnit = state.amountUnit === "quote" ? "USDC" : outcomeLabel;
  const buttonLabel = `${t(`common.${state.orderSide}`)} ${t(`prediction.${state.selectedOutcome}`)}`;
  const availableValue = !orderEntryFunded
    ? `0 ${isBuyContext ? "USDC" : outcomeLabel}`
    : isBuyContext
      ? `${formatUsd(state.balance)} USDC`
      : `${formatContracts(state.availableQuantity(state.selectedOutcome))} ${outcomeLabel}`;
  const maxDisplayValue = orderEntryFunded
    ? state.hasMaxAmountEstimate
      ? `${state.amountUnit === "quote" ? formatUsd(state.maxAmount) : formatContracts(state.maxAmount)} ${inputUnit}`
      : `-- ${inputUnit}`
    : `0 ${inputUnit}`;
  const canAdjustAmount =
    orderEntryAccountReady &&
    orderEntryFunded &&
    state.maxAmount > 0 &&
    (state.orderSide === "sell" || state.hasMaxAmountEstimate) &&
    state.isRoundTradable &&
    !state.isRegionRestricted;
  const sliderColor = canAdjustAmount
    ? state.orderSide === "buy"
      ? "buy"
      : "sell"
    : undefined;
  const oneTapSlippages = (["up", "down"] as const).flatMap((outcome) =>
    oneTapAmounts[outcome].map((quoteAmount) =>
      state.estimateOrderSlippage(
        "buy",
        state.oneTapPayout(outcome, quoteAmount),
        outcome,
      ),
    ),
  );
  const validOneTapSlippages = oneTapSlippages.filter(
    (value): value is number => value !== null,
  );
  const oneTapEstimatedSlippage = validOneTapSlippages.length
    ? Math.max(...validOneTapSlippages)
    : null;
  // The fee curve always prices in the UP coordinate: p or 1-p.
  const selectedUpPrice =
    state.selectedOutcome === "up"
      ? state.selectedPrice
      : new Decimal(1).sub(state.selectedPrice).toNumber();
  const estimatedFee = state.estimateFee(
    state.orderQuantity,
    selectedUpPrice,
    // MARKET crosses the book (taker); a resting LIMIT fills as maker.
    state.orderType === "market",
  );
  const selectTradeMode = (mode: TradeMode) => {
    state.setTradeMode(mode);
  };
  const saveOneTapAmounts = () => {
    const amounts: OneTapAmounts = {
      up: draftOneTapAmounts.up.map(Number),
      down: draftOneTapAmounts.down.map(Number),
    };
    const valid =
      (["up", "down"] as const).every(
        (outcome) =>
          validOneTapAmounts(amounts[outcome]) &&
          draftOneTapAmounts[outcome].every((value) =>
            /^\d+(\.\d{1,2})?$/.test(value.trim()),
          ),
      ) && amounts.up.length === amounts.down.length;
    if (!valid) {
      setOneTapEditorError(true);
      return;
    }
    setStoredOneTapAmounts(amounts);
    setOneTapEditorOpen(false);
  };

  return (
    <aside className="oui-overflow-hidden oui-rounded-xl oui-bg-base-9">
      <div className="oui-prediction-orderEntry-form oui-min-w-0 oui-p-3 oui-text-base-contrast-54">
        {isMobile ? (
          <Select.options
            size="md"
            value={tradeMode}
            options={(["limit", "market", "oneTap"] as const).map((type) => ({
              value: type,
              label:
                type === "oneTap"
                  ? t("prediction.oneTap")
                  : t(`common.${type}`),
            }))}
            disabled={!orderEntryAccountReady}
            onValueChange={(type) => selectTradeMode(type as TradeMode)}
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
                    : t(`common.${type}`)}
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
                setOneTapEditorError(false);
                if (open)
                  setDraftOneTapAmounts({
                    up: oneTapAmounts.up.map(String),
                    down: oneTapAmounts.down.map(String),
                  });
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
                      {t(`prediction.${outcome}`)} · USDC
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
                          onValueChange={(nextValue) => {
                            setDraftOneTapAmounts((previous) => ({
                              ...previous,
                              [outcome]: previous[outcome].map(
                                (amount, position) =>
                                  position === index ? nextValue : amount,
                              ),
                            }));
                            setOneTapEditorError(false);
                          }}
                        />
                      ))}
                      {draftOneTapAmounts.up.length > 1 ? (
                        <button
                          type="button"
                          aria-label={`${t("prediction.oneTapRemoveRow")} ${index + 1}`}
                          onClick={() => {
                            setDraftOneTapAmounts((previous) => ({
                              up: previous.up.filter(
                                (_, position) => position !== index,
                              ),
                              down: previous.down.filter(
                                (_, position) => position !== index,
                              ),
                            }));
                            setOneTapEditorError(false);
                          }}
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
                    onClick={() => {
                      setDraftOneTapAmounts((previous) => ({
                        up: [...previous.up, ""],
                        down: [...previous.down, ""],
                      }));
                      setOneTapEditorError(false);
                    }}
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
                    onClick={() => {
                      setDraftOneTapAmounts({
                        up: DEFAULT_ONE_TAP_AMOUNTS.up.map(String),
                        down: DEFAULT_ONE_TAP_AMOUNTS.down.map(String),
                      });
                      setOneTapEditorError(false);
                    }}
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
                <span>{t(`prediction.${outcome}`)}</span>
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
                  <span>{t(`prediction.${outcome}`)}</span>
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

        {state.selectedRow && state.selectedRow.s0 == null && (
          <div className="oui-prediction-strikePending oui-text-2xs oui-mt-2 oui-space-y-1 oui-rounded-lg oui-bg-base-8 oui-p-2 oui-font-normal oui-leading-normal oui-text-base-contrast-54">
            <p>{t("prediction.strikePending")}</p>
            <p>
              {t("prediction.rounds.startTime")} ({chart.localOffsetLabel}):{" "}
              {chart.resolutionLocalFormatter.format(
                new Date(state.selectedRow.observation_start_at),
              )}
            </p>
            <p>
              {t("prediction.rounds.endTime")} ({chart.localOffsetLabel}):{" "}
              {chart.resolutionLocalFormatter.format(
                new Date(state.selectedRow.expire_at),
              )}
            </p>
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
                  // Explain a disabled preset instead of leaving it silent.
                  // Reason + isSubmitting together equal the composed
                  // canPlaceOneTapOrder gate, without evaluating the frozen
                  // estimate twice per preset on every book tick.
                  const blockReason = state.oneTapBlockReason(
                    outcome,
                    quoteAmount,
                  );
                  return (
                    <button
                      key={outcome}
                      type="button"
                      title={
                        blockReason != null
                          ? String(t(blockReason as keyof LocaleMessages))
                          : undefined
                      }
                      disabled={
                        oneTapEditorOpen ||
                        !orderEntryAccountReady ||
                        !orderEntryFunded ||
                        state.isSubmitting ||
                        blockReason != null
                      }
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
                          ${formatUsd(state.oneTapPayout(outcome, quoteAmount))}
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
                  suffix={inputUnit}
                  dp={
                    state.amountUnit === "quote"
                      ? 2
                      : new Decimal(
                          state.selectedRow?.base_tick ?? 0.01,
                        ).decimalPlaces()
                  }
                  onChange={state.setAmount}
                  position="middle"
                />
                <PredictionOrderInput
                  id="prediction-total-value"
                  label={t("common.totalValue")}
                  value={
                    state.orderQuantity > 0
                      ? formatUsd(state.orderNotional)
                      : ""
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
                suffix={inputUnit}
                onChange={state.setAmount}
                dp={
                  state.amountUnit === "quote"
                    ? 2
                    : new Decimal(
                        state.selectedRow?.base_tick ?? 0.01,
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
                value={
                  state.orderQuantity > 0
                    ? `${formatUsd(state.orderNotional)} USDC`
                    : "-- USDC"
                }
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
          <InfoRow
            label={t("common.fees")}
            // Same muted coloring as the perps order entry fee row
            // (regularFees.ui.tsx): labels contrast-54, values contrast-80.
            value={
              <>
                <span className="oui-text-base-contrast-54">
                  {t("dmm.taker")}:{" "}
                </span>
                <span className="oui-text-base-contrast-80">
                  {formatFeeBps(state.feeRates.takerBps)} /{" "}
                </span>
                <span className="oui-text-base-contrast-54">
                  {t("dmm.maker")}:{" "}
                </span>
                <span className="oui-text-base-contrast-80">
                  {formatFeeBps(state.feeRates.makerBps)}
                </span>
              </>
            }
            valueClassName="oui-font-normal"
          />
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
                  value={
                    estimatedFee != null
                      ? `${formatUsd(estimatedFee)} USDC`
                      : "-- USDC"
                  }
                  dashed
                />
                <InfoRow
                  label={t("prediction.requiredFrozen")}
                  value={
                    state.requiredFrozen == null
                      ? "-- USDC"
                      : `${state.fundingEstimateMode === "approximate" ? "≈ " : ""}${formatUsd(state.requiredFrozen)} USDC`
                  }
                  dashed
                />
              </>
            )}
        </div>
      </div>
    </aside>
  );
};
