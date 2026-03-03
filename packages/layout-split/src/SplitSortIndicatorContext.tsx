/**
 * Context for sort indicator visibility (showIndicator).
 * Provided by SplitTradingDesktopChrome from props (e.g. showPositionIcon);
 * consumed by SortNodeRenderer to conditionally show drag handles.
 */
import React, { createContext, useContext, useMemo } from "react";

export interface SplitSortIndicatorContextValue {
  /** When true, show drag handle on sortable panels; when false, hide it. */
  showIndicator: boolean;
}

const SplitSortIndicatorContext =
  createContext<SplitSortIndicatorContextValue | null>(null);

const DEFAULT_SHOW_INDICATOR = true;

export interface SplitSortIndicatorProviderProps {
  /** Whether to show the drag indicator on sortable panels. */
  showIndicator?: boolean;
  children: React.ReactNode;
}

/**
 * Provides showIndicator for SortNodeRenderer.
 * Used by SplitTradingDesktopChrome to pass showPositionIcon from props.
 */
export function SplitSortIndicatorProvider({
  showIndicator = DEFAULT_SHOW_INDICATOR,
  children,
}: SplitSortIndicatorProviderProps): React.ReactElement {
  const value = useMemo<SplitSortIndicatorContextValue>(
    () => ({ showIndicator }),
    [showIndicator],
  );
  return (
    <SplitSortIndicatorContext.Provider value={value}>
      {children}
    </SplitSortIndicatorContext.Provider>
  );
}

/**
 * Returns showIndicator from context; defaults to true when outside provider.
 */
export function useSplitSortIndicatorContext(): boolean {
  const ctx = useContext(SplitSortIndicatorContext);
  return ctx?.showIndicator ?? DEFAULT_SHOW_INDICATOR;
}
