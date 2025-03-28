import React, { type PropsWithChildren, useEffect, useRef, useState, createContext, useContext, type RefObject, useMemo } from "react";
import { Main } from "./main";
import { type Chain, defineChain } from "viem";
import { TooltipProvider } from "@orderly.network/ui";
import { mainnet } from "viem/chains";
import { ChainNamespace } from "@orderly.network/types";
import { InitPrivy, InitWagmi, InitSolana, Network, ConnectorType, WalletChainType, WalletChainTypeEnum, ConnectorWalletType } from "./types";
import { InitPrivyProvider } from "./providers/initPrivyProvider";
import { InitSolanaProvider } from "./providers/initSolanaProvider";
import { InitWagmiProvider } from "./providers/initWagmiProvider";
import { PrivyWalletProvider } from "./providers/privyWalletProvider";
import { WagmiWalletProvider } from "./providers/wagmiWalletProvider";
import { SolanaWalletProvider } from "./providers/solanaWalletProvider";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { Chains } from "@orderly.network/hooks";


const fetchChainInfo = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch data from ${url}`);
  }
  return response.json();

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
    })
  ) || [];

interface WalletConnectorPrivyContextType {
  initChains: Chain[];
  mainnetChains: Chain[];
  testnetChains: Chain[];
  getChainsByNetwork: (network: 'mainnet' | 'testnet') => Chain[];
  openConnectDrawer: boolean;
  setOpenConnectDrawer: (open: boolean) => void;
  targetNamespace: ChainNamespace | undefined;
  setTargetNamespace: (namespace: ChainNamespace | undefined) => void;
  network: Network;
  setNetwork: (network: Network) => void;
  solanaInfo: {
    rpcUrl: string | null;
    network: WalletAdapterNetwork | null;
  } | null;
  setSolanaInfo: (solanaInfo: {
    rpcUrl: string | null;
    network: WalletAdapterNetwork | null;
  } | null) => void;
  termsOfUse: string;
  walletChainType: WalletChainType;
  connectorWalletType: ConnectorWalletType;
}

const walletConnectorPrivyContext = createContext<WalletConnectorPrivyContextType>({
  initChains: [mainnet],
  mainnetChains: [],
  testnetChains: [],
  getChainsByNetwork: () => [],
  openConnectDrawer: false,
  setOpenConnectDrawer: () => { },
  targetNamespace: undefined,
  setTargetNamespace: () => { },
  network: Network.mainnet,
  setNetwork: () => { },
  solanaInfo: null,
  setSolanaInfo: () => { },
  termsOfUse: "",
  walletChainType: WalletChainTypeEnum.EVM_SOL,
  connectorWalletType: {
    disableWagmi: false,
    disablePrivy: false,
    disableSolana: false,
  }
});

export const useWalletConnectorPrivy = () => useContext(walletConnectorPrivyContext);



interface WalletConnectorPrivyProps extends PropsWithChildren {
  privyConfig?: InitPrivy;
  wagmiConfig?: InitWagmi;
  solanaConfig?: InitSolana;
  network: Network;
  customChains?: Chains;
  termsOfUse: string;
  walletChainType?: WalletChainType;
}
export function WalletConnectorPrivyProvider(props: WalletConnectorPrivyProps) {
  const [walletChainType] = useState<WalletChainType>(props.walletChainType ?? WalletChainTypeEnum.EVM_SOL)
  const [termsOfUse] = useState<string>(props.termsOfUse);
  const [network, setNetwork] = useState<Network>(props.network);
  const [initChains, setInitChains] = useState<Chain[]>([]);
  const [mainnetChains, setMainnetChains] = useState<Chain[]>([]);
  const [testnetChains, setTestnetChains] = useState<Chain[]>([]);
  const initRef = useRef(false);
  const [openConnectDrawer, setOpenConnectDrawer] = useState(false);
  const [targetNamespace, setTargetNamespace] = useState<ChainNamespace | undefined>();
  const [solanaInfo, setSolanaInfo] = useState<{
    rpcUrl: string | null;
    network: WalletAdapterNetwork | null;
  } | null>(null);

  const connectorWalletType = useMemo(() => {
    let type: ConnectorWalletType = {
      disableWagmi: false,
      disablePrivy: false,
      disableSolana: false,
    }
    if (!props.privyConfig) {
      type.disablePrivy = true;
    }
    if (!props.wagmiConfig) {
      type.disableWagmi = true;
    }
    if (!props.solanaConfig) {
      type.disableSolana = true;
    }
    return type;
  }, [props.privyConfig, props.wagmiConfig, props.solanaConfig]);

  const fetchAllChains = async () => {
    try {
      const [testChainInfo, mainnetChainInfo] = await Promise.all([
        fetchChainInfo("https://testnet-api-evm.orderly.org/v1/public/chain_info"),
        fetchChainInfo("https://api-evm.orderly.org/v1/public/chain_info"),
      ]);

      const testChains = processChainInfo(testChainInfo.data.rows);
      const mainnetChains = processChainInfo(mainnetChainInfo.data.rows);

      setTestnetChains(testChains);
      setMainnetChains(mainnetChains);
      setInitChains([...testChains, ...mainnetChains] as [Chain, ...Chain[]]);
      initRef.current = true;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleCustomerChains = () => {

    const testChains = processChainInfo(props.customChains!.testnet?.map(item => item.network_infos));
    const mainnetChains = processChainInfo(props.customChains!.mainnet?.map(item => item.network_infos));
    setTestnetChains(testChains);
    setMainnetChains(mainnetChains);
    setInitChains([...testChains, ...mainnetChains] as [Chain, ...Chain[]]);
    initRef.current = true;

  }

  const getChainsByNetwork = (network: 'mainnet' | 'testnet'): Chain[] => {
    return network === 'mainnet' ? mainnetChains : testnetChains;
  };

  const value = useMemo(() => ({
    initChains,
    mainnetChains,
    testnetChains,
    getChainsByNetwork,
    openConnectDrawer,
    setOpenConnectDrawer,
    targetNamespace,
    setTargetNamespace,
    network,
    setNetwork,
    solanaInfo,
    setSolanaInfo,
    termsOfUse,
    walletChainType,
    connectorWalletType,
  }), [initChains, mainnetChains, testnetChains, getChainsByNetwork, openConnectDrawer, setOpenConnectDrawer, targetNamespace, setTargetNamespace, network, setNetwork, solanaInfo, setSolanaInfo, termsOfUse, walletChainType, connectorWalletType]);


  useEffect(() => {
    if (!props.customChains) {
      fetchAllChains();
      return;

    }
    handleCustomerChains();
  }, [props.customChains]);

  if (!initRef.current) {
    return null;
  }


  return (
    <walletConnectorPrivyContext.Provider
      value={value}
    >
      <TooltipProvider delayDuration={300}>

        <InitPrivyProvider privyConfig={props.privyConfig} initChains={initChains}>
          <InitWagmiProvider wagmiConfig={props.wagmiConfig ?? {}} initChains={initChains}>
            <InitSolanaProvider {...props.solanaConfig ?? { wallets: [], onError: () => { } }}>
              <PrivyWalletProvider>
                <WagmiWalletProvider>
                  <SolanaWalletProvider>
                    <Main>{props.children}</Main>
                  </SolanaWalletProvider>
                </WagmiWalletProvider>
              </PrivyWalletProvider>
            </InitSolanaProvider>
          </InitWagmiProvider>
        </InitPrivyProvider>
      </TooltipProvider>
    </walletConnectorPrivyContext.Provider>
  );
}
