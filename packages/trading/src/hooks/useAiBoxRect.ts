import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export type ElementRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * Observe an element's rectangle and return its actual dimensions.
 * The height is the actual rendered height of the element itself.
 *
 * @param enabled - Whether to track the rect. When false, rect will be null.
 * @param bottomPadding - Deprecated parameter, kept for backward compatibility but not used
 */
export function useAiBoxRect<T extends HTMLElement>(
  enabled = true,
  bottomPadding = 8,
) {
  const [node, setNode] = useState<T | null>(null);
  const [rect, setRect] = useState<ElementRect | null>(null);

  // Reset rect when disabled
  useEffect(() => {
    if (!enabled) {
      setRect(null);
    }
  }, [enabled]);

  const update = useCallback(() => {
    if (!node) return;
    const r = node.getBoundingClientRect();
    setRect((prev) => {
      // Only update if position or size actually changed
      if (
        prev &&
        prev.x === r.left &&
        prev.y === r.top &&
        prev.width === r.width &&
        prev.height === r.height
      ) {
        return prev;
      }
      return {
        x: r.left,
        y: r.top,
        width: r.width,
        height: r.height,
      };
    });
  }, [node]);

  useLayoutEffect(() => {
    if (!node || !enabled) return;

    // Initial measurement
    update();

    // Set up ResizeObserver for element size changes
    const ro = new ResizeObserver(() => update());
    ro.observe(node);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });

    // Find and listen to all scrollable parent elements
    const scrollableParents: Element[] = [];
    let parent = node.parentElement;
    while (parent) {
      const overflowY = window.getComputedStyle(parent).overflowY;
      if (overflowY === "auto" || overflowY === "scroll") {
        scrollableParents.push(parent);
        parent.addEventListener("scroll", update, { passive: true } as any);
      }
      parent = parent.parentElement;
    }

    // Use requestAnimationFrame loop to continuously check for position changes
    // This catches layout shifts, flexbox changes, and other DOM mutations
    let rafId: number;
    const checkPosition = () => {
      update();
      rafId = requestAnimationFrame(checkPosition);
    };
    rafId = requestAnimationFrame(checkPosition);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
      scrollableParents.forEach((p) => {
        p.removeEventListener("scroll", update);
      });
      cancelAnimationFrame(rafId);
    };
  }, [node, enabled, update]);

  const ref = useCallback((el: T | null) => {
    setNode(el);
  }, []);

  return { ref, rect } as const;
}
