import { useEffect } from "react";
import {
  useAccount,
  useWalletConnector,
  useOrderlyContext,
} from "@orderly.network/hooks";
import { AccountStatusEnum, ChainNamespace } from "@orderly.network/types";
import { LS_ACCOUNT_INFO_PREFIX } from "./constants";
import type {
  UseTelegramBindingReturn,
  TelegramUserData,
  WalletData,
  BindingData,
} from "./types";
import { useAccountInfo } from "./useAccountInfo";
import { useEvmAuth } from "./useEvmAuth";
import { useRegisterOrderlyKey } from "./useRegisterOrderlyKey";
import { useSolAuth } from "./useSolAuth";
import { useTelegramAuth } from "./useTelegramAuth";
import { useVerifyOrderlyKey } from "./useVerifyOrderlyKey";
import { getOrderlyKeyEIP712Data } from "./utils";

export function useTelegramBinding(
  onTelegramConnected?: (telegramData: TelegramUserData) => void,
  onWalletConnected?: (walletData: WalletData) => void,
  onBindingComplete?: (bindingData: BindingData) => void,
): UseTelegramBindingReturn {
  const { state: accountState } = useAccount();
  const { wallet, namespace } = useWalletConnector();
  const { starChildConfig, configStore } = useOrderlyContext();

  const baseUrl = starChildConfig?.url || "";
  const telegramBotId = starChildConfig?.telegram_bot_id || "";
  const brokerId = configStore.getOr("brokerId", "woofi_pro");

  const isWalletConnected = accountState.status >= AccountStatusEnum.SignedIn;
  const walletAddress = wallet?.accounts?.[0]?.address;
  const provider = (wallet as any)?.provider;

  // Initialize sub-hooks
  const { getEvmAuthToken, getAuthHeader: getEvmAuthHeader } = useEvmAuth(
    baseUrl,
    brokerId,
  );
  const { getSolAuthToken, getAuthHeader: getSolAuthHeader } = useSolAuth(
    baseUrl,
    brokerId,
  );
  const getAuthHeader = async (address: string, walletProvider: any) => {
    const ns = namespace ?? ChainNamespace.evm;
    if (ns === ChainNamespace.solana) {
      return getSolAuthHeader(address, walletProvider);
    }
    return getEvmAuthHeader(address, walletProvider);
  };

  const {
    hasOrderlyPrivateKey,
    hasVerifiedOrderly,
    setHasOrderlyPrivateKey,
    setHasVerifiedOrderly,
    getCachedAccountInfo,
    setCachedAccountInfo,
    emitAccountInfoReadyIfEligible,
    checkOrderlyAccountInfo,
  } = useAccountInfo(baseUrl, getAuthHeader);

  const {
    getTemporaryOrderlyKey: getTemporaryOrderlyKeyInternal,
    registerOrderlyKey: registerOrderlyKeyInternal,
    didRegisterOrderlyKey,
    setDidRegisterOrderlyKey,
  } = useRegisterOrderlyKey(baseUrl, brokerId, getAuthHeader);

  const {
    verifyOrderlyKey: verifyOrderlyKeyInternal,
    didVerifyOrderlyKey,
    setDidVerifyOrderlyKey,
  } = useVerifyOrderlyKey(baseUrl, getAuthHeader);

  const {
    telegramUser,
    isBinding,
    setIsBinding,
    bindingStatus,
    setBindingStatus,
    handleTelegramLogin: handleTelegramLoginInternal,
    checkAndCompleteBinding: checkAndCompleteBindingInternal,
  } = useTelegramAuth(
    baseUrl,
    telegramBotId,
    getEvmAuthToken,
    getSolAuthToken,
    getAuthHeader,
    onTelegramConnected,
    onWalletConnected,
    onBindingComplete,
  );

  // Ensure we obtain the auth token as soon as the wallet is connected,
  // so the first step in the flow can immediately proceed to registerOrderlyKey.
  useEffect(() => {
    if (!isWalletConnected || !walletAddress || !provider) return;
    const ns = namespace ?? ChainNamespace.evm;
    const fn = ns === ChainNamespace.solana ? getSolAuthToken : getEvmAuthToken;
    fn(walletAddress, provider).catch((e) => {
      console.error("Failed to get auth token:", e);
    });
  }, [
    isWalletConnected,
    walletAddress,
    provider,
    namespace,
    getEvmAuthToken,
    getSolAuthToken,
  ]);

  const getTemporaryOrderlyKey = () => {
    if (!walletAddress || !provider) {
      throw new Error("Wallet not connected");
    }
    const ns = namespace ?? ChainNamespace.evm;
    return getTemporaryOrderlyKeyInternal(walletAddress, provider, {
      chainType: ns === ChainNamespace.solana ? "SOLANA" : "EVM",
    });
  };

  const registerOrderlyKey = (
    orderlyKey: string,
    opts?: {
      userAddress?: string;
      scope?: string;
      brokerId?: string;
      chainId?: number;
      chainType?: "EVM" | "SOLANA";
      timestamp?: number;
      expiration?: number;
    },
  ) => {
    if (!walletAddress || !provider) {
      throw new Error("Wallet not connected");
    }
    const ns = namespace ?? ChainNamespace.evm;
    const effectiveChainType =
      opts?.chainType ?? (ns === ChainNamespace.solana ? "SOLANA" : "EVM");

    return registerOrderlyKeyInternal(orderlyKey, walletAddress, provider, {
      ...opts,
      chainType: effectiveChainType,
    });
  };

  const verifyOrderlyKey = () => {
    if (!walletAddress || !provider) {
      throw new Error("Wallet not connected");
    }
    const ns = namespace ?? ChainNamespace.evm;
    const effectiveChainType = ns === ChainNamespace.solana ? "SOLANA" : "EVM";

    return verifyOrderlyKeyInternal(walletAddress, provider, {
      chainType: effectiveChainType,
    });
  };

  const handleTelegramLogin = () => {
    handleTelegramLoginInternal(() => {
      checkAndCompleteBindingInternal(
        telegramUser,
        isWalletConnected,
        walletAddress,
        walletChainId,
        namespace,
        provider,
      );
    });
  };

  const checkAndCompleteBinding = () => {
    checkAndCompleteBindingInternal(
      telegramUser,
      isWalletConnected,
      walletAddress,
      walletChainId,
      namespace,
      provider,
    );
  };

  // Check orderly account info on wallet connect
  useEffect(() => {
    checkOrderlyAccountInfo(
      isWalletConnected,
      walletAddress,
      provider,
      namespace,
      setIsBinding,
      setBindingStatus,
    );
  }, [isWalletConnected, walletAddress, namespace]);

  // Check and complete binding when conditions change
  useEffect(() => {
    checkAndCompleteBinding();
  }, [telegramUser, isWalletConnected, walletAddress, namespace]);

  // Centralized cache update after binding success, orderly key registration, or verification
  useEffect(() => {
    if (!walletAddress) return;
    if (
      bindingStatus === "success" ||
      didRegisterOrderlyKey ||
      didVerifyOrderlyKey
    ) {
      if (didRegisterOrderlyKey) {
        setHasOrderlyPrivateKey(true);
      }
      if (didVerifyOrderlyKey) {
        setHasVerifiedOrderly(true);
      }

      const cached = getCachedAccountInfo(walletAddress);
      const next = {
        ...(cached?.data || {}),
        hasBindOrderly: true,
        hasOrderlyPrivateKey:
          didRegisterOrderlyKey || !!cached?.data?.hasOrderlyPrivateKey,
        hasVerifiedOrderly:
          didVerifyOrderlyKey || !!cached?.data?.hasVerifiedOrderly,
      };
      setCachedAccountInfo(walletAddress, next);
      emitAccountInfoReadyIfEligible(next);
      if (didRegisterOrderlyKey) setDidRegisterOrderlyKey(false);
      if (didVerifyOrderlyKey) setDidVerifyOrderlyKey(false);
    }
  }, [
    bindingStatus,
    didRegisterOrderlyKey,
    didVerifyOrderlyKey,
    walletAddress,
  ]);

  // Check account info after verification to get latest status from server
  useEffect(() => {
    if (didVerifyOrderlyKey && walletAddress) {
      // Clear cache to force fresh fetch
      try {
        localStorage.removeItem(LS_ACCOUNT_INFO_PREFIX + walletAddress);
      } catch {}
      // Trigger account info check
      checkOrderlyAccountInfo(
        isWalletConnected,
        walletAddress,
        provider,
        namespace,
        setIsBinding,
        setBindingStatus,
      );
    }
  }, [didVerifyOrderlyKey]);

  const walletChainId = (() => {
    const rawChainId = wallet?.chains?.[0]?.id;
    if (typeof rawChainId === "number") {
      return rawChainId;
    }
    if (typeof rawChainId === "string") {
      const parsed = Number.parseInt(rawChainId, 10);
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
  })();

  return {
    telegramUser,
    isWalletConnected,
    isBinding,
    bindingStatus,
    handleTelegramLogin,
    walletAddress: walletAddress || "",
    selectedChainId: walletChainId,
    getTemporaryOrderlyKey,
    registerOrderlyKey,
    getOrderlyKeyEIP712Data,
    verifyOrderlyKey,
    hasOrderlyPrivateKey,
    hasVerifiedOrderly,
  };
}
