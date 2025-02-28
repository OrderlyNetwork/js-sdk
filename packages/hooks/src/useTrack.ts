import { useCallback, useEffect } from "react";
import { amplitudeTracker } from "./services/amplitudeTracker";
import { ENVType, useGetEnv } from "./trading-rewards/useGetEnv";
import { TrackerListenerKeyMap } from "@orderly.network/types";
import { useEventEmitter } from "./useEventEmitter";
import {debounce} from "lodash";

export const useTrack = () => {
  const ee = useEventEmitter();
  
  const debouncedTrackFn = useCallback(
    debounce((eventName: keyof typeof TrackerListenerKeyMap, params: any, extraParams?: {
      identifyParams?: {
        address?: string
        brokerId?: string
      }
    }) => {
      console.log("track", {
        eventName,
        params,
        extraParams
      });
      if (extraParams?.identifyParams) {
        const { address, brokerId } = extraParams.identifyParams;
        const identifyData = {
          address,
          broker_id: brokerId,
          sdk_version: window?.__ORDERLY_VERSION__?.["@orderly.network/net"] ?? "",
        };
        amplitudeTracker.setSdkInfo(identifyData);
      }
      amplitudeTracker.track(eventName, params);
    }, 500),
    []
  );

  const track = useCallback((eventName: keyof typeof TrackerListenerKeyMap, params: any, extraParams?: any) => {
    debouncedTrackFn(eventName, params, extraParams);
  }, [debouncedTrackFn]);

  const setTrackUserId = useCallback((userId: string) => {
    amplitudeTracker.setUserId(userId);
  }, []);


  useEffect(() => {
  // TODO need get id from env
    amplitudeTracker.init(ENVType.dev);
  }, []);


  useEffect(() => {
    const listenKeys = Object.keys(TrackerListenerKeyMap);
    listenKeys.forEach((key) => {
      ee.on(key, (params = {}) => {
        setTimeout(() => {
          track(key as keyof typeof TrackerListenerKeyMap, params);
        }, 2000);
      });
    });
    return () => {
      listenKeys.forEach((key) => {
        ee.off(key);
      });
    };
  }, []);
  return { track, setTrackUserId };
};
