import React, { type PropsWithChildren, useEffect, useRef, useState, createContext, useContext, type RefObject } from "react";
import { Main } from "./main";
import { InitSolana } from "./initSolana";
import { InitWagmi } from "./initWagmi";
import { InitPrivy } from "./initPrivy";
import { type Chain, defineChain } from "viem";
import { TooltipProvider } from "@orderly.network/ui";
import { mainnet } from "viem/chains";
import { ChainNamespace } from "@orderly.network/types";
import { injectUsercenter } from "./injectUsercenter";
const fetchChainInfo = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch data from ${url}`);
  }
  return response.json();

};
// TODO: can't inject, don't know why
injectUsercenter();

const processChainInfo = (chainInfo: any) =>
  chainInfo?.data?.rows?.map((row: any) =>
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
  initChains: [Chain, ...Chain[]];
  mainnetChains: Chain[];
  testnetChains: Chain[];
  getChainsByNetwork: (network: 'mainnet' | 'testnet') => Chain[];
  openConnectDrawer: boolean;
  setOpenConnectDrawer: (open: boolean) => void;
  targetNamespace: ChainNamespace | undefined;
  setTargetNamespace: (namespace: ChainNamespace | undefined) => void;
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
});

export const useWalletConnectorPrivy = () => useContext(walletConnectorPrivyContext);

export function WalletConnectorPrivyProvider(props: PropsWithChildren) {
  const [initChains, setInitChains] = useState<[Chain, ...Chain[]]>([mainnet]);
  const [mainnetChains, setMainnetChains] = useState<Chain[]>([]);
  const [testnetChains, setTestnetChains] = useState<Chain[]>([]);
  const initRef = useRef(false);
  const [openConnectDrawer, setOpenConnectDrawer] = useState(false);
  const [targetNamespace, setTargetNamespace] = useState<ChainNamespace | undefined>();

  const fetchAllChains = async () => {
    try {
      const [testChainInfo, mainnetChainInfo] = await Promise.all([
        fetchChainInfo("https://testnet-api-evm.orderly.org/v1/public/chain_info"),
        fetchChainInfo("https://api-evm.orderly.org/v1/public/chain_info"),
      ]);

      const testChains = processChainInfo(testChainInfo);
      const mainnetChains = processChainInfo(mainnetChainInfo);

      setTestnetChains(testChains);
      setMainnetChains(mainnetChains);
      setInitChains([...testChains, ...mainnetChains] as [Chain, ...Chain[]]);
      initRef.current = true;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getChainsByNetwork = (network: 'mainnet' | 'testnet'): Chain[] => {
    return network === 'mainnet' ? mainnetChains : testnetChains;
  };

  useEffect(() => {
    fetchAllChains();
  }, []);

  if (!initRef) {
    return null;
  }

  return (
    <walletConnectorPrivyContext.Provider
      value={{
        initChains,
        mainnetChains,
        testnetChains,
        getChainsByNetwork,
        openConnectDrawer,
        setOpenConnectDrawer,
        targetNamespace,
        setTargetNamespace,
      }}
    >
      <TooltipProvider delayDuration={300}>

        <InitPrivy initChains={initChains}>
          <InitWagmi initChains={initChains}>
            <InitSolana>
              <Main>{props.children}</Main>
            </InitSolana>
          </InitWagmi>
        </InitPrivy>
      </TooltipProvider>
    </walletConnectorPrivyContext.Provider>
  );
}
