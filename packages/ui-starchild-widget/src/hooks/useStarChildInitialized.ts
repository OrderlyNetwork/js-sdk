import { useState, useEffect } from "react";

// Global flag to track initialization status across all hook instances
const STARCHILD_INITIALIZED_KEY = "__starchild_initialized__";

/**
 * Hook to track StarChild initialization status.
 * Listens to the custom "starchild:initialized" event dispatched by StarChildInitializer.
 * Use this when the component is outside the starchild-widget provider tree (e.g. StarchildSearchButton
 * in MainNav, which is a sibling of StarchildControlPanel where the provider lives).
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
      (window as any)[STARCHILD_INITIALIZED_KEY] = true;
      setIsInitialized(true);
    };

    const handleDestroyed = () => {
      (window as any)[STARCHILD_INITIALIZED_KEY] = false;
      setIsInitialized(false);
    };

    window.addEventListener("starchild:initialized", handleInitialized);
    window.addEventListener("starchild:destroyed", handleDestroyed);

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
