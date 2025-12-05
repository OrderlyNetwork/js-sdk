import React, { useCallback, useMemo } from "react";
// @ts-ignore woofi-swap-widget-kit is a JS-only dependency without bundled types
import { WooFiSwapWidgetReact } from "woofi-swap-widget-kit/react";
import { useWalletConnector } from "@orderly.network/hooks";
import { ChainNamespace, SOLANA_MAINNET_CHAINID } from "@orderly.network/types";
import { BaseLayout } from "../../components/layout/baseLayout";
import "woofi-swap-widget-kit/style.css";

const SwapWidget = () => {
  const { wallet, setChain, connectedChain, connect, namespace } =
    useWalletConnector();
  const brokerAddress = "0xfBe3AeDa720f923726b1108A0bB82140f6BaBd1A";

  const handleConnectWallet = useCallback(
    (config?: { network: string }) => {
      if (config?.network === "solana") {
        return connect({ chainId: SOLANA_MAINNET_CHAINID });
      }

      const fallbackEvmChainId =
        typeof connectedChain?.id === "number" ? connectedChain.id : 1;

      return connect({ chainId: fallbackEvmChainId });
    },
    [connect, connectedChain],
  );

  const handleChainSwitch = useCallback(
    (targetChain: { chainName: string; chainId?: string; key: string }) => {
      if (targetChain.key === "solana" || targetChain.chainId === "solana") {
        setChain({ chainId: SOLANA_MAINNET_CHAINID });
        return;
      }

      if (targetChain.chainId) {
        setChain({ chainId: targetChain.chainId });
      }
    },
    [setChain],
  );

  const evmProvider = useMemo(() => {
    if (!wallet || namespace !== ChainNamespace.evm) return undefined;
    return wallet.provider;
  }, [wallet, namespace]);

  const solanaProvider = useMemo(() => {
    if (!wallet || namespace !== ChainNamespace.solana) return undefined;
    const address = wallet.accounts?.[0]?.address;
    if (!address) {
      return wallet.provider;
    }

    return {
      ...(wallet.provider as any),
      publicKey: address,
    };
  }, [wallet, namespace]);

  const currentChainForWidget = useMemo(() => {
    if (!connectedChain) return undefined;
    if (connectedChain.namespace === ChainNamespace.solana) {
      return "solana";
    }
    return connectedChain.id;
  }, [connectedChain]);

  return (
    <WooFiSwapWidgetReact
      brokerAddress={brokerAddress}
      evmProvider={evmProvider}
      solanaProvider={solanaProvider}
      currentChain={currentChainForWidget}
      onConnectWallet={handleConnectWallet}
      onChainSwitch={handleChainSwitch}
      config={{
        enableSolana: true,
        enableLinea: false,
        enableMerlin: false,
        enableHyperevm: false,
        enableZksync: false,
      }}
    />
  );
};

export default function SwapPage() {
  return (
    <BaseLayout>
      <SwapWidget />
    </BaseLayout>
  );
}
