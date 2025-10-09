import { useEffect, useState } from "react";

export const useOfflineInfoScript = () => {
  const [offline, setOffline] = useState<boolean>(() => {
    // init check network status
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      return !navigator.onLine;
    }
    return false;
  });

  useEffect(() => {
    // define handle function
    const handleOnline = () => {
      setOffline(false);
    };

    const handleOffline = () => {
      setOffline(true);
    };

    // add event listener
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // clean function
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { offline };
};

export type OfflineInfoState = ReturnType<typeof useOfflineInfoScript>;
