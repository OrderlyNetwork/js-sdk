import React, { PropsWithChildren, useEffect, useState } from "react";
import { useSimpleDI } from "@orderly.network/hooks";
import type { InitOptions, OnboardAPI } from "@web3-onboard/core";
import { Optional } from "@orderly.network/types";
import { initConfig } from "./config";
import { merge } from "lodash";


export type ConnectorInitOptions = Optional<
  InitOptions,
  | "apiKey"
  | "connect"
  | "wallets"
  | "chains"
  | "appMetadata"
  | "accountCenter"
  | "theme"
>;

export interface WalletConnectorProviderProps {
  apiKey?: string;
  options?: ConnectorInitOptions;
  // skip board configuration if already initialized
  skipInit?: boolean;
}

export function InitEvm(
  props: PropsWithChildren<WalletConnectorProviderProps>
) {
  const [initialized, setInitialized] = useState(!!props.skipInit);

  const { get, register } = useSimpleDI();

  useEffect(() => {
    document.body.style.setProperty("--onboard-modal-z-index", "88");
  }, []);

  useEffect(() => {
    if (props.skipInit) {
      return;
    }

    let onboardAPI = get("onboardAPI") as OnboardAPI;

    if (onboardAPI) {
      console.log("[Orderly SDK]:onboardAPI already initialized");
      setInitialized(true);
      return;
    }

    Promise.all([
      fetchChainInfo('https://testnet-api-evm.orderly.org/v1/public/chain_info'),
      fetchChainInfo('https://api-evm.orderly.org/v1/public/chain_info'),
    ])
      .then(([testChainInfo, mainnetChainInfo]) => {
        const testChains = processChainInfo(testChainInfo);
        const mainnetChains = processChainInfo(mainnetChainInfo);

        let options = props.options || {};
        options = merge({ chains: [...testChains, ...mainnetChains] }, options);

        onboardAPI = initConfig(props.apiKey, options as InitOptions);
        register('onboardAPI', onboardAPI);
        setInitialized(true);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  if (!initialized) return null;

  return props.children
}

const fetchChainInfo = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch data from ${url}`);
  }
  return response.json();
};

const processChainInfo = (chainInfo: any) =>
  chainInfo?.data?.rows?.map((row: any) => ({
    id: Number(row.chain_id),
    token: row.currency_symbol,
    label: row.name,
    rpcUrl: row.public_rpc_url,
    blockExplorerUrl: row.explorer_base_url,
  })) || [];
