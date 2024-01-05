import React, {
  FC,
  PropsWithChildren,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";

import { ModalProvider } from "@/modal/modalContext";
import { Toaster } from "@/toast/Toaster";

import { TooltipProvider } from "@/tooltip/tooltip";
import {
  useWalletConnector,
  useSessionStorage,
  OrderlyConfigProvider,
  ConfigProviderProps,
  useAccountInstance,
  OrderlyContext,
} from "@orderly.network/hooks";
import toast, { useToasterStore } from "react-hot-toast";
import { LocalProvider } from "@/i18n";
import { IContract } from "@orderly.network/core";
import { praseChainIdToNumber } from "@orderly.network/utils";

export type AppStateErrors = {
  ChainNetworkNotSupport: boolean;
  IpNotSupport: boolean;
  NetworkError: boolean;
};

type Logo = {
  // the logo image url
  img?: string;
  // also can use react component
  component?: ReactNode;
  className?: string;
};

export type AppLogos = Partial<{
  // logo for top navigation bar
  main: Logo;
  // logo for popover/dialog header
  secondary: Logo;
}>;

export type OrderlyAppContextState = {
  appIcons?: AppLogos;
  theme: any;
  onWalletConnect: () => Promise<any>;
  onWalletDisconnect: () => Promise<any>;
  onSetChain: (chainId: number) => Promise<any>;

  errors: AppStateErrors;
  enableSwapDeposit?: boolean;
  //   errors?: AppStateErrors;
  onChainChanged?: (chainId: number, isTestnet: boolean) => void;
  brokerName?: string;
};

export const OrderlyAppContext = createContext<OrderlyAppContextState>(
  {} as OrderlyAppContextState
);

export interface OrderlyAppProviderProps {
  appIcons?: AppLogos;
  theme?: any;
  toastLimitCount?: number;
  contracts?: IContract;
  /**
   * are include testnet chains
   */
  includeTestnet?: boolean;
  enableSwapDeposit?: boolean;
  onChainChanged?: (chainId: number, isTestnet: boolean) => void;
  brokerName?: string;
}

export const OrderlyAppProvider: FC<
  PropsWithChildren<OrderlyAppProviderProps & ConfigProviderProps>
> = (props) => {
  const {
    appIcons: logos,
    theme,
    configStore,
    keyStore,
    getWalletAdapter,
    brokerId,
    brokerName,
    networkId,
    includeTestnet,
    contracts,
    toastLimitCount,
    enableSwapDeposit,
    onChainChanged,
  } = props;

  return (
    <OrderlyConfigProvider
      configStore={configStore}
      keyStore={keyStore}
      getWalletAdapter={getWalletAdapter}
      brokerId={brokerId}
      networkId={networkId}
      enableSwapDeposit={enableSwapDeposit}
      contracts={contracts}
    >
      <InnerProvider
        appIcons={logos}
        theme={theme}
        toastLimitCount={toastLimitCount}
        enableSwapDeposit={enableSwapDeposit}
        onChainChanged={onChainChanged}
        brokerName={brokerName}
      >
        {props.children}
      </InnerProvider>
    </OrderlyConfigProvider>
  );
};

const InnerProvider = (props: PropsWithChildren<OrderlyAppProviderProps>) => {
  const {
    theme,
    appIcons: logos,
    brokerName,
    toastLimitCount = 1,
    enableSwapDeposit,
    onChainChanged,
  } = props;

  const { toasts } = useToasterStore();

  const {
    connect,
    disconnect,
    wallet: currentWallet,
    setChain,
    chains,
  } = useWalletConnector();

  const account = useAccountInstance();

  // const [testChains] = useChains(networkId, { wooSwapEnabled: false });

  //

  const { networkId } = useContext<any>(OrderlyContext);

  const [errors, setErrors] = useSessionStorage<AppStateErrors>("APP_ERRORS", {
    ChainNetworkNotSupport: false,
    IpNotSupport: false,
    NetworkError: false,
  });

  const checkChainId = useCallback(
    (chainId: number): boolean => {
      if (!chainId || !chains) {
        return false;
      }

      // if (typeof chainId === "number") {
      //   chainId = `0x${Number(chainId).toString(16)}`;
      // }

      //

      // check whether chain id and network id match
      // const chainIdNum = parseInt(chainId, 16);
      if (
        (networkId === "mainnet" && chainId === 421613) ||
        (networkId === "testnet" && chainId !== 421613)
      ) {
        return false;
      }

      const isSupport = chains.some((item: { id: string | number }) => {
        if (typeof item.id === "string") {
          // return `0x${Number(item.id).toString(16)}` === chainId;
          return parseInt(item.id, 16) === chainId;
        }
        return item.id === chainId;
      });

      return isSupport;
    },
    [chains, networkId]
  );

  const _onWalletConnect = useCallback(async (): Promise<any> => {
    if (connect) {
      const walletState = await connect();

      if (
        Array.isArray(walletState) &&
        walletState.length > 0 &&
        walletState[0] &&
        walletState[0].accounts.length > 0
      ) {
        const wallet = walletState[0];

        ////// check chainid ///////

        if (!checkChainId(wallet.chains[0].id)) {
          return false;
        }

        //
        if (!account) {
          throw new Error("account is not initialized");
        }
        console.info("🤝 connect wallet", wallet);
        // account.address = wallet.accounts[0].address;
        const status = await account.setAddress(wallet.accounts[0].address, {
          provider: wallet.provider,
          chain: {
            id: praseChainIdToNumber(wallet.chains[0].id),
          },
          wallet: {
            name: wallet.label,
          },
          // label: ,
        });

        return { wallet, status };
      }
    } else {
      throw new Error("walletProvider is required");
    }
  }, [connect, account, networkId]);

  const _onWalletDisconnect = useCallback(async (): Promise<any> => {
    if (typeof disconnect === "function" && currentWallet) {
      console.log("🤜 disconnect wallet");

      return disconnect(currentWallet).then(() => {
        return account.disconnect();
      });
    }
  }, [disconnect, currentWallet, account]);

  const _onSetChain = useCallback((chainId: number) => {
    return setChain({ chainId }).then((success: boolean) => {
      if (success) {
        // @ts-ignore
        setErrors((errors) => ({ ...errors, ChainNetworkNotSupport: false }));
      }

      return success;
    });
  }, []);

  const currentAddress = useMemo(() => {
    if (!currentWallet) {
      return null;
    }
    return currentWallet.accounts[0].address;
  }, [currentWallet]);

  // current connected chain id
  const currentChainId = useMemo<number | null>(() => {
    if (!currentWallet) {
      return null;
    }
    const id = currentWallet.chains[0].id;

    return praseChainIdToNumber(id);
  }, [currentWallet]);

  useEffect(() => {
    // currentWallet?.provider.detectNetwork().then((x) =>

    if (!chains || chains.length === 0 || !currentChainId) {
      return;
    }

    // console.log("currentWallet", currentWallet, account, currentChainId);

    if (
      !!currentWallet &&
      Array.isArray(currentWallet.accounts) &&
      currentWallet.accounts.length > 0 &&
      account
    ) {
      if (
        account.address === currentAddress &&
        currentChainId === account.chainId
      ) {
        // console.log("currentWallet 22 ", currentAddress, currentChainId);
        return;
      }

      if (!checkChainId(currentChainId)) {
        // console.warn("!!!! not support this chian -> disconnect wallet");

        // account.disconnect();
        // @ts-ignore
        setErrors((errors) => ({ ...errors, ChainNetworkNotSupport: true }));

        console.warn("current chain not support!  -> disconnect wallet!!!");
        return;
      } else {
        setErrors((errors: any) => ({
          ...errors,
          ChainNetworkNotSupport: false,
        }));
      }

      account.setAddress(currentWallet.accounts[0].address, {
        provider: currentWallet.provider,
        chain: {
          id: currentChainId,
          // name: currentWallet.chains[0].name,
        },
        wallet: {
          name: currentWallet.label,
        },
        // label: currentWallet.label,
      });
    }
    // }
    // }, [ready, currentWallet]);
  }, [currentAddress, currentChainId, chains, account, networkId]);

  // limit toast count
  useEffect(() => {
    toasts
      .filter((t) => t.visible) // Only consider visible toasts
      .filter((_, i) => i >= toastLimitCount) // Is toast index over limit
      .forEach((t) => toast.dismiss(t.id)); // Dismiss – Use toast.remove(t.id) removal without animation
  }, [toasts]);

  return (
    <OrderlyAppContext.Provider
      value={{
        appIcons: logos,
        theme,
        errors,
        onWalletConnect: _onWalletConnect,
        onWalletDisconnect: _onWalletDisconnect,
        onSetChain: _onSetChain,
        enableSwapDeposit,
        onChainChanged,
        brokerName,
      }}
    >
      <TooltipProvider>
        <LocalProvider>
          {/* <WSObserver /> */}
          <ModalProvider>{props.children}</ModalProvider>
        </LocalProvider>
      </TooltipProvider>
      <Toaster />
    </OrderlyAppContext.Provider>
  );
};
