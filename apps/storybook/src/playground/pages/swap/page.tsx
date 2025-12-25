import React, { useCallback, useMemo, useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { WooFiSwapWidgetReact } from "woofi-swap-widget-kit/react";
import { useWalletConnector } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { ChainNamespace, SOLANA_MAINNET_CHAINID } from "@orderly.network/types";
import {
  Box,
  Flex,
  Text,
  CloseIcon,
  ExclamationFillIcon,
  cn,
} from "@orderly.network/ui";
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
  const { t } = useTranslation();
  const brokerAddress = "0xBf60A23Ee6748d0E762A75172659B5917958E7B6"; // for woofi_pro

  const SESSION_STORAGE_KEY = "swap-warning-closed";
  const [showWarning, setShowWarning] = useState(() => {
    if (typeof window !== "undefined") {
      const isClosed = sessionStorage.getItem(SESSION_STORAGE_KEY);
      return isClosed !== "true";
    }
    return true;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isClosed = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (isClosed === "true") {
        setShowWarning(false);
      }
    }
  }, []);

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
    <Flex direction="column" justify="center">
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
      {showWarning && (
        <Flex
          className={cn(
            "oui-bg-warning-darken/10 oui-text-warning-darken oui-relative oui-gap-1",
            "oui-mt-4 oui-p-2 oui-rounded-xl",
            "oui-w-full md:oui-w-[460px] oui-min-h-[48px]",
            "oui-justify-start oui-items-start",
          )}
        >
          <div className="oui-flex oui-items-start oui-justify-start oui-gap-1 oui-flex-1">
            <ExclamationFillIcon
              size={18}
              className="oui-flex-shrink-0 oui-text-warning-darken"
            />
            <Text size="2xs" weight="regular" className="oui--mt-[0.5px]">
              {t("extend.swap.warning")}
            </Text>
            <CloseIcon
              size={18}
              className="oui-flex-shrink-0 oui-h-[18px] oui-w-auto oui-cursor-pointer oui-text-base-contrast-54 hover:oui-text-base-contrast-80"
              onClick={() => {
                setShowWarning(false);
                if (typeof window !== "undefined") {
                  sessionStorage.setItem(SESSION_STORAGE_KEY, "true");
                }
              }}
            />
          </div>
        </Flex>
      )}
    </Flex>
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
