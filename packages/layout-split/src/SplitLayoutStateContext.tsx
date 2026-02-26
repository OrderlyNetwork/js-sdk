/**
 * Split layout plugin state: layoutSide, marketLayout, split sizes, panelSize.
 * Persisted to localStorage (same keys as legacy trading for migration); defaults from LayoutSplitPluginOptions.
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useMediaQuery } from "@orderly.network/ui";

/** Defaults for layout state (passed when registering the plugin). */
export interface LayoutSplitPluginOptions {
  layoutSide?: "left" | "right";
  marketLayout?: "left" | "top" | "bottom" | "hide";
  mainSplitSize?: string;
  orderBookSplitSize?: string;
  dataListSplitSize?: string;
  panelSize?: "small" | "middle" | "large";
  resizeable?: boolean;
}

const STORAGE_KEYS = {
  layoutSide: "orderly_order_entry_side_markets_layout",
  marketLayout: "orderly_horizontal_markets_layout",
  panelSize: "orderly_side_markets_mode",
  mainSplitSize: "orderly_main_split_size",
  dataListSplitSize: "orderly_datalist_split_size",
  orderBookSplitSize: "orderly_orderbook_split_size",
} as const;

const DEFAULT_MAIN = "280px";
const DEFAULT_ORDERBOOK = "280px";
const DEFAULT_DATALIST = "350px";

function readStorage<T extends string>(
  key: string,
  defaultValue: T,
  validate: (s: string) => s is T,
): T {
  if (typeof window === "undefined" || !window.localStorage)
    return defaultValue;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw != null && validate(raw)) return raw;
  } catch {
    // ignore
  }
  return defaultValue;
}

function writeStorage(key: string, value: string): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // ignore
  }
}

export type MarketLayoutPosition = "left" | "top" | "bottom" | "hide";
export type LayoutPosition = "left" | "right";

export interface SplitLayoutState {
  layout: LayoutPosition;
  setLayout: (v: LayoutPosition) => void;
  marketLayout: MarketLayoutPosition;
  setMarketLayout: (v: MarketLayoutPosition) => void;
  mainSplitSize: string;
  setMainSplitSize: (v: string) => void;
  orderBookSplitSize: string;
  setOrderBookSplitSize: (v: string) => void;
  dataListSplitSize: string;
  setDataListSplitSize: (v: string) => void;
  panelSize: "small" | "middle" | "large";
  onPanelSizeChange: (v: "small" | "middle" | "large") => void;
  resizeable: boolean;
  animating: boolean;
  setAnimating: React.Dispatch<React.SetStateAction<boolean>>;
}

const SplitLayoutStateContext = React.createContext<SplitLayoutState | null>(
  null,
);

export function useSplitLayoutState(): SplitLayoutState {
  const ctx = React.useContext(SplitLayoutStateContext);
  if (!ctx) {
    throw new Error(
      "useSplitLayoutState must be used within SplitLayoutStateProvider",
    );
  }
  return ctx;
}

function isLayoutPosition(s: string): s is LayoutPosition {
  return s === "left" || s === "right";
}
function isMarketLayoutPosition(s: string): s is MarketLayoutPosition {
  return s === "left" || s === "top" || s === "bottom" || s === "hide";
}
function isPanelSize(s: string): s is "small" | "middle" | "large" {
  return s === "small" || s === "middle" || s === "large";
}

export interface SplitLayoutStateProviderProps {
  options?: LayoutSplitPluginOptions | null;
  children: React.ReactNode;
}

/**
 * Provides layout-related state owned by the split plugin; persists to localStorage.
 */
export function SplitLayoutStateProvider({
  options,
  children,
}: SplitLayoutStateProviderProps): React.ReactElement {
  const defaults = useMemo(
    () => ({
      layoutSide: (options?.layoutSide ?? "right") as LayoutPosition,
      marketLayout: (options?.marketLayout ?? "left") as MarketLayoutPosition,
      panelSize: (options?.panelSize ?? "large") as
        | "small"
        | "middle"
        | "large",
      mainSplitSize: options?.mainSplitSize ?? DEFAULT_MAIN,
      orderBookSplitSize: options?.orderBookSplitSize ?? DEFAULT_ORDERBOOK,
      dataListSplitSize: options?.dataListSplitSize ?? DEFAULT_DATALIST,
    }),
    [options],
  );

  const [layout, setLayoutState] = useState<LayoutPosition>(() =>
    readStorage(STORAGE_KEYS.layoutSide, defaults.layoutSide, isLayoutPosition),
  );
  const [marketLayout, setMarketLayoutState] = useState<MarketLayoutPosition>(
    () =>
      readStorage(
        STORAGE_KEYS.marketLayout,
        defaults.marketLayout,
        isMarketLayoutPosition,
      ),
  );
  const [panelSizeRaw, setPanelSizeRaw] = useState<
    "small" | "middle" | "large"
  >(() => readStorage(STORAGE_KEYS.panelSize, defaults.panelSize, isPanelSize));
  const [mainSplitSize, setMainSplitSizeState] = useState<string>(() =>
    readStorage(
      STORAGE_KEYS.mainSplitSize,
      defaults.mainSplitSize,
      (s: string): s is string => true,
    ),
  );
  const [orderBookSplitSize, setOrderBookSplitSizeState] = useState<string>(
    () =>
      readStorage(
        STORAGE_KEYS.orderBookSplitSize,
        defaults.orderBookSplitSize,
        (s: string): s is string => true,
      ),
  );
  const [dataListSplitSize, setDataListSplitSizeState] = useState<string>(() =>
    readStorage(
      STORAGE_KEYS.dataListSplitSize,
      defaults.dataListSplitSize,
      (s: string): s is string => true,
    ),
  );
  const [animating, setAnimating] = useState(false);

  const resizeable = useMediaQuery("(min-width: 1440px)");

  const panelSize = resizeable
    ? panelSizeRaw === "large"
      ? "large"
      : "middle"
    : "middle";

  useEffect(() => {
    writeStorage(STORAGE_KEYS.layoutSide, layout);
  }, [layout]);
  useEffect(() => {
    writeStorage(STORAGE_KEYS.marketLayout, marketLayout);
  }, [marketLayout]);
  useEffect(() => {
    writeStorage(STORAGE_KEYS.panelSize, panelSizeRaw);
  }, [panelSizeRaw]);
  useEffect(() => {
    writeStorage(STORAGE_KEYS.mainSplitSize, mainSplitSize);
  }, [mainSplitSize]);
  useEffect(() => {
    writeStorage(STORAGE_KEYS.orderBookSplitSize, orderBookSplitSize);
  }, [orderBookSplitSize]);
  useEffect(() => {
    writeStorage(STORAGE_KEYS.dataListSplitSize, dataListSplitSize);
  }, [dataListSplitSize]);

  const setLayout = useCallback((v: LayoutPosition) => setLayoutState(v), []);
  const setMarketLayout = useCallback(
    (v: MarketLayoutPosition) => setMarketLayoutState(v),
    [],
  );
  const setMainSplitSize = useCallback(
    (v: string) => setMainSplitSizeState(v),
    [],
  );
  const setOrderBookSplitSize = useCallback(
    (v: string) => setOrderBookSplitSizeState(v),
    [],
  );
  const setDataListSplitSize = useCallback(
    (v: string) => setDataListSplitSizeState(v),
    [],
  );
  const onPanelSizeChange = useCallback((v: "small" | "middle" | "large") => {
    setPanelSizeRaw(v);
    setAnimating(true);
  }, []);

  const value = useMemo<SplitLayoutState>(
    () => ({
      layout,
      setLayout,
      marketLayout,
      setMarketLayout,
      mainSplitSize,
      setMainSplitSize,
      orderBookSplitSize,
      setOrderBookSplitSize,
      dataListSplitSize,
      setDataListSplitSize,
      panelSize,
      onPanelSizeChange,
      resizeable,
      animating,
      setAnimating,
    }),
    [
      layout,
      setLayout,
      marketLayout,
      setMarketLayout,
      mainSplitSize,
      setMainSplitSize,
      orderBookSplitSize,
      setOrderBookSplitSize,
      dataListSplitSize,
      setDataListSplitSize,
      panelSize,
      onPanelSizeChange,
      resizeable,
      animating,
    ],
  );

  return (
    <SplitLayoutStateContext.Provider value={value}>
      {children}
    </SplitLayoutStateContext.Provider>
  );
}
