import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { produce } from "immer";
import { useDebouncedCallback } from "use-debounce";
import {
  SDKError,
  API,
  OrderlyOrder,
  OrderStatus,
  OrderType,
  OrderLevel,
  TrackerEventName,
  OrderSide,
  EMPTY_OBJECT,
  MarginMode,
} from "@orderly.network/types";
import { Decimal, getBBOType, zero } from "@orderly.network/utils";
import { useAccountInfo, useAppStore } from "../../orderly/appStore";
import {
  useCollateral,
  useFundingRatesStore,
  useMaxQty,
  useSymbolLeverageMap,
  useSymbolsInfo,
} from "../../orderly/orderlyHooks";
import { useMarkPriceActions } from "../../orderly/useMarkPrice/useMarkPriceStore";
import { useOrderStream } from "../../orderly/useOrderStream/useOrderStream";
import {
  usePositions,
  usePositionStore,
} from "../../orderly/usePositionStream/usePosition.store";
import { useOrderlyContext } from "../../orderlyContext";
import { useSymbolStore } from "../../provider/store/symbolStore";
import {
  OrderValidationItem,
  OrderValidationResult,
} from "../../services/orderCreator/interface";
import { useMemoizedFn } from "../../shared/useMemoizedFn";
import { useConfig } from "../../useConfig";
import { useEventEmitter } from "../../useEventEmitter";
import { useMutation } from "../../useMutation";
import { useTrack } from "../../useTrack";
import { resolveIsolatedPendingOrders } from "../../utils/order/isolatedPendingOrders";
import { getOrderReferencePriceFromOrder } from "../../utils/order/orderPrice";
import { getScaledOrderSkew } from "../../utils/order/scaledOrder";
import {
  calcEstLeverage,
  calcEstLiqPrice,
  getCreateOrderUrl,
  getOrderCreator,
  tpslFields,
  hasTPSL,
  isBBOOrder,
  appendOrderMetadata,
} from "./helper";
import type { FullOrderState } from "./orderEntry.store";
import {
  assertUSDCBorrowWithinLimit,
  calculateProjectedUSDCBorrow,
  getOrderQuantityAndNotional,
  normalizeUSDCBorrowLimit,
  type GeneratedOrderForBorrowProjection,
} from "./usdcBorrowLimit";
import { useOrderEntryNextInternal } from "./useOrderEntry.internal";
import { useRwaLeverageSync } from "./useRwaLeverageSync";

type OrderEntryParameters = Parameters<typeof useOrderEntryNextInternal>;
type Options = Omit<OrderEntryParameters["1"], "symbolInfo">;

export type SubmitOrderOptions = {
  resetOnSuccess?: boolean;
  /**
   * Server-configured USDC borrow limit (`negative_usdc_threshold`). When
   * omitted or unavailable (loading/failed request), the guard falls back to
   * DEFAULT_USDC_BORROW_LIMIT (50,000) instead of being skipped.
   */
  usdcBorrowLimit?: number;
};

export type OrderEntryReturn = {
  submit: (options?: SubmitOrderOptions) => Promise<{
    success: boolean;
    data: Record<string, any>;
    timestamp: number;
  }>;
  reset: () => void;
  resetErrors: () => void;
  resetMetaState: () => void;
  formattedOrder: Partial<FullOrderState>;
  maxQty: number;
  maxQtys: {
    maxBuy: number;
    maxSell: number;
  };
  /**
   * The estimated liquidation price.
   */
  estLiqPrice: number | null;
  /**
   * Current position quantity for the symbol (signed: positive=Long, negative=Short).
   */
  currentPosition: number;
  /**
   * The estimated liquidation price distance.
   */
  estLiqPriceDistance: number | null;
  /**
   * The estimated leverage after order creation.
   */
  estLeverage: number | null;
  estSlippage: number | null;
  helper: {
    /**
     * @deprecated Use `validate` instead.
     */
    validator: () => Promise<OrderlyOrder>;
    /**
     * Function to validate the order.
     * @returns {Promise<OrderValidationResult | null>} The validation result.
     */
    validate: (otherErrors?: OrderValidationResult) => Promise<OrderlyOrder>;
    getProjectedUSDCBorrow: (order: Partial<OrderlyOrder>) => number | null;
  };
  freeCollateral: number;
  /**
   * set a single value to the order data;
   * @param key
   * @param value
   * @returns
   */
  setValue: (
    key: keyof FullOrderState,
    value: any,
    options?: {
      shouldUpdateLastChangedField?: boolean;
    },
  ) => void;
  setValues: (values: Partial<FullOrderState>) => void;
  /**
   * Raw merge setter for externally computed bundles (e.g. Advanced TPSL).
   *
   * Unlike `setValues`, this intentionally skips `calculate()` to avoid overwriting computed TPSL fields.
   */
  setValuesRaw: (values: Partial<FullOrderState>) => void;
  symbolInfo: API.SymbolExt;
  /**
   * Meta state including validation and submission status.
   */
  metaState: {
    dirty: { [K in keyof OrderlyOrder]?: boolean };
    submitted: boolean;
    validated: boolean;
    errors: OrderValidationResult | null;
  };
  /**
   * Indicates if a mutation (order creation) is in progress.
   */
  isMutating: boolean;

  markPrice?: number;
  symbolLeverage?: number;
};

/**
 * Custom hook for managing order entry in the Orderly application.
 *
 * @param {string} symbol - The symbol for which the order is being created. This parameter is required.
 *
 * @param {Options} options - Additional options for configuring the order entry.
 *
 * @returns {OrderEntryReturn} An object containing various actions and state related to order entry.
 *
 * @throws {Error} Throws an error if the symbol is not provided or is not a string.
 *
 * @example
 * ```typescript
 * const {
 *   submit,
 *   formattedOrder, //
 *   setValue,
 *   setValues,
 *   symbolInfo,
 *   metaState,
 *   isMutating,
 *  // maxQty, freeCollateral ... same as v1
 * } = useOrderEntry('BTC_USDC_PERP', options);
 *
 * // update the order type
 * setValue('order_type', OrderType.LIMIT);
 * // update the order price
 * setValue('order_price', '70000');
 * // update the order quantity
 * setValue('order_quantity', 1);
 *
 * // how to set TP/SL
 * setValue('tp_trigger_price', '71000'); // directly set TP trigger price
 * // or set the tp pnl, the TP trigger price will be calculated based on the current order price
 * // setValue('tp_pnl', '300'); // you can also set tp_offset or tp_offset_percentage, same as the usage of useTPSL hook;
 * // SL is similar to TP setting
 * setValue('sl_price', '69000');
 *
 * // Submit the order data to the backend, and reset the hook state after the order is successfully created.
 * // Note: If the order data is invalid, an error will be thrown.
 * // If you want to retain the current order data after a successful order creation,
 * // you can pass {resetOnSuccess: false} to `submit` function to prevent the hook from automatically resetting the order status.
 * // Of course, you can also call `reset()` to manually reset the order status and use `resetMetaState()` to clear the error state.
 * await submit();
 * ```
 */
const useOrderEntry = (
  symbol: string,
  options: Options = {},
): OrderEntryReturn => {
  if (!symbol) {
    throw new SDKError("Symbol is required");
  }
  const ee = useEventEmitter();
  const { track } = useTrack();
  const apiBaseUrl = useConfig("apiBaseUrl");
  const fetchSymbols = useSymbolStore((state) => state.fetchData);

  const [meta, setMeta] = useState<{
    dirty: { [K in keyof OrderlyOrder]?: boolean };
    submitted: boolean;
    validated: boolean;
    errors: OrderValidationResult | null;
  }>({
    dirty: {},
    submitted: false,
    validated: false,
    errors: null,
  });

  const askAndBid = useRef<number[][]>([[]]); // [[ask0, bid0],...,[ask4,bid4]]
  const lastChangedField = useRef<keyof FullOrderState | undefined>();
  const lastOrderTypeExt = useRef<OrderType>();
  const lastLevel = useRef<OrderLevel>();
  const fundingRates = useFundingRatesStore();

  const calculateTPSL_baseOn = useRef<{ tp: string; sl: string }>({
    tp: "",
    sl: "",
  });

  const actions = useMarkPriceActions();
  const symbolConfig = useSymbolsInfo();
  const accountInfo = useAccountInfo();
  const positions = usePositions();
  // formattedOrder will be available from useOrderEntryNextInternal below
  const effectiveMarginMode =
    (options as OrderEntryParameters[1])?.initialOrder?.margin_mode ??
    MarginMode.CROSS;
  const { getSymbolLeverage, refresh: refreshSymbolLeverages } =
    useSymbolLeverageMap();
  const symbolLeverage = getSymbolLeverage(symbol, effectiveMarginMode);
  useRwaLeverageSync(symbol, refreshSymbolLeverages);

  const symbolInfo: API.SymbolExt = symbolConfig[symbol]();
  const markPrice = actions.getMarkPriceBySymbol(symbol);

  const { orderMetadata } = useOrderlyContext();

  const {
    formattedOrder,
    setValue: setValueInternal,
    setValues: setValuesInternal,
    setValuesRaw: setValuesRawInternal,
    validate,
    generateOrder,
    reset,
    // submit,
    ...orderEntryActions
  } = useOrderEntryNextInternal(symbol, {
    ...options,
    symbolInfo,
    symbolLeverage,
  });

  const [estSlippage, setEstSlippage] = useState<number | null>(null);
  const [bestAskBidSnapshot, setBestAskBidSnapshot] = useState<number[]>([]);

  const [doCreateOrder, { isMutating }] = useMutation<OrderlyOrder, any>(
    getCreateOrderUrl(formattedOrder),
  );

  const bestAskBid = bestAskBidSnapshot;

  const getReferencePriceForOrder = (
    order: Partial<OrderlyOrder>,
  ): number | null => {
    if (!order.order_type || !order.side) {
      return null;
    }
    const isIsolated =
      (order.margin_mode ?? effectiveMarginMode) === MarginMode.ISOLATED;

    // ISOLATED MARKET orders are priced from mark price +/- price_range to
    // match the backend freezing reference price
    // (ReferencePriceServiceImpl), not from the Ask1/Bid1 touch. CROSS keeps
    // the legacy Ask1/Bid1 reference.
    const referencePrice = getOrderReferencePriceFromOrder(
      order,
      bestAskBid,
      isIsolated
        ? {
            markPrice,
            priceRange: symbolInfo.price_range,
            pricePrecision: symbolInfo.quote_dp,
          }
        : undefined,
    );

    const slippage = Number(order.slippage);
    if (
      !isIsolated ||
      order.side !== OrderSide.BUY ||
      order.order_type !== OrderType.MARKET ||
      !referencePrice ||
      !Number.isFinite(slippage) ||
      slippage <= 0
    ) {
      return referencePrice;
    }

    // Backend clamps the MARKET BUY reference against midPrice * (1 +
    // slippage): keep the cheaper of (mark + range) and mid * (1 + slippage).
    if (!(bestAskBid[0] > 0 && bestAskBid[1] > 0)) {
      // Without a mid price the range price is already the conservative
      // upper bound for a BUY.
      return referencePrice;
    }

    const midPrice = new Decimal(bestAskBid[0]).add(bestAskBid[1]).div(2);
    const slippagePrice = midPrice.mul(
      new Decimal(1).add(new Decimal(slippage).div(100)),
    );

    return slippagePrice.lessThan(referencePrice)
      ? slippagePrice.toNumber()
      : referencePrice;
  };

  const getReferencePriceForSide = (side: OrderSide): number | null => {
    // Max Qty is BBO-driven and keeps its original mark-price fallback until
    // both sides of the orderbook snapshot are available. Borrow projection
    // calls getReferencePriceForOrder directly so priced LIMIT/SCALED orders
    // can still use their submitted prices without an unconditional BBO gate.
    if (bestAskBid.length < 2) {
      return null;
    }
    return getReferencePriceForOrder({ ...formattedOrder, side });
  };

  // Reference price for the new order, kept in sync with how the backend
  // risk engine prices orders (mark price +/- price_range for ISOLATED
  // MARKET, otherwise BBO / submitted prices), so the displayed max qty
  // matches what the backend will actually accept.
  const buyReferencePriceFromOrder = getReferencePriceForSide(OrderSide.BUY);
  const sellReferencePriceFromOrder = getReferencePriceForSide(OrderSide.SELL);

  const maxBuyQtyValue = useMaxQty(symbol, OrderSide.BUY, {
    reduceOnly: formattedOrder.reduce_only,
    marginMode: effectiveMarginMode,
    currentOrderReferencePrice:
      buyReferencePriceFromOrder && buyReferencePriceFromOrder > 0
        ? buyReferencePriceFromOrder
        : undefined,
  });
  const maxSellQtyValue = useMaxQty(symbol, OrderSide.SELL, {
    reduceOnly: formattedOrder.reduce_only,
    marginMode: effectiveMarginMode,
    currentOrderReferencePrice:
      sellReferencePriceFromOrder && sellReferencePriceFromOrder > 0
        ? sellReferencePriceFromOrder
        : undefined,
  });
  const maxQtyValue =
    formattedOrder.side === OrderSide.BUY ? maxBuyQtyValue : maxSellQtyValue;

  // @ts-ignore
  const maxQty = options.maxQty ?? maxQtyValue;
  const maxQtys = useMemo(
    () => ({
      maxBuy:
        formattedOrder.side === OrderSide.BUY
          ? // @ts-ignore
            (options.maxQty ?? maxBuyQtyValue)
          : maxBuyQtyValue,
      maxSell:
        formattedOrder.side === OrderSide.SELL
          ? // @ts-ignore
            (options.maxQty ?? maxSellQtyValue)
          : maxSellQtyValue,
    }),
    [
      formattedOrder.side,
      maxBuyQtyValue,
      maxSellQtyValue,
      // @ts-ignore
      options.maxQty,
    ],
  );

  const updateOrderPrice = () => {
    const order_type = formattedOrder.order_type;
    const order_type_ext =
      formattedOrder.order_type_ext ?? lastOrderTypeExt.current;
    const level = formattedOrder.level ?? lastLevel.current;

    const isBBO = isBBOOrder({ order_type, order_type_ext });

    if (!isBBO || level === undefined) {
      return;
    }

    lastOrderTypeExt.current = order_type_ext;
    lastLevel.current = level;

    const index = order_type_ext === OrderType.ASK ? 0 : 1;
    const price = askAndBid.current?.[level!]?.[index];
    if (price) {
      setValue("order_price", price, {
        shouldUpdateLastChangedField: false,
      });
    }
  };

  // update the order price by order book
  const updateOrderPriceByOrderBook = () => {
    const { order_type, order_type_ext } = formattedOrder;

    const isBBO = isBBOOrder({ order_type, order_type_ext });

    // only update the order price when last changed field is not total and the order type is bbo
    if (lastChangedField.current !== "total" && isBBO) {
      updateOrderPrice();
    }
  };

  const updateEstSlippage = (orderBook: any) => {
    if (
      formattedOrder.order_type !== OrderType.MARKET ||
      !formattedOrder.order_quantity
    ) {
      setEstSlippage(null);
      return;
    }
    const { order_quantity, side } = formattedOrder;

    // const avgExecutionPrice = orderBook;
    let avgExecutionPrice: Decimal | undefined;
    let book: any;
    const filledBorders: number[][] = [];
    let orderQuantity = new Decimal(order_quantity);

    if (side === OrderSide.BUY) {
      book = [...orderBook.asks].reverse();
    } else {
      book = orderBook.bids;
    }

    for (let i = 0; i < book.length; i++) {
      // console.log(book[i]);
      // const price = book[i][0];
      // const quantity = book[i][2];
      // if (quantity >= order_quantity) {
      //   avgExecutionPrice = price;
      //   break;
      // }
      const price = book[i][0];
      const quantity = book[i][1];
      if (isNaN(price) || isNaN(quantity)) {
        continue;
      }
      if (orderQuantity.gt(quantity)) {
        orderQuantity = orderQuantity.minus(quantity);
        filledBorders.push([price, quantity]);
      } else {
        filledBorders.push([price, orderQuantity.toNumber()]);
        break;
      }
    }

    if (filledBorders.length > 0) {
      const sumPrice = filledBorders.reduce((acc, curr) => {
        return acc.plus(new Decimal(curr[0]).mul(curr[1]));
      }, zero);

      avgExecutionPrice = sumPrice.div(order_quantity);
    }

    const bestPrice = book[0][0];
    if (avgExecutionPrice && bestPrice) {
      const estSlippage = avgExecutionPrice
        .minus(bestPrice)
        .abs()
        .div(bestPrice)
        .toNumber();
      setEstSlippage(estSlippage);
    }
  };

  useEffect(() => {
    // when BBO type change, it will change order price
    updateOrderPrice();
  }, [formattedOrder.order_type_ext, formattedOrder.level]);

  useEffect(() => {
    askAndBid.current = [[]];
    setBestAskBidSnapshot([]);
  }, [symbol]);

  const onOrderBookUpdate = useDebouncedCallback((data: any) => {
    const parsedData = [
      [data.asks?.[data.asks.length - 1]?.[0], data.bids?.[0]?.[0]],
      [data.asks?.[data.asks.length - 2]?.[0], data.bids?.[1]?.[0]],
      [data.asks?.[data.asks.length - 3]?.[0], data.bids?.[2]?.[0]],
      [data.asks?.[data.asks.length - 4]?.[0], data.bids?.[3]?.[0]],
      [data.asks?.[data.asks.length - 5]?.[0], data.bids?.[4]?.[0]],
    ];
    askAndBid.current = parsedData;
    const nextBestAskBid = parsedData[0] || [];
    setBestAskBidSnapshot((prev) =>
      prev[0] === nextBestAskBid[0] && prev[1] === nextBestAskBid[1]
        ? prev
        : nextBestAskBid,
    );
    updateOrderPriceByOrderBook();
    updateEstSlippage(data);
  }, 200);

  /**
   * TODO: remove this when orderBook calc is moved to the calculation service
   */
  useEffect(() => {
    ee.on("orderbook:update", onOrderBookUpdate);

    return () => {
      ee.off("orderbook:update", onOrderBookUpdate);
    };
  }, []);

  useEffect(() => {
    // Skip if formattedOrder.symbol doesn't match current symbol (stale state from previous symbol)
    if (formattedOrder.symbol !== symbol) {
      return;
    }

    if (
      (formattedOrder.order_type === OrderType.MARKET ||
        formattedOrder.order_type === OrderType.STOP_MARKET) &&
      markPrice
    ) {
      const baseOn = new Set<string>();
      if (lastChangedField.current) {
        baseOn.add(lastChangedField.current);
      }
      if (calculateTPSL_baseOn.current.tp) {
        baseOn.add(calculateTPSL_baseOn.current.tp);
      }
      if (calculateTPSL_baseOn.current.sl) {
        baseOn.add(calculateTPSL_baseOn.current.sl);
      }
      orderEntryActions.onMarkPriceChange(markPrice, Array.from(baseOn));
    }
  }, [markPrice, formattedOrder.order_type, formattedOrder.symbol, symbol]);

  const prepareData = useCallback(() => {
    return {
      markPrice: actions.getMarkPriceBySymbol(symbol),
      maxQty,
      estSlippage,
      askAndBid: askAndBid.current?.[0] || [],
    };
  }, [maxQty, symbol, estSlippage]);

  const interactiveValidate = (order: Partial<OrderlyOrder>) => {
    validateFunc(order).then((errors) => {
      const keys = Object.keys(errors);
      if (keys.length > 0) {
        setMeta(
          produce((draft) => {
            draft.errors = errors;
          }),
        );
      } else {
        setMeta(
          produce((draft) => {
            draft.errors = null;
          }),
        );
      }
    });
  };

  const canSetTPSLPrice = (
    key: keyof OrderlyOrder,
    value: any,
    orderType: OrderType,
  ) => {
    if (
      tpslFields.includes(key) &&
      value !== "" &&
      value !== undefined &&
      value !== null &&
      orderType !== OrderType.LIMIT &&
      orderType !== OrderType.MARKET
    ) {
      console.warn("Only limit order can be set tp/sl");
      return false;
    }

    return true;
  };

  const setValue = (
    key: keyof FullOrderState,
    value: any,
    options?: {
      shouldUpdateLastChangedField?: boolean;
      shouldUpdateDirty?: boolean;
    },
  ) => {
    const { shouldUpdateLastChangedField = true, shouldUpdateDirty = true } =
      options || {};
    if (!canSetTPSLPrice(key, value, formattedOrder.order_type)) {
      return;
    }
    // fieldDirty.current[key] = true;
    if (shouldUpdateDirty) {
      setMeta(
        produce((draft) => {
          draft.dirty[key] = true;
        }),
      );
    }

    const values = setValueInternal(key, value, prepareData());

    if (values) {
      interactiveValidate(values);
    }

    if (shouldUpdateLastChangedField) {
      if (key.startsWith("tp_")) {
        calculateTPSL_baseOn.current.tp = key;
      } else if (key.startsWith("sl_")) {
        calculateTPSL_baseOn.current.sl = key;
      }

      lastChangedField.current = key;
    }
  };

  const setValues = (values: Partial<FullOrderState>) => {
    if (
      !Object.keys(values).every((key) =>
        canSetTPSLPrice(
          key as keyof FullOrderState,
          values[key as keyof FullOrderState],
          formattedOrder.order_type,
        ),
      )
    ) {
      return;
    }

    const newValues = setValuesInternal(values, prepareData());

    if (newValues) {
      interactiveValidate(newValues);
    }
  };

  const setValuesRaw = (values: Partial<FullOrderState>) => {
    if (
      !Object.keys(values).every((key) =>
        canSetTPSLPrice(
          key as keyof FullOrderState,
          values[key as keyof FullOrderState],
          formattedOrder.order_type,
        ),
      )
    ) {
      return;
    }

    const newValues = setValuesRawInternal(values);
    if (newValues) {
      interactiveValidate(newValues);
    }
  };

  async function validateFunc(order: Partial<OrderlyOrder>) {
    const creator = getOrderCreator(order);

    return validate(order, creator, prepareData());
  }

  /**
   * Validate the order
   * TODO: confirm validate result return order
   */
  const validateOrder = (
    otherErrors?: OrderValidationResult,
  ): Promise<OrderlyOrder> => {
    return new Promise<OrderlyOrder>(async (resolve, reject) => {
      const creator = getOrderCreator(formattedOrder);
      let errors = await validate(formattedOrder, creator, prepareData());
      if (otherErrors) {
        errors = {
          ...errors,
          ...otherErrors,
        };
      }
      const keys = Object.keys(errors);
      if (keys.length > 0) {
        // setErrors(errors);
        setMeta(
          produce((draft) => {
            draft.errors = errors;
          }),
        );
        if (!meta.validated) {
          // setMeta((prev) => ({ ...prev, validated: true }));
          setMeta(
            produce((draft) => {
              draft.validated = true;
            }),
          );
        }
        reject(errors);
      }
      // create order
      const order = generateOrder(creator, prepareData());
      resolve(order);
    });
  };

  const { freeCollateral, totalCollateral } = useCollateral();

  const currentPositionData = useMemo(() => {
    const rows = positions ?? [];
    const marginMode = formattedOrder.margin_mode ?? effectiveMarginMode;
    return Array.isArray(rows)
      ? rows.find(
          (position) =>
            position.symbol === symbol &&
            (position.margin_mode ?? MarginMode.CROSS) === marginMode,
        )
      : undefined;
  }, [positions, symbol, formattedOrder.margin_mode, effectiveMarginMode]);
  const currentPosition = currentPositionData?.position_qty ?? 0;

  // Per-order pending data for the risk-engine frozen simulation. `null`
  // means the stream has not loaded yet and the borrow projection falls back
  // to the aggregate pending quantities on the position.
  const [symbolOpenOrders] = useOrderStream({
    symbol,
    status: OrderStatus.INCOMPLETE,
    size: 100,
  });

  const getProjectedUSDCBorrow = useMemoizedFn(
    (generatedOrder: Partial<OrderlyOrder>): number | null => {
      const order = generatedOrder as GeneratedOrderForBorrowProjection;
      const marginMode =
        order.margin_mode ?? formattedOrder.margin_mode ?? effectiveMarginMode;
      const reduceOnly = order.reduce_only ?? formattedOrder.reduce_only;

      if (marginMode !== MarginMode.ISOLATED || reduceOnly) {
        return 0;
      }

      const portfolio = useAppStore.getState().portfolio;
      if (!portfolio.holding) {
        return null;
      }

      const positionRows = usePositionStore.getState().positions.all.rows ?? [];
      const position = positionRows.find(
        (item) =>
          item.symbol === symbol &&
          (item.margin_mode ?? MarginMode.CROSS) === marginMode,
      );
      const usdcHolding = portfolio.holding.find(
        (item) => item.token === "USDC",
      );
      if (!usdcHolding) {
        return null;
      }

      const orderValues = getOrderQuantityAndNotional({
        generatedOrder: order,
        formattedOrder,
        marginMode,
        getReferencePrice: getReferencePriceForOrder,
      });

      if (!orderValues) {
        return null;
      }

      const markPrice = Number(actions.getMarkPriceBySymbol(symbol));
      const pendingOrders = resolveIsolatedPendingOrders(symbolOpenOrders, {
        symbol,
        fallbackPrice: markPrice > 0 ? markPrice : 0,
        pendingLongQty: position?.pending_long_qty ?? 0,
        pendingShortQty: position?.pending_short_qty ?? 0,
      });

      const leverage = symbolLeverage ?? position?.leverage;
      return calculateProjectedUSDCBorrow({
        marginMode,
        reduceOnly,
        orderSide: order.side ?? formattedOrder.side,
        orderQuantity: orderValues.orderQuantity,
        orderNotional: orderValues.orderNotional,
        newOrderEntries: orderValues.orders,
        leverage: Number(leverage),
        markPrice,
        positionQty: position?.position_qty ?? 0,
        pendingLongQty: position?.pending_long_qty ?? 0,
        pendingShortQty: position?.pending_short_qty ?? 0,
        pendingOrders,
        usdcHolding: usdcHolding.holding,
        usdcPendingShort: usdcHolding.pending_short,
        usdcIsolatedOrderFrozen: usdcHolding.isolated_order_frozen,
        totalUnsettledPnL: portfolio.unsettledPnL,
      });
    },
  );

  // TODO: move to the calculation service
  const estLiqPrice = useMemo(() => {
    const markPrice = actions.getMarkPriceBySymbol(symbol);
    if (!markPrice || !accountInfo || !symbolInfo) {
      return null;
    }

    const sumUnitaryFunding = fundingRates[symbol]?.sum_unitary_funding ?? 0;

    const estLiqPrice = calcEstLiqPrice(formattedOrder, askAndBid.current[0], {
      markPrice,
      totalCollateral,
      futures_taker_fee_rate: accountInfo.futures_taker_fee_rate,
      imr_factor: accountInfo.imr_factor?.[symbol] ?? 0,
      symbol,
      positions,
      symbolInfo,
      sumUnitaryFunding,
      symbolLeverage: symbolLeverage,
    });

    return estLiqPrice;
  }, [
    formattedOrder,
    accountInfo,
    positions,
    totalCollateral,
    symbol,
    maxQty,
    symbolInfo,
    fundingRates,
    symbolLeverage,
  ]);

  const estLiqPriceDistance = useMemo(() => {
    if (!estLiqPrice) {
      return null;
    }
    return new Decimal(estLiqPrice)
      .minus(markPrice)
      .abs()
      .div(markPrice)
      .toNumber();
  }, [estLiqPrice, markPrice]);

  const estLeverage = useMemo(() => {
    if (!symbolInfo) {
      return null;
    }

    const orderQuantity = Number(formattedOrder.order_quantity);

    if (orderQuantity === 0 || orderQuantity > maxQty) {
      return null;
    }

    return calcEstLeverage(formattedOrder, askAndBid.current[0], {
      totalCollateral,
      positions,
      symbol,
      symbolInfo,
    });
  }, [
    formattedOrder,
    accountInfo,
    positions,
    totalCollateral,
    symbol,
    maxQty,
    symbolInfo,
  ]);

  const resetErrors = () => {
    setMeta(
      produce((draft) => {
        draft.errors = null;
      }),
    );
  };

  const resetMetaState = () => {
    setMeta(
      produce((draft) => {
        draft.errors = null;
        draft.submitted = false;
        draft.validated = false;
        draft.dirty = {};
      }),
    );
  };

  const submitOrder = async (options?: SubmitOrderOptions) => {
    /**
     * validate order
     */
    const creator = getOrderCreator(formattedOrder);
    const errors = await validate(formattedOrder, creator, prepareData());
    const { resetOnSuccess = true, usdcBorrowLimit } = options || {};
    // setMeta((prev) => ({ ...prev, submitted: true, validated: true }));
    setMeta(
      produce((draft) => {
        draft.submitted = true;
        draft.validated = true;
      }),
    );
    if (Object.keys(errors).length > 0) {
      setMeta(
        produce((draft) => {
          draft.errors = errors;
        }),
      );
      throw new SDKError("Order validation failed");
    }

    const order = generateOrder(creator, prepareData());

    // The guard always compares against a concrete limit: an omitted or
    // unavailable threshold falls back to DEFAULT_USDC_BORROW_LIMIT.
    const borrowLimit = normalizeUSDCBorrowLimit(usdcBorrowLimit);
    assertUSDCBorrowWithinLimit(getProjectedUSDCBorrow(order), borrowLimit);

    const isScaledOrder = order.order_type === OrderType.SCALED;

    const params = isScaledOrder
      ? {
          orders: appendOrderMetadata(order.orders, orderMetadata),
        }
      : appendOrderMetadata(order, orderMetadata);

    const result = await doCreateOrder(params);

    // If placing a Market/Stop Market order fails, refresh symbol info once
    // to check whether the symbol has switched to POST_ONLY.
    if (
      !result.success &&
      (order.order_type === OrderType.MARKET ||
        order.order_type === OrderType.STOP_MARKET)
    ) {
      void fetchSymbols(apiBaseUrl);
    }

    if (result.success) {
      let trackParams: any = {
        side: order.side,
        order_type: order.order_type,
        tp_sl: hasTPSL(formattedOrder),
        symbol: order.symbol,
      };

      if ([OrderType.ASK, OrderType.BID].includes(order.order_type)) {
        trackParams = {
          ...trackParams,
          bbo: true,
          bbo_setting: getBBOType({
            type: order.order_type,
            side: order.side,
            level: order.level,
          }),
        };
      }

      if (isScaledOrder) {
        const skew = getScaledOrderSkew({
          skew: order.skew,
          distribution_type: order.distribution_type,
          total_orders: order.total_orders,
        });
        trackParams = {
          ...trackParams,
          order_type: "scaled",
          distribution_type: order.distribution_type,
          skew: new Decimal(skew).todp(2).toNumber(),
          total_orders: order.total_orders,
        };
      }

      track(TrackerEventName.placeOrderSuccess, trackParams);
    }

    if (result.success && resetOnSuccess) {
      reset();
      resetMetaState();
    }
    return result;
  };

  // reset error state when order type change
  useEffect(() => {
    resetMetaState();
  }, [formattedOrder.order_type]);

  return {
    ...orderEntryActions,
    submit: submitOrder,
    reset,
    resetErrors,
    resetMetaState,
    formattedOrder,
    maxQty,
    maxQtys,
    estLiqPrice,
    estLiqPriceDistance,
    currentPosition,
    estLeverage,
    estSlippage,
    helper: {
      /**
       * @deprecated use validate instead
       */
      validator: validateOrder,
      validate: validateOrder,
      getProjectedUSDCBorrow,
    },
    freeCollateral,
    setValue: useMemoizedFn(setValue),
    setValues: useMemoizedFn(setValues),
    setValuesRaw: useMemoizedFn(setValuesRaw),
    symbolInfo: symbolInfo || EMPTY_OBJECT,
    metaState: meta,
    isMutating,
    markPrice,
    symbolLeverage,
  };
};

export { useOrderEntry };
