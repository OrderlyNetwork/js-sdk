import { useEffect, useState, useRef, useMemo } from "react";

export const useOfflineInfoScript = ({
  onStatusChange,
}: {
  onStatusChange?: (last: boolean, next: boolean) => void;
}) => {
  const [offline, setOffline] = useState<boolean>(() => {
    // init check network status
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      return !navigator.onLine;
    }
    return false;
  });

  // use ref to store the latest callback
  const onStatusChangeRef = useRef(onStatusChange);

  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  useEffect(() => {
    // define handle function inside useEffect to avoid stale closure
    const handleOnline = () => {
      setOffline((prev) => {
        onStatusChangeRef.current?.(prev, false);
        return false;
      });
    };

    const handleOffline = () => {
      setOffline((prev) => {
        onStatusChangeRef.current?.(prev, true);
        return true;
      });
    };

    // add event listener
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // clean function
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []); // empty dependencies since we use ref

  return useMemo(() => {
    return { offline };
  }, [offline]);
};

export type OfflineInfoState = ReturnType<typeof useOfflineInfoScript>;
