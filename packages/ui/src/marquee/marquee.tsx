import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { cnBase } from "tailwind-variants";

// Type definitions
export type Direction = "left" | "right" | "up" | "down";

export type Mode = "continuous" | "screen";

export interface MarqueeProps<T = unknown> {
  data: T[] | ReadonlyArray<T>;
  renderItem: (item: T, index: number) => React.ReactNode;
  direction?: Direction;
  mode?: Mode;
  speed?: number; // Scroll speed in px/s
  delay?: number; // Pause time after each scroll in ms (only effective in screen mode)
  pauseOnHover?: boolean; // Pause when mouse hovers
  className?: string;
}

export const Marquee = <T,>(props: MarqueeProps<T>) => {
  const {
    data,
    renderItem,
    direction = "left",
    mode = "continuous",
    speed = 50,
    delay = 0,
    pauseOnHover = true,
    className,
  } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [itemSize, setItemSize] = useState(0); // Size of individual item (width or height)
  const [currentPosition, setCurrentPosition] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isResetting, setIsResetting] = useState(false); // Track reset state for animation control
  const animationFrameId = useRef<number | null>(null);
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimeoutId = useRef<ReturnType<typeof setTimeout> | null>(null); // Track reset timeout for cleanup
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const lastResizeTimeRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true); // Track component mount state

  const isHorizontal = useMemo<boolean>(
    () => direction === "left" || direction === "right",
    [direction],
  );

  // Calculate whether scrolling is needed and related dimensions
  const calculateScrollState = useCallback(() => {
    if (!containerRef.current || !contentRef.current) {
      return;
    }
    const containerSize = isHorizontal
      ? containerRef.current.offsetWidth
      : containerRef.current.offsetHeight;
    const contentSize = isHorizontal
      ? contentRef.current.scrollWidth
      : contentRef.current.scrollHeight;

    // Only scroll when content size is larger than container size
    const needToScroll = contentSize > containerSize;
    setShouldScroll(needToScroll);

    if (needToScroll && data?.length > 0) {
      // Try to get the size of the first item as itemSize
      const firstItem = contentRef.current.children[0] as HTMLElement;
      if (firstItem) {
        setItemSize(
          isHorizontal ? firstItem.offsetWidth : firstItem.offsetHeight,
        );
      }
    } else {
      setItemSize(0);
    }

    // Reset position to prevent anomalies after size changes
    // Only reset if we're not currently scrolling in screen mode
    if (mode !== "screen" || !shouldScroll) {
      setCurrentPosition(0);
    }
  }, [data, isHorizontal, mode, shouldScroll]);

  useEffect(() => {
    calculateScrollState();

    // Use ResizeObserver to watch for container size changes
    if (containerRef.current && typeof ResizeObserver !== "undefined") {
      resizeObserverRef.current = new ResizeObserver(() => {
        // Throttle resize events to prevent excessive calculations
        const now = Date.now();
        if (now - lastResizeTimeRef.current > 16) {
          // ~60fps
          lastResizeTimeRef.current = now;
          calculateScrollState();
        }
      });
      resizeObserverRef.current.observe(containerRef.current);
    } else {
      // Fallback to window resize for older browsers
      window.addEventListener("resize", calculateScrollState);
    }

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      } else {
        window.removeEventListener("resize", calculateScrollState);
      }
    };
  }, [calculateScrollState]);

  // Cleanup effect for component unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      // Clean up all timers and animation frames
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (timeoutId.current !== null) {
        clearTimeout(timeoutId.current);
      }
      if (resetTimeoutId.current !== null) {
        clearTimeout(resetTimeoutId.current);
      }
    };
  }, []);

  // Continuous scrolling logic
  const startContinuousScroll = useCallback(() => {
    if (
      !shouldScroll ||
      isPaused ||
      !contentRef.current ||
      !containerRef.current
    ) {
      return;
    }

    const contentSize = isHorizontal
      ? contentRef.current.scrollWidth / 2
      : contentRef.current.scrollHeight / 2; // Content is duplicated for seamless loop

    const step = speed / 60; // Distance moved per frame (assuming 60fps)

    const animate = () => {
      if (!isMountedRef.current) {
        return; // Safety check
      }

      setCurrentPosition((prev) => {
        let newPos: number;
        if (direction === "left" || direction === "up") {
          newPos = prev - step;
          if (Math.abs(newPos) >= contentSize) {
            newPos = 0; // Loop
          }
        } else {
          // right or down
          newPos = prev + step;
          if (newPos >= 0) {
            newPos = -contentSize; // Loop
          }
        }
        return newPos;
      });

      if (isMountedRef.current) {
        animationFrameId.current = requestAnimationFrame(animate);
      }
    };
    animationFrameId.current = requestAnimationFrame(animate);
  }, [shouldScroll, isPaused, speed, direction, isHorizontal]);

  // Screen-by-screen scrolling logic
  const startScreenScroll = useCallback(() => {
    if (!shouldScroll || isPaused || !containerRef.current || itemSize === 0) {
      return;
    }

    const contentTotalItems = data?.length; // Number of items in original data
    const totalContentSize = contentTotalItems * itemSize; // Total size of original content

    const scrollNext = () => {
      setCurrentPosition((prev) => {
        let nextIndex: number;
        if (direction === "left" || direction === "up") {
          // Calculate the item index corresponding to current position
          const currentIndex = Math.round(Math.abs(prev) / itemSize);
          nextIndex = (currentIndex + 1) % contentTotalItems;

          // If we're moving to the first item (index 0) and we're currently at the last item,
          // we need to jump to the duplicated content to create seamless loop
          if (nextIndex === 0 && currentIndex === contentTotalItems - 1) {
            return -(totalContentSize + nextIndex * itemSize);
          }
          return -(nextIndex * itemSize);
        } else {
          // right or down - move in reverse direction
          const currentIndex = Math.round(Math.abs(prev) / itemSize);
          nextIndex =
            (currentIndex - 1 + contentTotalItems) % contentTotalItems;

          // If we're moving to the last item and we're currently at the first item,
          // we need to jump to the duplicated content to create seamless loop
          if (nextIndex === contentTotalItems - 1 && currentIndex === 0) {
            return -(totalContentSize + nextIndex * itemSize);
          }
          return -(nextIndex * itemSize);
        }
      });

      // After the animation completes, check if we need to reset position for seamless loop
      timeoutId.current = setTimeout(
        () => {
          setCurrentPosition((currentPos) => {
            const currentIndex = Math.round(Math.abs(currentPos) / itemSize);

            // If we're showing duplicated content (position beyond original content),
            // reset to the corresponding position in original content
            if (Math.abs(currentPos) >= totalContentSize) {
              const originalIndex = currentIndex % contentTotalItems;

              // Disable animation for the reset
              if (isMountedRef.current) {
                setIsResetting(true);

                // Use requestAnimationFrame to ensure the reset happens in the next frame
                requestAnimationFrame(() => {
                  // Re-enable animation after the position change
                  if (isMountedRef.current) {
                    resetTimeoutId.current = setTimeout(() => {
                      if (isMountedRef.current) {
                        setIsResetting(false);
                      }
                    }, 0);
                  }
                });
              }

              return -(originalIndex * itemSize);
            }
            return currentPos;
          });

          // Continue scrolling
          timeoutId.current = setTimeout(scrollNext, delay);
        },
        (itemSize / speed) * 1000,
      ); // Animation time only
    };

    // Initial scroll - start from the first item
    timeoutId.current = setTimeout(scrollNext, delay);
  }, [
    shouldScroll,
    isPaused,
    data?.length,
    itemSize,
    delay,
    speed,
    direction,
    isHorizontal,
  ]);

  // Manage scroll animation
  useEffect(() => {
    if (!shouldScroll || isPaused) {
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      if (timeoutId.current !== null) {
        clearTimeout(timeoutId.current);
        timeoutId.current = null;
      }
      return;
    }

    if (mode === "continuous") {
      startContinuousScroll();
    } else if (mode === "screen") {
      startScreenScroll();
    }

    return () => {
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      if (timeoutId.current !== null) {
        clearTimeout(timeoutId.current);
        timeoutId.current = null;
      }
    };
  }, [shouldScroll, isPaused, mode, startContinuousScroll, startScreenScroll]);

  // Mouse hover events
  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover) {
      setIsPaused(true);
    }
  }, [pauseOnHover]);

  const handleMouseLeave = useCallback(() => {
    if (pauseOnHover) {
      setIsPaused(false);
    }
  }, [pauseOnHover]);

  // Render content, duplicate for seamless scrolling in both modes
  const renderContent = useMemo(() => {
    if (!Array.isArray(data)) {
      return null;
    }
    if (!shouldScroll) {
      // Only render original content when not scrolling
      return data.map((item, index) => (
        <React.Fragment key={`original-${index}`}>
          {renderItem(item, index)}
        </React.Fragment>
      ));
    }

    // Render both original and duplicate content for seamless scrolling
    return (
      <>
        {data.map((item, index) => (
          <React.Fragment key={`original-${index}`}>
            {renderItem(item, index)}
          </React.Fragment>
        ))}
        {data.map((item, index) => (
          <React.Fragment key={`copy-${index}`}>
            {renderItem(item, index)}
          </React.Fragment>
        ))}
      </>
    );
  }, [data, renderItem, shouldScroll]);

  const transformStyle = useMemo<React.CSSProperties>(() => {
    const style: React.CSSProperties = {};
    if (isHorizontal) {
      style.transform = `translate3d(${currentPosition}px, 0, 0)`;
      style.transition =
        mode === "screen" && !isResetting
          ? `transform ${itemSize / speed}s linear`
          : "none";
    } else {
      style.transform = `translate3d(0, ${currentPosition}px, 0)`;
      style.transition =
        mode === "screen" && !isResetting
          ? `transform ${itemSize / speed}s linear`
          : "none";
    }
    return style;
  }, [isHorizontal, currentPosition, mode, itemSize, speed, isResetting]);

  return (
    <div
      ref={containerRef}
      className={cnBase(
        `oui-relative oui-overflow-hidden`,
        isHorizontal ? "oui-w-full" : "oui-h-full",
        className,
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={contentRef}
        className={cnBase(
          "oui-flex",
          isHorizontal ? "oui-flex-row" : "oui-flex-col",
          shouldScroll ? undefined : "oui-items-center oui-justify-center",
          // className,
        )}
        style={shouldScroll ? transformStyle : undefined}
      >
        {renderContent}
      </div>
    </div>
  );
};
