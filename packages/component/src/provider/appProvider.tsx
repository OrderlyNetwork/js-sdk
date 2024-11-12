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
  useChains,
} from "@orderly.network/hooks";
import toast, { useToasterStore } from "react-hot-toast";
import { LocalProvider } from "@/i18n";
import { IContract } from "@orderly.network/core";
import { isTestnet, praseChainIdToNumber } from "@orderly.network/utils";
import { FooterStatusBarProps } from "@/block/systemStatusBar/index";
import {
  PnLDefaultProps,
  ShareConfigProps,
} from "@/block/shared/shareConfigProps";
import { Chains } from "@orderly.network/hooks";
import { DesktopDropMenuItem } from "@/block/accountStatus/desktop/accountStatus.desktop";
import { TopNavbarProps } from "@/page/common/topNavbar";

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

export type ReferralProps = {
  saveRefCode?: boolean;
  onClickReferral?: () => void;
  onBoundRefCode?: (success: boolean, error: any) => void;
  refLink?: string;
  slogan?: string;
};

export type CommonOrderlyAppState = {
  theme?: any;
  brokerName?: string;
  shareOptions: ShareConfigProps;
  /** custom chains  */
  customChains?: Chains<undefined, undefined>;
  onChainChanged?: (chainId: number, isTestnet: boolean) => void;

  topBar?: ReactNode;
  /** compatible with appIcons field */
  topBarProps?: TopNavbarProps;
  appIcons?: AppLogos;
  footerStatusBarProps?: FooterStatusBarProps;

  accountMenuItems?: DesktopDropMenuItem[] | React.ReactNode;
  onClickAccountMenuItem?: (item: DesktopDropMenuItem) => void;

  referral?: ReferralProps;
};

export type OrderlyAppContextState = CommonOrderlyAppState & {
  onWalletConnect: () => Promise<any>;
  onWalletDisconnect: () => Promise<any>;
  onSetChain: (chainId: number) => Promise<any>;
  errors: AppStateErrors;
};

export const OrderlyAppContext = createContext<OrderlyAppContextState>(
  {} as OrderlyAppContextState
);

export type OrderlyAppProviderProps = CommonOrderlyAppState & {
  toastLimitCount?: number;
  contracts?: IContract;
  /**
   * are include testnet chains
   */
  includeTestnet?: boolean;
  referral?: ReferralProps;
};

export const OrderlyAppProvider: FC<
  PropsWithChildren<OrderlyAppProviderProps & ConfigProviderProps>
> = (props) => {
  const {
    appIcons: logos,
    theme,
    configStore,
    keyStore,
    brokerId,
    brokerName,
    networkId,
    includeTestnet,
    contracts,
    toastLimitCount,
    onChainChanged,
    footerStatusBarProps,
    shareOptions,
    chainFilter,
    customChains,
    referral,
    accountMenuItems,
    onClickAccountMenuItem,
    topBar,
    topBarProps,
    walletAdapters,
  } = props;

  return (
    <OrderlyConfigProvider
      // use never to fix type
      configStore={configStore as never}
      keyStore={keyStore}
      walletAdapters={walletAdapters}
      brokerId={brokerId!}
      brokerName={brokerName!}
      networkId={networkId!}
      contracts={contracts}
      chainFilter={chainFilter}
    >
      <InnerProvider
        appIcons={logos}
        theme={theme}
        toastLimitCount={toastLimitCount}
        onChainChanged={onChainChanged}
        brokerName={brokerName}
        footerStatusBarProps={footerStatusBarProps}
        shareOptions={{ ...PnLDefaultProps, ...shareOptions }}
        customChains={customChains}
        accountMenuItems={accountMenuItems}
        onClickAccountMenuItem={onClickAccountMenuItem}
        topBar={topBar}
        topBarProps={topBarProps}
        referral={referral}
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
    onChainChanged,
    footerStatusBarProps,
    shareOptions,
    customChains,
    accountMenuItems,
    onClickAccountMenuItem,
    topBar,
    topBarProps,
    referral,
  } = props;

  const { toasts } = useToasterStore();

  const {
    connect,
    disconnect,
    wallet: currentWallet,
    setChain,
  } = useWalletConnector();

  const account = useAccountInstance();

  const { networkId } = useContext<any>(OrderlyContext);

  const [orderlyChains] = useChains();

  const chains = useMemo(() => {
    const _chains = customChains || orderlyChains;

    if (!_chains) {
      return [];
    }

    return [..._chains?.mainnet, ..._chains.testnet];
  }, [customChains, orderlyChains]);

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

      // check whether chain id and network id match
      // const chainIdNum = parseInt(chainId, 16);
      if (
        (networkId === "mainnet" && isTestnet(chainId)) ||
        (networkId === "testnet" && !isTestnet(chainId))
      ) {
        return false;
      }

      const isSupport = chains.some((item) => {
        const _chainId = item.network_infos?.chain_id;
        if (typeof _chainId === "string") {
          // return `0x${Number(_chainId).toString(16)}` === chainId;
          return parseInt(_chainId, 16) === chainId;
        }
        return _chainId === chainId;
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

        const chainId = praseChainIdToNumber(wallet.chains[0].id);

        if (!checkChainId(chainId)) {
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
            namespace: wallet.chains[0].namespace,
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
        return;
      }

      if (!checkChainId(currentChainId)) {
        // @ts-ignore
        setErrors((errors) => ({ ...errors, ChainNetworkNotSupport: true }));

        console.warn("current chain not support!!!!");
        // return;
      } else {
        setErrors((errors: any) => ({
          ...errors,
          ChainNetworkNotSupport: false,
        }));
      }

      if (currentAddress !== account.address) {
        account.setAddress(currentWallet.accounts[0].address, {
          provider: currentWallet.provider,
          chain: {
            id: currentChainId,
            namespace: currentWallet.chains[0].namespace,
            // name: currentWallet.chains[0].name,
          },
          wallet: {
            name: currentWallet.label,
          },
          // label: currentWallet.label,
        });
      } else if (currentChainId !== account.chainId) {
        account.switchChainId(currentChainId);
      }
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

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const refCode = searchParams.get("ref");
    if (refCode) {
      localStorage.setItem("referral_code", refCode);
    }
  }, []);

  return (
    <OrderlyAppContext.Provider
      value={{
        appIcons: logos,
        theme,
        errors,
        onWalletConnect: _onWalletConnect,
        onWalletDisconnect: _onWalletDisconnect,
        onSetChain: _onSetChain,
        onChainChanged,
        brokerName,
        footerStatusBarProps,
        shareOptions,
        customChains: props.customChains,
        accountMenuItems,
        onClickAccountMenuItem,
        topBar,
        topBarProps,
        referral,
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
