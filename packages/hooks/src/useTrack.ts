import { useCallback } from "react";
import { debounce } from "lodash";
import { TrackerEventName } from "@orderly.network/types";
import { windowGuard } from "@orderly.network/utils";
import { useEventEmitter } from "./useEventEmitter";
import { useWalletConnector } from "./walletConnectorContext";

export const useTrack = () => {
  const ee = useEventEmitter();
  const { wallet } = useWalletConnector();

  const debouncedTrackFn = useCallback(
    debounce((eventName: TrackerEventName, params: any) => {
      windowGuard(() => {
        const location = window.location;
        const origin = location.origin;
        const url = location.pathname;
        const title = document.title;
        const userAgent = window.navigator.userAgent;

        Object.assign(params, {
          page_title: title,
          page_url: url,
          page_domain: origin,
          user_agent: userAgent,
        });
        if (eventName === TrackerEventName.placeOrderSuccess) {
          Object.assign(params, {
            wallet: wallet?.label || "QR code",
          });
        }
        ee.emit(eventName, params);
      });
    }, 500),
    [],
  );

  const track = useCallback(
    (eventName: TrackerEventName, params: any) => {
      debouncedTrackFn(eventName, params);
    },
    [debouncedTrackFn],
  );

  const setTrackUserId = useCallback((userId: string) => {
    ee.emit(TrackerEventName.trackIdentifyUserId, userId);
  }, []);

  return { track, setTrackUserId };
};
