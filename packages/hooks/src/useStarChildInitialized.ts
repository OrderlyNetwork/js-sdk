import { useState, useEffect } from "react";

// Global flag to track initialization status across all hook instances
const STARCHILD_INITIALIZED_KEY = "__starchild_initialized__";

/**
 * Hook to track StarChild initialization status without importing starchild-widget.
 * Listens to the custom "starchild:initialized" event dispatched by StarChildInitializer.
 * Also checks if StarChild was already initialized before the component mounted.
 *
 * @returns boolean - true if StarChild has been initialized, false otherwise
 */
export const useStarChildInitialized = (): boolean => {
  // Check if already initialized on mount
  const [isInitialized, setIsInitialized] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return (window as any)[STARCHILD_INITIALIZED_KEY] === true;
  });

  useEffect(() => {
    const handleInitialized = () => {
      // Store the initialization state globally
      (window as any)[STARCHILD_INITIALIZED_KEY] = true;
      setIsInitialized(true);
    };

    const handleDestroyed = () => {
      // Reset the initialization state globally
      (window as any)[STARCHILD_INITIALIZED_KEY] = false;
      setIsInitialized(false);
    };

    // Listen for the initialization event
    window.addEventListener("starchild:initialized", handleInitialized);
    // Listen for destroy/reset event
    window.addEventListener("starchild:destroyed", handleDestroyed);

    // Double-check on mount in case we missed it
    if ((window as any)[STARCHILD_INITIALIZED_KEY] === true) {
      setIsInitialized(true);
    }

    return () => {
      window.removeEventListener("starchild:initialized", handleInitialized);
      window.removeEventListener("starchild:destroyed", handleDestroyed);
    };
  }, []);

  return isInitialized;
};
