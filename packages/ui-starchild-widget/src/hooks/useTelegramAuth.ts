import { useEffect, useState } from "react";
import { ChainNamespace } from "@orderly.network/types";
import { LS_AUTH_KEY } from "./constants";
import type { TelegramUserData, WalletData, BindingData } from "./types";
import { safeParse } from "./utils";

export function useTelegramAuth(
  baseUrl: string,
  telegramBotId: string,
  getEvmAuthToken: (
    address: string,
    provider: any,
  ) => Promise<{ token: string; timestamp: number }>,
  getSolAuthToken: (
    address: string,
    provider: any,
  ) => Promise<{ token: string; timestamp: number }>,
  getAuthHeader: (address: string, provider: any) => Promise<string>,
  onTelegramConnected?: (telegramData: TelegramUserData) => void,
  onWalletConnected?: (walletData: WalletData) => void,
  onBindingComplete?: (bindingData: BindingData) => void,
) {
  const [telegramUser, setTelegramUser] = useState<TelegramUserData | null>(
    null,
  );
  const [isBinding, setIsBinding] = useState(false);
  const [bindingStatus, setBindingStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  // Initialize Telegram Widget script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.onload = () => {
      console.log("Telegram widget loaded");
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const bindTelegramAccount = async (
    telegramData: TelegramUserData,
    walletAddress: string,
    provider: any,
  ): Promise<void> => {
    const bindUrl = `${baseUrl}v1/private/bindTelegramUser`;
    const bindBody = JSON.stringify(telegramData);
    if (!walletAddress || !provider) throw new Error("Wallet not connected");
    const authHeader = await getAuthHeader(walletAddress, provider);

    const bindResp = await fetch(bindUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: bindBody,
    });
    const bindText = await bindResp.text();

    let bindJson: any = null;
    try {
      bindJson = JSON.parse(bindText);
    } catch {}
    console.log("Bind TG response:", bindJson ?? bindText);

    if (!bindResp.ok)
      throw new Error(`BindTelegramUser failed: ${bindResp.status}`);
  };

  const handleTelegramLogin = (checkAndCompleteBinding: () => void) => {
    setIsBinding(true);
    console.log("bot_id", telegramBotId);

    try {
      // @ts-ignore
      if (!(window as any).Telegram?.Login?.auth) {
        console.warn("Telegram widget not ready yet");
        setIsBinding(false);
        return;
      }
      // @ts-ignore - Telegram widget is loaded globally
      (window as any).Telegram?.Login?.auth(
        {
          bot_id: telegramBotId,
          data_onauth: "onTelegramAuth(user)",
          request_access: "write",
        },
        (data: TelegramUserData) => {
          if (data) {
            setTelegramUser(data);
            onTelegramConnected?.(data);
            checkAndCompleteBinding();
          } else {
            // User cancelled or failed to authenticate
            setIsBinding(false);
          }
        },
      );
    } catch (error) {
      console.error("Telegram login failed:", error);
      setIsBinding(false);
    }
  };

  const checkAndCompleteBinding = async (
    telegramUserData: TelegramUserData | null,
    isWalletConnected: boolean,
    walletAddress: string | undefined,
    walletChainId: number | undefined,
    namespace: ChainNamespace | null,
    provider: any,
  ) => {
    // Early return if conditions aren't met - don't block UI
    if (!telegramUserData || !isWalletConnected || !walletAddress) {
      return;
    }

    setIsBinding(true);
    try {
      const walletData: WalletData = {
        address: walletAddress,
        chainId: walletChainId || 0,
        namespace: namespace || ChainNamespace.evm,
      };
      onWalletConnected?.(walletData);

      const savedAuthStr = localStorage.getItem(LS_AUTH_KEY);
      if (savedAuthStr) {
        const saved = safeParse(savedAuthStr);
        if (saved && saved.address === walletAddress && saved.bound === true) {
          const bindingData: BindingData = {
            telegram: telegramUserData,
            wallet: walletData,
            bindingId: `${telegramUserData.id}_${walletAddress}`,
          };
          setBindingStatus("success");
          onBindingComplete?.(bindingData);
          setIsBinding(false);
          return;
        }
      }

      if (walletData.namespace === ChainNamespace.evm) {
        await getEvmAuthToken(walletAddress, provider);

        const bindingData: BindingData = {
          telegram: telegramUserData,
          wallet: walletData,
          bindingId: `${telegramUserData.id}_${walletAddress}`,
        };

        try {
          await bindTelegramAccount(telegramUserData, walletAddress, provider);
        } catch (e) {
          console.error(e);
          throw e;
        }

        setBindingStatus("success");
        onBindingComplete?.(bindingData);
      } else if (walletData.namespace === ChainNamespace.solana) {
        await getSolAuthToken(walletAddress, provider);

        const bindingData: BindingData = {
          telegram: telegramUserData,
          wallet: walletData,
          bindingId: `${telegramUserData.id}_${walletAddress}`,
        };

        try {
          await bindTelegramAccount(telegramUserData, walletAddress, provider);
        } catch (e) {
          console.error(e);
          throw e;
        }

        setBindingStatus("success");
        onBindingComplete?.(bindingData);
      } else {
        throw new Error("Unsupported chain namespace for binding");
      }
    } catch (error) {
      console.error("Binding failed:", error);
      setBindingStatus("error");
    } finally {
      setIsBinding(false);
    }
  };

  return {
    telegramUser,
    setTelegramUser,
    isBinding,
    setIsBinding,
    bindingStatus,
    setBindingStatus,
    handleTelegramLogin,
    checkAndCompleteBinding,
  };
}
