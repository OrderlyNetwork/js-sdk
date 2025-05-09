import { useCallback } from "react";
import { debounce } from "lodash";
import { TrackerEventName } from "@orderly.network/types";
import { windowGuard } from "@orderly.network/utils";
import { useEventEmitter } from "./useEventEmitter";
import { useWalletConnector } from "./walletConnectorContext";

export const useTrack = () => {
  const ee = useEventEmitter();
  const { wallet } = useWalletConnector();

  /** immediately track event */
  const tracking = useCallback(
    (eventName: TrackerEventName, params: any) => {
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
    },
    [wallet],
  );

  /** debounce track event */
  const track = useCallback(debounce(tracking, 500), [tracking]);

  const setTrackUserId = useCallback((userId: string) => {
    ee.emit(TrackerEventName.trackIdentifyUserId, userId);
  }, []);

  const setIdentify = useCallback((params: any) => {
    ee.emit(TrackerEventName.trackIdentify, params);
  }, []);

  return {
    track,
    tracking,
    setTrackUserId,
    setIdentify,
  };
};
