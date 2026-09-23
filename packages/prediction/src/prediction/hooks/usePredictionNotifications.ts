import { useCallback, useRef, useState } from "react";
import type { PredictionNotification } from "../prediction.types";

export const usePredictionNotifications = () => {
  const [notification, setNotification] = useState<PredictionNotification>();
  const notificationIdRef = useRef(0);

  // Keep prototype feedback behind one event-like boundary so real execution
  // reports can replace it without changing the order-entry UI.
  const notify = useCallback(
    (message: string, tone: PredictionNotification["tone"] = "success") => {
      notificationIdRef.current += 1;
      setNotification({ id: notificationIdRef.current, message, tone });
    },
    [],
  );

  // The UI toasts a notification once and clears it, so a stale message cannot
  // replay when the prediction page remounts with provider-held state.
  const clearNotification = useCallback(() => setNotification(undefined), []);

  return {
    notification,
    setNotification,
    notify,
    clearNotification,
  };
};
