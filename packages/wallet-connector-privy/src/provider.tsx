import React, { type PropsWithChildren, useEffect, useRef, useState, createContext, useContext, type RefObject } from "react";
import { Main } from "./main";
import { InitSolana } from "./initSolana";
import { InitWagmi } from "./initWagmi";
import { InitPrivy } from "./initPrivy";
import { merge } from "lodash";
import { type Chain, defineChain } from "viem";
import { ModalProvider, TooltipProvider } from "@orderly.network/ui";
import { mainnet } from "viem/chains";

const fetchChainInfo = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch data from ${url}`);
  }
  return response.json();
};

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
  initRef: RefObject<boolean>;
  fetchAllChains: () => Promise<void>;
}

const walletConnectorPrivyContext = createContext<WalletConnectorPrivyContextType>({
  initChains: [mainnet],
  initRef: null!,
  fetchAllChains: async () => {},
});

export const useWalletConnectorPrivy = () => useContext(walletConnectorPrivyContext);

export function WalletConnectorPrivyProvider(props: PropsWithChildren) {
  const [initChains, setInitChains] = useState<[Chain, ...Chain[]]>([mainnet]);
  const initRef = useRef(false);

  const fetchAllChains = async () => {
    try {
      const [testChainInfo, mainnetChainInfo] = await Promise.all([
        fetchChainInfo("https://testnet-api-evm.orderly.org/v1/public/chain_info"),
        fetchChainInfo("https://api-evm.orderly.org/v1/public/chain_info"),
      ]);

      const testChains = processChainInfo(testChainInfo);
      const mainnetChains = processChainInfo(mainnetChainInfo);

      setInitChains(testChains.concat(mainnetChains) as [Chain, ...Chain[]]);
      initRef.current = true;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
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
        initRef,
        fetchAllChains,
      }}
    >
      <TooltipProvider delayDuration={300}>
        <ModalProvider>
          <InitPrivy initChains={initChains}>
            <InitWagmi initChains={initChains}>
              <InitSolana>
                <Main>{props.children}</Main>
              </InitSolana>
            </InitWagmi>
          </InitPrivy>
        </ModalProvider>
      </TooltipProvider>
    </walletConnectorPrivyContext.Provider>
  );
}
