import { useCallback, useEffect } from "react";
import { EnumTrackerKeys, TrackerListenerKeyMap } from "@orderly.network/types";
import { debounce } from "lodash";
import { useEventEmitter } from "./useEventEmitter";
import { windowGuard } from "@orderly.network/utils";

export const useTrack = () => {
  const ee = useEventEmitter();

  const debouncedTrackFn = useCallback(
    debounce((eventName: keyof typeof TrackerListenerKeyMap, params: any,) => {
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
        ee.emit(eventName, params);
      });
    }, 500),
    []
  );

  const track = useCallback((eventName: keyof typeof TrackerListenerKeyMap, params: any) => {
    debouncedTrackFn(eventName, params);
  }, [debouncedTrackFn]);

  const setTrackUserId = useCallback((userId: string) => {
    ee.emit(EnumTrackerKeys.trackIdentifyUserId, userId);
  }, []);

  return { track, setTrackUserId };
};
