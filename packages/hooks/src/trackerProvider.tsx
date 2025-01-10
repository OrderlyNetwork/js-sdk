import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useCallback,
  useRef,
} from "react";
import * as amplitude from "@amplitude/analytics-browser";
import {
  useEventEmitter,
  useGetEnv,
  useConfig,
  ENVType,
  useAccount,
  useNetworkInfo,
} from "./";
import {
  EnumTrackerKeys,
  TrackerListenerKeyMap,
  NetworkId,
} from "@orderly.network/types";

const apiKeyMap = {
  dev: "4d6b7db0fdd6e9de2b6a270414fd51e0",
  qa: "96476b00bc2701360f9b480629ae5263",
  staging: "dffc00e003479b86d410c448e00f2304",
  prod: "3ab9ae56ed16cc57bc2ac97ffc1098c2",
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
  const walletConnectRef = useRef(false);
  const { account, state } = useAccount();
  const networkId = useConfig("networkId") as NetworkId;
  const brokerId = useConfig("brokerId");
  const getChainInfo = useNetworkInfo(networkId);
  console.log("env:", env);

  const handleEvent = useCallback(
    (
      key: keyof typeof TrackerListenerKeyMap,
      params: {
        address?: string;
        connectWallet: {
          chainId: number;
          name: string;
        };
      }
    ) => {
      account?.accountId && amplitude.setUserId(account?.accountId);

      if (key === EnumTrackerKeys.WALLET_CONNECT) {
        if (walletConnectRef.current) return;
        const info = getChainInfo(
          params?.connectWallet?.chainId as number
        ).info;
        const { address = "", connectWallet } = params;
        const identify: { [key: string]: string | undefined } = {
          address,
          broker_id: brokerId,
          sdk_version:
            window?.__ORDERLY_VERSION__?.["@orderly.network/net"] ?? "",
        };
        const identifyEvent = new amplitude.Identify();
        Object.keys(identify).map((subKey) => {
          identifyEvent.set(subKey, identify[subKey] as string);
        });
        amplitude.identify(identifyEvent);
        const eventProperties = {
          wallet: connectWallet?.name,
          network: info?.network_infos?.name,
        };
        amplitude.track(TrackerListenerKeyMap[key], eventProperties);
        walletConnectRef.current = true;
        return;
      }

      if (key === EnumTrackerKeys.SIGNIN_SUCCESS) {
        const info = getChainInfo(
          params?.connectWallet?.chainId as number
        ).info;

        amplitude.track(TrackerListenerKeyMap[key], {
          wallet: params?.connectWallet?.name,
          network: info?.network_infos?.name,
        });
        return;
      }
      amplitude.track(TrackerListenerKeyMap[key], params);
    },
    [account?.accountId, brokerId, state?.connectWallet?.name]
  );

  useEffect(() => {
    amplitude.init(apiKeyMap[env], { serverZone: "EU" });
    listenKeys.forEach((key) => {
      ee.on(key, (params = {}) => {
        setTimeout(() => {
          handleEvent(key as keyof typeof TrackerListenerKeyMap, params);
        }, 2000);
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
