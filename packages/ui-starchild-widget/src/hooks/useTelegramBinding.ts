import { useEffect } from "react";
import {
  useAccount,
  useWalletConnector,
  useOrderlyContext,
} from "@orderly.network/hooks";
import { AccountStatusEnum } from "@orderly.network/types";
import { LS_ACCOUNT_INFO_PREFIX } from "./constants";
import type {
  UseTelegramBindingReturn,
  TelegramUserData,
  WalletData,
  BindingData,
} from "./types";
import { useAccountInfo } from "./useAccountInfo";
import { useEvmAuth } from "./useEvmAuth";
import { useOrderlyKey } from "./useOrderlyKey";
import { useTelegramAuth } from "./useTelegramAuth";

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
  const { getEvmAuthToken, getAuthHeader } = useEvmAuth(baseUrl, brokerId);

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
    getOrderlyKeyEIP712Data,
    registerOrderlyKey: registerOrderlyKeyInternal,
    verifyOrderlyKey: verifyOrderlyKeyInternal,
    didRegisterOrderlyKey,
    didVerifyOrderlyKey,
    setDidRegisterOrderlyKey,
    setDidVerifyOrderlyKey,
  } = useOrderlyKey(baseUrl, brokerId, getAuthHeader);

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
    getAuthHeader,
    onTelegramConnected,
    onWalletConnected,
    onBindingComplete,
  );

  // Ensure we obtain the EVM auth token as soon as the wallet is connected,
  // so the first step in the flow can immediately proceed to registerOrderlyKey.
  useEffect(() => {
    if (!isWalletConnected || !walletAddress || !provider) return;
    getEvmAuthToken(walletAddress, provider).catch((e) => {
      console.error("Failed to get EVM auth token:", e);
    });
  }, [isWalletConnected, walletAddress, provider, getEvmAuthToken]);

  const getTemporaryOrderlyKey = () => {
    if (!walletAddress || !provider) {
      throw new Error("Wallet not connected");
    }
    return getTemporaryOrderlyKeyInternal(walletAddress, provider);
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
    return registerOrderlyKeyInternal(
      orderlyKey,
      walletAddress,
      provider,
      opts,
    );
  };

  const verifyOrderlyKey = () => {
    if (!walletAddress || !provider) {
      throw new Error("Wallet not connected");
    }
    return verifyOrderlyKeyInternal(walletAddress, provider);
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
