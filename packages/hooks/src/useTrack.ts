import { useCallback, useEffect } from "react";
import { EnumTrackerKeys, TrackerListenerKeyMap } from "@orderly.network/types";
import { debounce } from "lodash";
import { useEventEmitter } from "./useEventEmitter";

export const useTrack = () => {
  const ee = useEventEmitter();

  const debouncedTrackFn = useCallback(
    debounce((eventName: keyof typeof TrackerListenerKeyMap, params: any,) => {
      ee.emit(eventName, params);
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
