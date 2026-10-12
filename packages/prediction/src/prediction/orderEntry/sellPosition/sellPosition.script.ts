import { useCallback, useEffect, useRef, useState } from "react";
import { type LocaleMessages, i18n } from "@orderly.network/i18n";
import { toast } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import {
  complementPrice,
  DEFAULT_BINARY_BASE_TICK,
  DEFAULT_BINARY_QUOTE_TICK,
  splitBinaryQuantity,
} from "../../binary/binaryOrderRules";
import { usePredictionAccountResources } from "../../hooks/usePredictionAccountResources";
import { usePredictionMarkets } from "../../hooks/usePredictionMarkets";
import {
  usePredictionOrderBook,
  usePredictionOrderBookView,
} from "../../hooks/usePredictionOrderBook";
import { usePredictionSlippage } from "../../hooks/usePredictionSlippage";
import { usePredictionTradingActions } from "../../hooks/usePredictionTradingActions";
import type {
  PredictionOutcome,
  PredictionOrderType,
  PredictionAccountState,
} from "../../prediction.types";
import {
  percentageFromQuantity,
  quantityFromPercentage,
} from "../form/quantityPercentage";

export type UseSellPositionScriptArgs = {
  state: PredictionAccountState;
  outcome: PredictionOutcome;
  /** Round symbol of the position being sold. */
  symbol?: string;
  accountId?: string;
  onSubmitted?: () => Promise<unknown>;
  /** Mount with the popover open; hosts use this for lazy per-row mounting. */
  initialOpen?: boolean;
  /** Called when the popover closes; initialOpen hosts unmount on it. */
  onClosed?: () => void;
};

export const useSellPositionScript = ({
  state,
  outcome,
  symbol,
  accountId,
  onSubmitted,
  initialOpen = false,
  onClosed,
}: UseSellPositionScriptArgs) => {
  const [open, setOpen] = useState(initialOpen);
  const [quantity, setQuantity] = useState(() =>
    initialOpen
      ? String(state.availableQuantity(outcome, undefined, symbol))
      : "",
  );
  const [price, setPrice] = useState("");
  const [type, setType] = useState<PredictionOrderType>("market");

  // Seed before any effect runs: the account guard below executes earlier
  // in declaration order than the mount-seeding effect, and an empty
  // openingContext would close (and lazily unmount) the popover at mount.
  const openingContext = useRef<{
    accountId?: string;
    targetAccountId?: string;
    symbol?: string;
  }>(
    initialOpen
      ? { accountId: state.accountId, targetAccountId: accountId, symbol }
      : {},
  );
  const onClosedRef = useRef(onClosed);
  useEffect(() => {
    onClosedRef.current = onClosed;
  }, [onClosed]);
  const close = useCallback(() => {
    setOpen(false);
    onClosedRef.current?.();
  }, []);
  const markets = usePredictionMarkets({ enabled: open });
  const row = symbol ? markets.configBySymbol.get(symbol) : undefined;
  const orderbook = usePredictionOrderBook({ symbol, active: open });
  const resources = usePredictionAccountResources({
    enabled: open,
    includeOrderHistory: false,
    accountId,
  });
  const { slippage, setSlippage } = usePredictionSlippage();
  const notify = useCallback(
    (message: string) =>
      toast.error(String(i18n.t(message as keyof LocaleMessages))),
    [],
  );
  const actions = usePredictionTradingActions({
    onSubmitted,
    active: open,
    resources,
    binaryRows: markets.rows,
    notify,
    isRegionRestricted: state.isRegionRestricted,
    selectedSymbol: symbol,
    bbo: orderbook.bbo,
    book: orderbook.book,
    slippage,
    onActiveTab: () => {},
  });
  const available = open
    ? actions.availableQuantity(outcome, undefined, symbol)
    : state.availableQuantity(outcome, undefined, symbol);
  const view = usePredictionOrderBookView({
    book: orderbook.book,
    selectedOutcome: outcome,
    orderSide: "sell",
    orderQuantity: Number(quantity),
    orderType: type,
    slippage,
    quoteTick: row?.quote_tick,
  });
  const estimatedSlippage = view.estimatedSlippage;
  const isSlippageExceeded = view.isSlippageExceeded;
  useEffect(() => {
    if (
      open &&
      (!symbol ||
        openingContext.current.accountId !== state.accountId ||
        openingContext.current.symbol !== symbol ||
        openingContext.current.targetAccountId !== accountId ||
        (!resources.targetAccountId && state.accountId !== actions.accountId) ||
        !resources.targetAuthorized)
    )
      close();
  }, [
    open,
    symbol,
    accountId,
    state.accountId,
    actions.accountId,
    resources.targetAccountId,
    resources.targetAuthorized,
    close,
  ]);
  const percentage = percentageFromQuantity(Number(quantity) || 0, available);

  const quantityDp = new Decimal(
    row?.base_tick ?? DEFAULT_BINARY_BASE_TICK,
  ).decimalPlaces();
  const selectPercentage = (value: number) =>
    setQuantity(quantityFromPercentage(available, value, quantityDp));

  const tradable =
    state.isOrderTradable(symbol) &&
    !state.isRegionRestricted &&
    state.accountReady &&
    actions.hasFeeConfig &&
    !state.isSubmitting &&
    !actions.isSubmitting;
  const displayPrice =
    type === "market"
      ? actions.protectionPrice(outcome, "sell", symbol)
      : Number(price);
  const upPrice =
    displayPrice == null
      ? 0
      : outcome === "up"
        ? displayPrice
        : complementPrice(displayPrice);
  const valid =
    open &&
    !!row &&
    actions.accountReady &&
    actions.accountId === (accountId ?? state.accountId) &&
    tradable &&
    Number(quantity) > 0 &&
    Number(quantity) <= available &&
    splitBinaryQuantity(Number(quantity), upPrice, row!) != null &&
    (type === "market" ||
      new Decimal(Number(price))
        .div(row?.quote_tick ?? DEFAULT_BINARY_QUOTE_TICK)
        .isInteger()) &&
    !isSlippageExceeded &&
    (type === "market" || (Number(price) > 0 && Number(price) < 1));

  // Seeding reads the host panel's live values (the closed popover always
  // seeded from them); this stack's own copies activate with the popover.
  const seedOnOpen = useCallback(() => {
    openingContext.current = {
      accountId: state.accountId,
      targetAccountId: accountId,
      symbol,
    };
    setQuantity(String(state.availableQuantity(outcome, undefined, symbol)));
    setPrice(
      orderbook.executablePrices.sell[outcome]?.toFixed(
        new Decimal(
          row?.quote_tick ?? DEFAULT_BINARY_QUOTE_TICK,
        ).decimalPlaces(),
      ) ?? "",
    );
  }, [
    state.accountId,
    accountId,
    state.availableQuantity,
    symbol,
    outcome,
    orderbook.executablePrices.sell,
    row?.quote_tick,
  ]);
  const onOpenChange = (value: boolean) => {
    if (!value) {
      close();
      return;
    }
    setOpen(true);
    seedOnOpen();
  };
  const seededMount = useRef(false);
  useEffect(() => {
    if (!initialOpen || seededMount.current) return;
    seededMount.current = true;
    seedOnOpen();
    // Mount-only seeding; SWR caches shared with the host page are warm.
  }, [initialOpen, seedOnOpen]);

  const confirm = async () => {
    if (!valid) return;
    const placed = await actions.sellPosition(
      outcome,
      Number(quantity),
      type,
      Number(price),
      symbol,
    );
    if (placed) {
      // Route through close() so lazy hosts unmount the trading stack.
      close();
    }
  };

  return {
    open,
    onOpenChange,
    quantity,
    setQuantity,
    price,
    setPrice,
    type,
    setType,
    available,
    percentage,
    quantityDp,
    selectPercentage,
    estimatedSlippage,
    tradable,
    valid,
    confirm,
    outcome,
    slippage,
    setSlippage,
    quoteTick: row?.quote_tick,
    loading: resources.ordersLoading || resources.positionsLoading,
    error: resources.ordersError || resources.positionsError,
  };
};

export type SellPositionState = ReturnType<typeof useSellPositionScript>;
