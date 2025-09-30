import { useMemo, useState, useEffect, useRef } from "react";
import { createGetter } from "../utils/createGetter";
import { useAppStore } from "./appStore";

/**
 * Check if currently trading based on next_open/next_close timestamps
 * @param nextOpen - Next open time timestamp
 * @param nextClose - Next close time timestamp
 * @param currentTime - Current time timestamp
 * @returns boolean - true if currently trading
 */
export const isCurrentlyTrading = (
  nextOpen?: number,
  nextClose?: number,
  currentTime: number = Date.now(),
): boolean => {

  if (nextOpen === undefined || nextClose === undefined) {
    return false;
  }

  return currentTime >= nextOpen && currentTime <= nextClose;
};

/**
 * Type alias for the return type of useSymbolsInfo hook
 */
export type RwaSymbolsInfo = ReturnType<typeof useRwaSymbolsInfo>;

/**
 * A hook that provides access to symbol information.
 *
 * @returns A getter object that provides access to symbol information.
 * The getter allows accessing symbol data either by symbol name directly,
 * or through a two-level access pattern (symbol and property).
 *
 * @example
 * ```typescript
 * const rwaSymbolsInfo = useRwaSymbolsInfo();
 *
 * // Get all info for a symbol
 * const ethInfo = rwaSymbolsInfo["PERP_ETH_USDC"]();
 * ```
 */
export const useRwaSymbolsInfo = () => {
  const symbolsInfo = useAppStore((state) => state.rwaSymbolsInfo);
  return useMemo(() => createGetter({ ...symbolsInfo }), [symbolsInfo]);
};

export const useRwaSymbolsInfoStore = () => {
  return useAppStore((state) => state.rwaSymbolsInfo);
};

/**
 * Return type definition for the hook
 *
 * - isRwa: true if the symbol is an RWA symbol
 * - open: true if the symbol is open for trading
 * - nextOpen: the next open time in milliseconds
 * - nextClose: the next close time in milliseconds
 * - closeTimeInterval: the time interval in seconds until the symbol closes (countdown format)
 * - openTimeInterval: the time interval in seconds until the symbol opens (countdown format)
 */
export interface RwaSymbolResult {
  isRwa: boolean;
  open?: boolean;
  nextOpen?: number;
  nextClose?: number;
  closeTimeInterval?: number;
  openTimeInterval?: number;
}

/**
 * Simplified hook to get RWA symbol open status with real-time updates
 * @param symbol - The symbol to query
 * @returns Object containing isRwa and open status
 */
export const useGetRwaSymbolOpenStatus = (
  symbol: string,
): { isRwa: boolean; open?: boolean } => {
  const { isRwa, open } = useGetRwaSymbolInfo(symbol);

  return useMemo(() => {
    return { isRwa, open };
  }, [isRwa, open]);
};

/**
 * Hook to get current RWA symbol information with real-time updates
 * @param symbol - The symbol to query
 * @returns RwaSymbolResult containing RWA status and countdown information
 */
export const useGetRwaSymbolInfo = (symbol: string): RwaSymbolResult => {
  const rwaSymbolsInfo = useRwaSymbolsInfoStore();
  const [currentTime, setCurrentTime] = useState(Date.now());

  const intervalRef = useRef<NodeJS.Timeout>();

  // Get RWA symbol information
  const rwaSymbol = rwaSymbolsInfo?.[symbol] || null;

  useEffect(() => {
    // Clear any existing timer first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }

    // Reset time when symbol changes or no RWA symbol
    if (!rwaSymbol) {
      setCurrentTime(Date.now());
      return;
    }

    // Only start timer if we have valid time data
    if (!rwaSymbol.next_close && !rwaSymbol.next_open) {
      setCurrentTime(Date.now());
      return;
    }

    // Update time every second
    const updateTime = () => {
      setCurrentTime(Date.now());
    };

    // Start timer immediately and then every second
    updateTime();
    intervalRef.current = setInterval(updateTime, 1000);

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
  }, [symbol, !!rwaSymbol]); // Optimized dependencies to avoid frequent rebuilds

  // Memoize result to avoid unnecessary re-renders
  return useMemo(() => {
    if (!rwaSymbol) {
      return { isRwa: false };
    }

    // Use correct logic to determine current trading status
    const { next_close, next_open } = rwaSymbol;

    // Safe time calculation with boundary checks
    const now = currentTime;
    let closeTimeInterval: number | undefined;
    let openTimeInterval: number | undefined;

    // Use isCurrentlyTrading function to determine current trading status
    const isOpen = isCurrentlyTrading(next_open, next_close, now);

    // Calculate countdown to close time
    if (next_close && typeof next_close === "number" && next_close > now) {
      closeTimeInterval = Math.max(0, Math.floor((next_close - now) / 1000));
    }

    // Calculate countdown to open time
    if (next_open && typeof next_open === "number" && next_open > now) {
      openTimeInterval = Math.max(0, Math.floor((next_open - now) / 1000));
    }

    return {
      isRwa: true,
      open: isOpen,
      nextOpen: next_open || undefined,
      nextClose: next_close || undefined,
      closeTimeInterval,
      openTimeInterval,
    };
  }, [rwaSymbol, currentTime]);
};

/**
 * Generic time interval filtering function
 */
const filterTimeInterval = (
  timeInterval: number | undefined,
  isRwa: boolean,
  thresholdMinutes: number,
): number | undefined => {
  if (!isRwa || !timeInterval) {
    return undefined;
  }

  // Return undefined if time interval exceeds threshold
  return timeInterval > thresholdMinutes * 60 ? undefined : timeInterval;
};

/**
 * Hook to get RWA symbol close time interval with filtering
 * @param symbol - The symbol to query
 * @param thresholdMinutes - Time threshold in minutes, defaults to 30
 * @returns Close time interval in seconds, or undefined if not within threshold
 */
export const useGetRwaSymbolCloseTimeInterval = (
  symbol: string,
  thresholdMinutes: number = 30,
): {
  isRwa: boolean;
  open?: boolean;
  closeTimeInterval?: number;
  nextClose?: number;
} => {
  const { isRwa, open, closeTimeInterval, nextClose } =
    useGetRwaSymbolInfo(symbol);

  return useMemo(() => {
    const filteredInterval = filterTimeInterval(
      closeTimeInterval,
      isRwa,
      thresholdMinutes,
    );
    return { isRwa, open, closeTimeInterval: filteredInterval, nextClose };
  }, [isRwa, open, closeTimeInterval, nextClose, thresholdMinutes]);
};

/**
 * Hook to get RWA symbol open time interval with filtering
 * @param symbol - The symbol to query
 * @param thresholdMinutes - Time threshold in minutes, defaults to 30
 * @returns Open time interval in seconds, or undefined if not within threshold
 */
export const useGetRwaSymbolOpenTimeInterval = (
  symbol: string,
  thresholdMinutes: number = 30,
): {
  isRwa: boolean;
  open?: boolean;
  openTimeInterval?: number;
  nextOpen?: number;
} => {
  const { isRwa, open, openTimeInterval, nextOpen } =
    useGetRwaSymbolInfo(symbol);

  return useMemo(() => {
    const filteredInterval = filterTimeInterval(
      openTimeInterval,
      isRwa,
      thresholdMinutes,
    );
    return { isRwa, open, openTimeInterval: filteredInterval, nextOpen };
  }, [isRwa, open, openTimeInterval, nextOpen, thresholdMinutes]);
};
