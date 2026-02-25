import { useMemo, useCallback, useRef, useEffect } from "react";
import type { LayoutModel, LayoutStrategy } from "../types";

/**
 * Check if we're in a browser environment with localStorage available
 */
function canUseLocalStorage(): boolean {
  try {
    return (
      typeof window !== "undefined" &&
      typeof window.localStorage !== "undefined"
    );
  } catch {
    return false;
  }
}

/**
 * Hook for persisting layout state to localStorage
 * @param strategy - The layout strategy being used
 * @param storageKey - localStorage key (optional, if not provided returns undefined)
 * @param dep - Dependency to trigger re-read from storage when it changes
 * @returns Tuple of [currentLayout, setLayout]
 */
export function useLayoutPersistence<TLayout extends LayoutModel>(
  strategy: LayoutStrategy<TLayout>,
  storageKey?: string,
  dep?: unknown,
): [TLayout | undefined, (layout: TLayout) => void] {
  // Debounce timer ref
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const layout = useMemo(() => {
    if (!storageKey || !canUseLocalStorage()) {
      return undefined;
    }

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return strategy.deserialize(stored);
      }
    } catch (error) {
      console.warn(`Failed to deserialize layout from ${storageKey}:`, error);
    }

    return undefined;
  }, [strategy, storageKey, dep]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Memoized setLayout with debouncing to avoid excessive writes
  const setLayout = useCallback(
    (newLayout: TLayout) => {
      if (!storageKey || !canUseLocalStorage()) {
        return;
      }

      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Debounce the write operation (100ms)
      debounceTimerRef.current = setTimeout(() => {
        try {
          const serialized = strategy.serialize(newLayout);
          localStorage.setItem(storageKey, serialized);
        } catch (error) {
          console.warn(`Failed to serialize layout to ${storageKey}:`, error);
        }
      }, 100);
    },
    [strategy, storageKey],
  );

  return [layout, setLayout];
}
