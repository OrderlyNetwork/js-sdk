import { useState, useEffect, useCallback } from "react";
import { VIEWPORT_BREAKPOINT_ORDER, VIEWPORT_BREAKPOINTS } from "../constants";
import type { ViewportBreakpointKey } from "../constants";

/**
 * Returns the current viewport breakpoint key (largest breakpoint whose max width >= viewport width).
 */
export function getViewportBreakpointKey(
  viewportWidth: number,
  breakpoints = VIEWPORT_BREAKPOINTS,
): ViewportBreakpointKey {
  for (const bp of VIEWPORT_BREAKPOINT_ORDER) {
    if (viewportWidth <= breakpoints[bp]) return bp;
  }
  return "max2XL";
}

export interface UseViewportBreakpointOptions {
  /** Breakpoint map; defaults to VIEWPORT_BREAKPOINTS. */
  breakpoints?: typeof VIEWPORT_BREAKPOINTS;
  /** Initial width when ref not yet mounted. */
  fallbackWidth?: number;
}

/**
 * Observes viewport width (window.innerWidth) and returns current breakpoint key.
 * Uses window resize event; before mount uses fallbackWidth.
 *
 * @param options - Optional breakpoints and fallbackWidth
 * @returns Current breakpoint key (min3XL | max4XL | default | max2XL)
 */
export function useViewportBreakpoint(
  options: UseViewportBreakpointOptions = {},
): ViewportBreakpointKey {
  const {
    breakpoints = VIEWPORT_BREAKPOINTS,
    fallbackWidth = typeof window !== "undefined" ? window.innerWidth : 1440,
  } = options;
  const [width, setWidth] = useState(fallbackWidth);

  const updateWidth = useCallback(() => {
    if (typeof window !== "undefined") {
      setWidth(window.innerWidth);
    }
  }, []);

  useEffect(() => {
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [updateWidth]);

  const bp = getViewportBreakpointKey(width, breakpoints);
  return bp;
}
