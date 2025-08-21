import React, {
  type PropsWithChildren,
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
  type RefObject,
  useMemo,
} from "react";
import { PrivyClientConfig } from "@privy-io/react-auth";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { type Chain, defineChain } from "viem";
import { mainnet } from "viem/chains";
import { Chains, fetcher, useSWR } from "@orderly.network/hooks";
import {
  AbstractChains,
  AbstractTestnetChainInfo,
  ArbitrumSepoliaChainInfo,
  ArbitrumSepoliaTokenInfo,
  ChainNamespace,
  SolanaChains,
  SolanaDevnetChainInfo,
  SolanaDevnetTokenInfo,
  TesntTokenFallback,
} from "@orderly.network/types";
import { TooltipProvider } from "@orderly.network/ui";
import { Main } from "./main";
import { AbstractWallet } from "./providers/abstractWallet";
import { PrivyWallet } from "./providers/privy";
import { SolanaWallet } from "./providers/solana";
import { WagmiWallet } from "./providers/wagmi";
import {
  InitPrivy,
  InitWagmi,
  InitSolana,
  Network,
  WalletChainType,
  WalletChainTypeEnum,
  ConnectorWalletType,
  InitAbstract,
  WalletChainTypeConfig,
  WalletType,
} from "./types";

const commonSwrOpts = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  // If false, undefined data gets cached against the key.
  revalidateOnMount: true,
  // don't duplicate a request with the same key for 1hr
  dedupingInterval: 3_600_000,
};
const testnetTokenFallback = TesntTokenFallback([
  ArbitrumSepoliaTokenInfo,
  SolanaDevnetTokenInfo,
]);

const testnetChainFallback = [ArbitrumSepoliaChainInfo, SolanaDevnetChainInfo];

const fetchChainInfo = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch data from ${url}`);
  }
  return response.json();
};

// const fetcher = (url: string) => fetch(url).then((res) => res.json());

const formatSwapChainInfo = (data: any = {}) => {
  return Object.keys(data).map((key) => {
    const chain = data[key];
    const { network_infos, token_infos } = chain;

    const nativeToken = token_infos.find(
      (item: any) => item.symbol === network_infos.currency_symbol,
    );

    if (nativeToken) {
      network_infos.currency_decimal = nativeToken.decimals;
    } else {
      // default 18 decimals
      network_infos.currency_decimal = 18;
    }

    return network_infos;
  });
};

const processChainInfo = (chainInfo: any) =>
  chainInfo.map((row: any) =>
    defineChain({
      id: Number(row.chain_id),
      name: row.name,
      nativeCurrency: {
        decimals: row.currency_decimal,
        name: "Ether",
        symbol: row.currency_symbol,
      },
      rpcUrls: {
        default: {
          http: [row.public_rpc_url],
        },
      },
      blockExplorers: {
        default: { name: "Explorer", url: row.explorer_base_url },
      },
    }),
  ) || [];

interface WalletConnectorPrivyContextType {
  initChains: Chain[];
  mainnetChains: Chain[];
  testnetChains: Chain[];
  getChainsByNetwork: (network: "mainnet" | "testnet") => Chain[];
  openConnectDrawer: boolean;
  setOpenConnectDrawer: (open: boolean) => void;
  targetWalletType: WalletType | undefined;
  setTargetWalletType: (walletType: WalletType | undefined) => void;
  network: Network;
  setNetwork: (network: Network) => void;
  solanaInfo: {
    rpcUrl: string | null;
    network: WalletAdapterNetwork | null;
  } | null;
  setSolanaInfo: (
    solanaInfo: {
      rpcUrl: string | null;
      network: WalletAdapterNetwork | null;
    } | null,
  ) => void;
  termsOfUse: string;
  // TODO deprecated
  walletChainType: WalletChainType;
  // TODO new chaintype config
  walletChainTypeConfig: WalletChainTypeConfig;
  connectorWalletType: ConnectorWalletType;
  privyConfig: {
    loginMethods?: PrivyClientConfig["loginMethods"];
  };
}

const WalletConnectorPrivyContext =
  createContext<WalletConnectorPrivyContextType>({
    initChains: [mainnet],
    mainnetChains: [],
    testnetChains: [],
    getChainsByNetwork: () => [],
    openConnectDrawer: false,
    setOpenConnectDrawer: () => {},
    targetWalletType: undefined,
    setTargetWalletType: () => {},
    network: Network.mainnet,
    setNetwork: () => {},
    solanaInfo: null,
    setSolanaInfo: () => {},
    termsOfUse: "",
    walletChainType: WalletChainTypeEnum.EVM_SOL,
    walletChainTypeConfig: {
      hasEvm: true,
      hasSol: true,
      hasAbstract: false,
    },
    connectorWalletType: {
      disableWagmi: false,
      disablePrivy: false,
      disableSolana: false,
      disableAGW: false,
    },
    privyConfig: {
      loginMethods: [],
    },
  });

export const useWalletConnectorPrivy = () =>
  useContext(WalletConnectorPrivyContext);

interface WalletConnectorPrivyProps extends PropsWithChildren {
  privyConfig?: InitPrivy;
  wagmiConfig?: InitWagmi;
  solanaConfig?: InitSolana;
  abstractConfig?: InitAbstract;
  network: Network;
  customChains?: Chains;
  termsOfUse?: string;
  headerProps?: {
    mobile: React.ReactNode;
  };
  enableSwapDeposit?: boolean;
}

const defaultPrivyLoginMethod = [
  "email",
  "google",
  "twitter",
] as PrivyClientConfig["loginMethods"];
export function WalletConnectorPrivyProvider(props: WalletConnectorPrivyProps) {
  const [walletChainType, setWalletChainType] = useState<WalletChainType>(
    WalletChainTypeEnum.EVM_SOL,
  );
  const [termsOfUse] = useState<string>(props.termsOfUse || "");
  const [network, setNetwork] = useState<Network>(props.network);
  const [initChains, setInitChains] = useState<Chain[]>([]);
  const [mainnetChains, setMainnetChains] = useState<Chain[]>([]);
  const [testnetChains, setTestnetChains] = useState<Chain[]>([]);

  const initRef = useRef(false);
  const [openConnectDrawer, setOpenConnectDrawer] = useState(false);
  const [targetWalletType, setTargetWalletType] = useState<
    WalletType | undefined
  >();
  const [privyConfig, setPrivyConfig] = useState<PrivyClientConfig>({
    loginMethods: props.privyConfig
      ? (props.privyConfig?.config?.loginMethods ?? defaultPrivyLoginMethod)
      : defaultPrivyLoginMethod,
  });
  const [solanaInfo, setSolanaInfo] = useState<{
    rpcUrl: string | null;
    network: WalletAdapterNetwork | null;
  } | null>(null);

  const connectorWalletType = useMemo(() => {
    const type: ConnectorWalletType = {
      disableWagmi: false,
      disablePrivy: false,
      disableSolana: false,
      disableAGW: false,
    };
    if (!props.privyConfig) {
      type.disablePrivy = true;
    }
    if (!props.wagmiConfig) {
      type.disableWagmi = true;
    }
    if (!props.solanaConfig) {
      type.disableSolana = true;
    }
    if (!props.abstractConfig) {
      type.disableAGW = true;
    }
    return type;
  }, [props.privyConfig, props.wagmiConfig, props.solanaConfig]);

  const walletChainTypeConfig = useMemo(() => {
    const chainTypeObj: WalletChainTypeConfig = {
      hasEvm: false,
      hasSol: false,
      hasAbstract: false,
    };
    initChains.forEach((chain) => {
      if (SolanaChains.has(chain.id)) {
        chainTypeObj.hasSol = true;
      } else if (AbstractChains.has(chain.id)) {
        chainTypeObj.hasAbstract = true;
      } else {
        chainTypeObj.hasEvm = true;
      }
    });
    return chainTypeObj;
  }, [initChains]);

  const { data: swapChainInfoRes, isLoading: swapLoading } = useSWR(
    !props.customChains && props.enableSwapDeposit
      ? "https://fi-api.woo.org/swap_support"
      : null,
    fetcher,
    commonSwrOpts,
  );

  const { data: mainnetChainInfos } = useSWR(
    !props.customChains ? "https://api.orderly.org/v1/public/chain_info" : null,
    fetcher,
    {
      ...commonSwrOpts,
      fallbackData: testnetTokenFallback,
    },
  );

  const { data: testChainInfos } = useSWR(
    !props.customChains
      ? "https://testnet-api.orderly.org/v1/public/chain_info"
      : null,
    fetcher,
    {
      ...commonSwrOpts,
      fallbackData: testnetChainFallback,
    },
  );

  const handleCustomerChains = () => {
    const testChains = processChainInfo(
      props.customChains!.testnet?.map((item) => item.network_infos),
    );
    const mainnetChains = processChainInfo(
      props.customChains!.mainnet?.map((item) => item.network_infos),
    );
    setTestnetChains(testChains);
    setMainnetChains(mainnetChains);
    setInitChains([...testChains, ...mainnetChains] as [Chain, ...Chain[]]);
    const chainTypeObj: {
      hasEvm: boolean;
      hasSol: boolean;
      hasAbstract: boolean;
    } = {
      hasEvm: false,
      hasSol: false,
      hasAbstract: false,
    };
    [...testChains, ...mainnetChains].forEach((chain) => {
      if (SolanaChains.has(chain.id)) {
        chainTypeObj.hasSol = true;
      } else if (AbstractChains.has(chain.id)) {
        chainTypeObj.hasAbstract = true;
      } else {
        chainTypeObj.hasEvm = true;
      }
    });
    initRef.current = true;
    if (chainTypeObj.hasEvm && chainTypeObj.hasSol) {
      setWalletChainType(WalletChainTypeEnum.EVM_SOL);
    } else if (chainTypeObj.hasEvm) {
      setWalletChainType(WalletChainTypeEnum.onlyEVM);
    } else if (chainTypeObj.hasSol) {
      setWalletChainType(WalletChainTypeEnum.onlySOL);
    }
  };
  if (
    connectorWalletType.disablePrivy &&
    connectorWalletType.disableWagmi &&
    connectorWalletType.disableSolana &&
    connectorWalletType.disableAGW
  ) {
    throw new Error(
      "Privy, Wagmi, Solana, Abstract are all disabled. Please enable at least one of them.",
    );
  }

  const getChainsByNetwork = (network: "mainnet" | "testnet"): Chain[] => {
    return network === "mainnet" ? mainnetChains : testnetChains;
  };

  const value = useMemo(
    () => ({
      initChains,
      mainnetChains,
      testnetChains,
      getChainsByNetwork,
      openConnectDrawer,
      setOpenConnectDrawer,
      targetWalletType,
      setTargetWalletType,
      network,
      setNetwork,
      solanaInfo,
      setSolanaInfo,
      termsOfUse,
      walletChainType,
      connectorWalletType,
      walletChainTypeConfig,
      privyConfig,
    }),
    [
      initChains,
      mainnetChains,
      testnetChains,
      getChainsByNetwork,
      openConnectDrawer,
      setOpenConnectDrawer,
      targetWalletType,
      setTargetWalletType,
      network,
      setNetwork,
      solanaInfo,
      setSolanaInfo,
      termsOfUse,
      walletChainType,
      connectorWalletType,
      walletChainTypeConfig,
      privyConfig,
    ],
  );

  useEffect(() => {
    if (props.customChains) {
      return;
    }

    if (!mainnetChainInfos || !testChainInfos || swapLoading) {
      return;
    }

    let testChainsList = [];
    let mainnetChainsList = [];
    try {
      testChainsList = testChainInfos;
      // TODO only for test, need remove this code
      testChainsList.push(AbstractTestnetChainInfo);

      mainnetChainsList = mainnetChainInfos;

      const testChains = processChainInfo(testChainsList);
      const mainnetChains = processChainInfo(mainnetChainsList);

      const swapChains = processChainInfo(
        formatSwapChainInfo(swapChainInfoRes?.data || {}),
      );

      const chains = [...testChains, ...mainnetChains];

      const filterSwapChains = swapChains.filter(
        (item: any) => !chains.some((chain) => chain.id === item.id),
      );

      setTestnetChains(testChains);
      setMainnetChains(mainnetChains);

      setInitChains([...chains, ...filterSwapChains] as [Chain, ...Chain[]]);
    } catch (error) {
      console.error("Error initChains:", error);
      testChainsList = [ArbitrumSepoliaChainInfo, SolanaDevnetChainInfo];
      mainnetChainsList = [];
    }

    initRef.current = true;
  }, [
    props.customChains,
    mainnetChainInfos,
    testChainInfos,
    swapChainInfoRes,
    swapLoading,
  ]);

  useEffect(() => {
    if (props.customChains) {
      handleCustomerChains();
    }
  }, [props.customChains]);

  if (!initRef.current) {
    return null;
  }

  return (
    <WalletConnectorPrivyContext.Provider value={value}>
      <TooltipProvider delayDuration={300}>
        <PrivyWallet privyConfig={props.privyConfig} initChains={initChains}>
          <WagmiWallet wagmiConfig={props.wagmiConfig} initChains={initChains}>
            <SolanaWallet solanaConfig={props.solanaConfig}>
              <AbstractWallet>
                <Main headerProps={props.headerProps}>{props.children}</Main>
              </AbstractWallet>
            </SolanaWallet>
          </WagmiWallet>
        </PrivyWallet>
      </TooltipProvider>
    </WalletConnectorPrivyContext.Provider>
  );
}
