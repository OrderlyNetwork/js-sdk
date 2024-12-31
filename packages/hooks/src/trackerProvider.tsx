import {
  PropsWithChildren,
  createContext,
  useContext,
  useRef,
  useEffect,
  useCallback,
} from "react";
import * as amplitude from "@amplitude/analytics-browser";

import { useEventEmitter, useGetEnv, useNetworkInfo, ENVType } from "./";
import { EnumTrackerKeys, TrackerListenerKeyMap } from "@orderly.network/types";

const apiKeyMap = {
  dev: "4d6b7db0fdd6e9de2b6a270414fd51e0",
  qa: "96476b00bc2701360f9b480629ae5263",
  staging: "dffc00e003479b86d410c448e00f2304",
  prod: "3ab9ae56ed16cc57bc2ac97ffc1098c2",
};

interface TrackerParams {
  wallet: string;
  network: string;
  account_id: string;
  [key: string]: string;
}

const TrackerListenerHandler = {
  [EnumTrackerKeys["wallet:connected"]]: (
    eventKey: string,
    params: {
      [key: string]: string;
      wallet: string;
      network: string;
    }
  ) => {
    const { wallet, network, account_id } = params;
    const identifyKeys = ["address", "broker_id", "sdk_version"];
    amplitude.setUserId(account_id);
    const identifyEvent = new amplitude.Identify();
    identifyKeys.map((subKey) => {
      identifyEvent.set(subKey, params[subKey]);
    });
    amplitude.identify(identifyEvent);
    const eventProperties = {
      wallet,
      network,
    };
    amplitude.track(eventKey, eventProperties);
  },
};

interface TrackerContextState {
  track: (key: string, params: { [key: string]: string }) => void;
}

export const TrackerContext = createContext<TrackerContextState>({} as any);

export const useTrackerContext = () => useContext(TrackerContext);

export const OrderlyTrackerProvider = ({ children }: PropsWithChildren) => {
  const listenKeys = Object.keys(TrackerListenerKeyMap);
  const ee = useEventEmitter();
  const env = useGetEnv();
  console.log("env:", env);
  useEffect(() => {
    amplitude.init(apiKeyMap[env], { serverZone: "EU" });
    listenKeys.forEach((key) => {
      ee.on(key, (params) => {
        const targetKeyHandler =
          TrackerListenerHandler[key as keyof typeof TrackerListenerHandler];

        const handleEvent = (params: {
          [key: string]: string;
          wallet: string;
          network: string;
        }) =>
          targetKeyHandler
            ? targetKeyHandler(
                TrackerListenerKeyMap[
                  key as keyof typeof TrackerListenerKeyMap
                ],
                params
              )
            : amplitude.track(
                TrackerListenerKeyMap[
                  key as keyof typeof TrackerListenerKeyMap
                ],
                params
              );

        handleEvent(params);
      });
    });
    return () => {
      listenKeys.forEach((key) => {
        ee.off(key);
      });
    };
  }, [env]);

  return (
    <TrackerContext.Provider
      value={{
        track: (key, params) => {
          amplitude.track(key, params);
        },
      }}
    >
      {children}
    </TrackerContext.Provider>
  );
};
