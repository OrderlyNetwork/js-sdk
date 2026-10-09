import { useCallback, useEffect, useRef, useState } from "react";
import { useLocalStorage } from "@orderly.network/hooks";
import { type LocaleMessages, i18n } from "@orderly.network/i18n";
import { toast } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import {
  parseSlippageTicks,
  splitBinaryQuantity,
} from "../../binary/binaryOrderRules";
import { usePredictionAccountResources } from "../../hooks/usePredictionAccountResources";
import { usePredictionMarkets } from "../../hooks/usePredictionMarkets";
import {
  usePredictionOrderBook,
  usePredictionOrderBookView,
} from "../../hooks/usePredictionOrderBook";
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
};

export const useSellPositionScript = ({
  state,
  outcome,
  symbol,
}: UseSellPositionScriptArgs) => {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState<PredictionOrderType>("market");

  const openingContext = useRef<{ accountId?: string; symbol?: string }>({});
  const markets = usePredictionMarkets({ enabled: open });
  const row = symbol ? markets.configBySymbol.get(symbol) : undefined;
  const orderbook = usePredictionOrderBook({ symbol, active: open });
  const resources = usePredictionAccountResources({
    enabled: open,
    includeHistory: false,
  });
  const [storedSlippage, saveSlippage] = useLocalStorage(
    "orderly-prediction-slippage-ticks",
    "2",
  );
  const slippage =
    parseSlippageTicks(storedSlippage) == null ? "2" : storedSlippage;
  const setSlippage = useCallback(
    (value: string) => {
      if (parseSlippageTicks(value) != null)
        saveSlippage(String(Number(value)));
    },
    [saveSlippage],
  );
  const notify = useCallback(
    (message: string) =>
      toast.error(String(i18n.t(message as keyof LocaleMessages))),
    [],
  );
  const actions = usePredictionTradingActions({
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
        openingContext.current.accountId !== actions.accountId ||
        openingContext.current.symbol !== symbol ||
        state.accountId !== actions.accountId)
    )
      setOpen(false);
  }, [open, symbol, state.accountId, actions.accountId]);
  const percentage = percentageFromQuantity(Number(quantity) || 0, available);

  const quantityDp = new Decimal(row?.base_tick ?? 0.01).decimalPlaces();
  const selectPercentage = (value: number) =>
    setQuantity(quantityFromPercentage(available, value, quantityDp));

  const tradable =
    state.isOrderTradable(symbol) &&
    !state.isRegionRestricted &&
    state.accountReady &&
    state.hasFeeConfig &&
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
        : new Decimal(1).sub(displayPrice).toNumber();
  const valid =
    open &&
    !!row &&
    actions.accountReady &&
    actions.accountId === state.accountId &&
    tradable &&
    Number(quantity) > 0 &&
    Number(quantity) <= available &&
    splitBinaryQuantity(Number(quantity), upPrice, row!) != null &&
    (type === "market" ||
      new Decimal(Number(price)).div(row?.quote_tick ?? 0.01).isInteger()) &&
    !isSlippageExceeded &&
    (type === "market" || (Number(price) > 0 && Number(price) < 1));

  const onOpenChange = (value: boolean) => {
    setOpen(value);
    if (value) {
      openingContext.current = { accountId: state.accountId, symbol };
      setQuantity(String(available));
      setPrice(
        orderbook.executablePrices.sell[outcome]?.toFixed(
          new Decimal(row?.quote_tick ?? 0.01).decimalPlaces(),
        ) ?? "",
      );
    }
  };

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
      setOpen(false);
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
  };
};

export type SellPositionState = ReturnType<typeof useSellPositionScript>;
