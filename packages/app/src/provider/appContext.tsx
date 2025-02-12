import {
  FC,
  createContext,
  PropsWithChildren,
  useContext,
  useState,
} from "react";
import { useWalletStateHandle } from "../hooks/useWalletStateHandle";
import { useAppState } from "../hooks/useAppState";
import { useWalletEvent } from "../hooks/useWalletEvent";
import { useSettleEvent } from "../hooks/useSettleEvent";
import { useWalletConnectError } from "../hooks/useWalletConnectError";
import {
  useRestrictedAreas,
  RestrictedAreasReturns,
  IRestrictedAreasParams,
  Chains,
} from "@orderly.network/hooks";
import { useLinkDevice } from "../hooks/useLinkDevice";
import { Chain, NetworkId } from "@orderly.network/types";

type ReturnChain = Pick<Chain, "id"> & Partial<Omit<Chain, "id">>;

type DefaultChain =
  | {
      mainnet?: ReturnChain;
      testnet?: ReturnChain;
    }
  | ((networkId: NetworkId, chains: Chains) => ReturnChain)
  | undefined;

type AppContextState = {
  connectWallet: ReturnType<typeof useWalletStateHandle>["connectWallet"];
  /**
   * Whether the current network is not supported
   */
  wrongNetwork: boolean;
  currentChainId: number | undefined;
  setCurrentChainId: (chainId: number | undefined) => void;
  onChainChanged?: (
    chainId: number,
    state: { isTestnet: boolean; isWalletConnected: boolean }
  ) => void;
  defaultChain?: DefaultChain;
  // networkStatus: ReturnType<typeof useAppState>["networkStatus"];
  restrictedInfo?: RestrictedAreasReturns;
};

const AppContext = createContext<AppContextState>({} as AppContextState);

export const useAppContext = () => {
  return useContext(AppContext);
};

export type AppStateProviderProps = {
  restrictedInfo?: IRestrictedAreasParams;
} & Pick<AppContextState, "onChainChanged" | "defaultChain">;

export const AppStateProvider: FC<PropsWithChildren<AppStateProviderProps>> = (
  props
) => {
  const [currentChainId, setCurrentChainId] = useState<number | undefined>();
  useLinkDevice();

  const { connectWallet, wrongNetwork } = useWalletStateHandle({
    // onChainChanged: props.onChainChanged,
    currentChainId,
  });

  useWalletEvent();
  useSettleEvent();
  useWalletConnectError();
  const restrictedInfo = useRestrictedAreas(props?.restrictedInfo ?? {});

  // const { networkStatus } = useAppState();

  return (
    <AppContext.Provider
      value={{
        connectWallet,
        wrongNetwork,
        currentChainId,
        setCurrentChainId,
        onChainChanged: props.onChainChanged,
        defaultChain: props.defaultChain,
        restrictedInfo,
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
};
