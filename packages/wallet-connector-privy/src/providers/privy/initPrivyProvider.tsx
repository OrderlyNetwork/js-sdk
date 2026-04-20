import { type PropsWithChildren, useMemo } from "react";
import { PrivyClientConfig, PrivyProvider } from "@privy-io/react-auth";
import { Chain } from "viem/chains";
import {
  AbstractChains,
  SolanaChains,
  defaultMainnetChains,
  defaultTestnetChains,
} from "@orderly.network/types";
import { useWalletConnectorPrivy } from "../../provider";
import { InitPrivy } from "../../types";

interface IProps extends PropsWithChildren {
  privyConfig?: InitPrivy;
  initChains: Chain[];
}

export function InitPrivyProvider({
  privyConfig,
  initChains,
  children,
}: IProps) {
  if (!privyConfig) {
    return children;
  }
  const { network } = useWalletConnectorPrivy();

  const config = useMemo((): PrivyClientConfig => {
    const chains = initChains;
    const preferredDefaultChainIds = (
      network === "mainnet" ? defaultMainnetChains : defaultTestnetChains
    ).map((c) => c.id);

    const preferredDefaultChain = preferredDefaultChainIds
      .map((id) => chains.find((c) => c.id === id))
      .find((c) => !!c);

    const firstEvmChain = chains.find(
      (chain) => !SolanaChains.has(chain.id) && !AbstractChains.has(chain.id),
    );

    const defaultEvmChain = preferredDefaultChain ?? firstEvmChain ?? chains[0];

    const userConfig = (privyConfig.config ?? {}) as Partial<PrivyClientConfig>;
    const {
      supportedChains,
      defaultChain,
      loginMethods: userLoginMethods,
      appearance: userAppearance,
      embeddedWallets: userEmbedded,
      externalWallets: userExternal,
      ...rest
    } = userConfig;

    void supportedChains;
    void defaultChain;

    const defaultEmbedded: NonNullable<PrivyClientConfig["embeddedWallets"]> = {
      ethereum: {
        createOnLogin: "all-users",
      },
      solana: {
        createOnLogin: "all-users",
      },
    };

    const defaultExternal: NonNullable<PrivyClientConfig["externalWallets"]> = {
      walletConnect: {
        enabled: false,
      },
    };

    const embeddedWallets: PrivyClientConfig["embeddedWallets"] = {
      ...defaultEmbedded,
      ...userEmbedded,
      ethereum: {
        ...defaultEmbedded.ethereum,
        ...userEmbedded?.ethereum,
      },
      solana: {
        ...defaultEmbedded.solana,
        ...userEmbedded?.solana,
      },
    };

    const externalWallets: PrivyClientConfig["externalWallets"] = {
      ...defaultExternal,
      ...userExternal,
      walletConnect: {
        ...defaultExternal.walletConnect,
        ...userExternal?.walletConnect,
        enabled:
          userExternal?.walletConnect?.enabled ??
          defaultExternal.walletConnect?.enabled ??
          false,
      },
    };

    return {
      ...rest,
      loginMethods: userLoginMethods || ["email", "google", "twitter"],
      appearance: {
        ...userAppearance,
        walletChainType: "ethereum-and-solana",
      },
      embeddedWallets,
      externalWallets,
      defaultChain: defaultEvmChain,
      supportedChains: chains,
    };
  }, [initChains, privyConfig, network]);

  if (!initChains.length) {
    console.warn("initChains is empty");
    return;
  }

  return (
    <PrivyProvider appId={privyConfig.appid} config={config}>
      {children}
    </PrivyProvider>
  );
}
