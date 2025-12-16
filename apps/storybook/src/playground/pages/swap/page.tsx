import React, { useCallback, useMemo } from "react";
import { PublicKey } from "@solana/web3.js";
import { WooFiSwapWidgetReact } from "woofi-swap-widget-kit/react";
import { useWalletConnector } from "@orderly.network/hooks";
import { ChainNamespace, SOLANA_MAINNET_CHAINID } from "@orderly.network/types";
import { Box } from "@orderly.network/ui";
import { BaseLayout } from "../../components/layout/baseLayout";
import { PathEnum } from "../../constant";
import "woofi-swap-widget-kit/style.css";

function resolveSolanaPublicKey(
  provider: { publicKey?: unknown } | undefined,
  address?: string,
): PublicKey | undefined {
  const maybePublicKey = provider?.publicKey;
  if (maybePublicKey instanceof PublicKey) return maybePublicKey;

  if (!address) return undefined;
  try {
    return new PublicKey(address);
  } catch {
    return undefined;
  }
}

const SwapWidget = () => {
  const { wallet, setChain, connectedChain, connect, namespace } =
    useWalletConnector();
  const brokerAddress = "0xBf60A23Ee6748d0E762A75172659B5917958E7B6"; // for woofi_pro

  const handleConnectWallet = useCallback(
    (config?: { network: string }) => {
      if (config?.network === "solana") {
        return connect({ chainId: SOLANA_MAINNET_CHAINID });
      }

      const evmChainId =
        typeof connectedChain?.id === "number" ? connectedChain.id : 1;

      return connect({ chainId: evmChainId });
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
    const baseProvider = (wallet.provider ?? {}) as any;
    const publicKey = resolveSolanaPublicKey(baseProvider, address);

    return { ...baseProvider, publicKey };
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
    <BaseLayout
      initialMenu={PathEnum.Swap}
      classNames={{
        content:
          "oui-flex oui-justify-center oui-px-3 oui-pt-4 md:oui-pt-[60px]",
      }}
    >
      <Box className="oui-rounded-xl oui-overflow-hidden">
        <SwapWidget />
      </Box>
    </BaseLayout>
  );
}
