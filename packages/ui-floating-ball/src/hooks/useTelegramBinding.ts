import { useEffect, useMemo, useRef, useState } from "react";
import { keccak256, toUtf8Bytes, hexlify } from "ethers";
import {
  useAccount,
  useWalletConnector,
  useOrderlyContext,
} from "@orderly.network/hooks";
import { AccountStatusEnum } from "@orderly.network/types";
import type { TelegramUserData, WalletData, BindingData } from "../types";

export type UseTelegramBindingReturn = {
  telegramUser: TelegramUserData | null;
  isWalletConnected: boolean;
  isBinding: boolean;
  bindingStatus: "idle" | "success" | "error";
  handleTelegramLogin: () => void;
  walletAddress: string;
  getTemporaryOrderlyKey: () => Promise<{
    orderlyKey: string;
    privateKey: string;
  }>;
  registerOrderlyKey: (
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
  ) => Promise<any>;
  getOrderlyKeyEIP712Data: (
    chainId: number,
    isSmartWallet: boolean,
    orderlyKeyMessage: any,
  ) => any;
  verifyOrderlyKey: () => Promise<any>;
  hasOrderlyPrivateKey: boolean;
  hasVerifiedOrderly: boolean;
};

export function useTelegramBinding(
  onTelegramConnected?: (telegramData: TelegramUserData) => void,
  onWalletConnected?: (walletData: WalletData) => void,
  onBindingComplete?: (bindingData: BindingData) => void,
): UseTelegramBindingReturn {
  const { state: accountState } = useAccount();
  const { wallet, namespace } = useWalletConnector();
  const { starChildConfig } = useOrderlyContext();

  const baseUrl = starChildConfig?.url || "";
  const telegramBotId = starChildConfig?.telegram_bot_id || "";

  const [telegramUser, setTelegramUser] = useState<TelegramUserData | null>(
    null,
  );
  const [isBinding, setIsBinding] = useState(false);
  const [bindingStatus, setBindingStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [didRegisterOrderlyKey, setDidRegisterOrderlyKey] = useState(false);
  const [didVerifyOrderlyKey, setDidVerifyOrderlyKey] = useState(false);
  const [hasOrderlyPrivateKey, setHasOrderlyPrivateKey] = useState(false);
  const [hasVerifiedOrderly, setHasVerifiedOrderly] = useState(false);

  const LS_AUTH_KEY = "oui.telegramBinding.auth";
  const LS_ACCOUNT_INFO_PREFIX = "oui.telegramBinding.accountInfo.";
  const ACCOUNT_INFO_TTL_MS = 60 * 1000;
  const tokenRequestInFlightRef = useRef<
    Map<string, Promise<{ token: string; timestamp: number }>>
  >(new Map());
  const hasCheckedAccountInfoRef = useRef(false);

  const safeParse = (text: string) => {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  };

  const utf8ToHex = (text: string) => {
    const bytes = new TextEncoder().encode(text);
    return (
      "0x" +
      Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
    );
  };

  const ethereumPersonalMessageHash = (text: string) => {
    // "\x19Ethereum Signed Message:\n" + len + message
    const messageBytes = toUtf8Bytes(text);
    const prefix = `\x19Ethereum Signed Message:\n${messageBytes.length}`;
    const prefixed = new Uint8Array([...toUtf8Bytes(prefix), ...messageBytes]);
    return keccak256(prefixed);
  };

  const normalizeSignatureV = (sigHex: string) => {
    let s = sigHex.toLowerCase();
    if (s.startsWith("0x")) s = s.slice(2);
    if (s.length !== 130) return s;
    const v = s.slice(128, 130);
    if (v === "00") return s.slice(0, 128) + "1b";
    if (v === "01") return s.slice(0, 128) + "1c";
    return s;
  };

  // Request an auth token for EVM wallets
  const requestEvmAuthToken = async (
    address: string,
    provider: any,
  ): Promise<{ token: string; timestamp: number }> => {
    const timestamp = Date.now();
    const messageText = `EVM:${timestamp}`;
    const hash = ethereumPersonalMessageHash(messageText);

    let signatureHex = "" as string;
    try {
      signatureHex = await provider?.request?.({
        method: "eth_sign",
        params: [address, hash],
      });
    } catch (e) {
      try {
        signatureHex = await provider?.request?.({
          method: "personal_sign",
          params: [utf8ToHex(messageText), address],
        });
      } catch (e2) {
        signatureHex = await provider?.request?.({
          method: "personal_sign",
          params: [address, utf8ToHex(messageText)],
        });
      }
    }

    const normalizedSignature = normalizeSignatureV(signatureHex);

    const requestBody = {
      message: { chainType: "EVM", timestamp },
      signature: normalizedSignature,
      userAddress: address,
    };

    const resp = await fetch(`${baseUrl}v1/authToken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
    if (!resp.ok) throw new Error(`AuthToken request failed: ${resp.status}`);

    const responseText = await resp.text();
    let responseJson: any = null;
    try {
      responseJson = JSON.parse(responseText);
    } catch {}
    console.log("AuthToken response:", responseJson ?? responseText);
    const token =
      typeof responseJson?.token === "string" ? responseJson.token : null;
    if (!token) throw new Error("AuthToken not found in response");

    return { token, timestamp };
  };

  // Return existing token for address from localStorage if present; otherwise request and persist.
  const getEvmAuthToken = async (
    address: string,
    provider: any,
  ): Promise<{ token: string; timestamp: number }> => {
    const inFlight = tokenRequestInFlightRef.current.get(address);
    if (inFlight) return inFlight;

    const promise = (async () => {
      const savedStr = localStorage.getItem(LS_AUTH_KEY);
      const saved = savedStr ? safeParse(savedStr) : null;
      if (
        saved &&
        saved.address === address &&
        typeof saved.token === "string" &&
        saved.token
      ) {
        return {
          token: saved.token as string,
          timestamp: saved.timestamp as number,
        };
      }
      console.log("no saved auth token, requesting from server");
      const res = await requestEvmAuthToken(address, provider);
      try {
        const next = {
          address,
          timestamp: res.timestamp,
          token: res.token,
          bound: saved?.bound ?? false,
        };
        localStorage.setItem(LS_AUTH_KEY, JSON.stringify(next));
      } catch {}
      return res;
    })();

    tokenRequestInFlightRef.current.set(address, promise);
    try {
      return await promise;
    } finally {
      tokenRequestInFlightRef.current.delete(address);
    }
  };

  // Build Authorization header for the connected EVM address
  const getAuthHeader = async (
    address: string,
    provider: any,
  ): Promise<string> => {
    const { token } = await getEvmAuthToken(address, provider);
    return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  };

  const getCachedAccountInfo = (
    address: string,
  ): { timestamp: number; data: any } | null => {
    try {
      const raw = localStorage.getItem(LS_ACCOUNT_INFO_PREFIX + address);
      if (!raw) return null;
      const parsed = safeParse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      return parsed as { timestamp: number; data: any };
    } catch {
      return null;
    }
  };

  const setCachedAccountInfo = (address: string, data: any) => {
    try {
      const payload = { timestamp: Date.now(), data };
      localStorage.setItem(
        LS_ACCOUNT_INFO_PREFIX + address,
        JSON.stringify(payload),
      );
    } catch {}
  };

  const emitAccountInfoReadyIfEligible = (info: any) => {
    try {
      if (info?.hasOrderlyPrivateKey && info?.hasVerifiedOrderly) {
        const evt = new CustomEvent("starchild:accountInfoReady");
        window.dispatchEvent(evt);
      }
    } catch {}
  };

  // StarChild init is handled by a persistent component; no params builder here.

  // Check orderly account info after EVM wallet connects
  const checkOrderlyAccountInfo = async () => {
    try {
      const addr = wallet?.accounts?.[0]?.address;
      const provider: any = (wallet as any)?.provider;
      const isEvm = (namespace || "evm").toLowerCase() === "evm";
      if (!isWalletConnected || !addr || !provider || !isEvm) return;

      // Set binding state on first check to disable button
      const isFirstCheck = !hasCheckedAccountInfoRef.current;
      if (isFirstCheck) {
        setIsBinding(true);
      }

      const cached = getCachedAccountInfo(addr);
      const now = Date.now();
      let json: any = null;
      if (cached && now - cached.timestamp < ACCOUNT_INFO_TTL_MS) {
        json = cached.data;
      } else {
        console.log("no cached account info, fetching from server");
        const authHeader = await getAuthHeader(addr, provider);
        const resp = await fetch(`${baseUrl}v1/private/accountInfo`, {
          method: "GET",
          headers: { Authorization: authHeader },
        });
        if (!resp.ok) {
          if (isFirstCheck) {
            setIsBinding(false);
            hasCheckedAccountInfoRef.current = true;
          }
          return;
        }
        const text = await resp.text();
        try {
          json = JSON.parse(text);
        } catch {}
        setCachedAccountInfo(addr, json);
      }

      const hasBindOrderly = !!json?.hasBindOrderly;
      const hasOrderlyPrivateKeyValue = !!json?.hasOrderlyPrivateKey;
      const hasVerifiedOrderlyValue = !!json?.hasVerifiedOrderly;

      console.log("Account info status:", {
        hasBindOrderly,
        hasOrderlyPrivateKey: hasOrderlyPrivateKeyValue,
        hasVerifiedOrderly: hasVerifiedOrderlyValue,
      });

      // Update state with latest status from server
      setHasOrderlyPrivateKey(hasOrderlyPrivateKeyValue);
      setHasVerifiedOrderly(hasVerifiedOrderlyValue);

      if (hasBindOrderly) {
        setBindingStatus("success");
        try {
          const exist = localStorage.getItem(LS_AUTH_KEY);
          const parsed = exist ? safeParse(exist) : null;
          if (parsed && parsed.address === addr) {
            parsed.bound = true;
            localStorage.setItem(LS_AUTH_KEY, JSON.stringify(parsed));
          }
        } catch {}
        if (hasOrderlyPrivateKeyValue && hasVerifiedOrderlyValue) {
          console.log("hello I am your starchild");
          try {
            const evt = new CustomEvent("starchild:accountInfoReady");
            window.dispatchEvent(evt);
          } catch {}
        }
      }

      // Clear binding state after check completes
      if (isFirstCheck) {
        setIsBinding(false);
        hasCheckedAccountInfoRef.current = true;
      }
    } catch (e) {
      // noop: do not block UI on failures
      const isFirstCheck = !hasCheckedAccountInfoRef.current;
      if (isFirstCheck) {
        setIsBinding(false);
        hasCheckedAccountInfoRef.current = true;
      }
    }
  };

  const bindTelegramAccount = async (
    telegramData: TelegramUserData,
  ): Promise<void> => {
    const bindUrl = `${baseUrl}v1/private/bindTGAccount`;
    const bindBody = JSON.stringify(telegramData);
    const addr = wallet?.accounts?.[0]?.address;
    const provider: any = (wallet as any)?.provider;
    if (!addr || !provider) throw new Error("Wallet not connected");
    const authHeader = await getAuthHeader(addr, provider);

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
      throw new Error(`BindTGAccount failed: ${bindResp.status}`);
  };

  const getTemporaryOrderlyKey = async (): Promise<{
    orderlyKey: string;
    privateKey: string;
  }> => {
    const addr = wallet?.accounts?.[0]?.address;
    const provider: any = (wallet as any)?.provider;
    if (!addr || !provider) throw new Error("Wallet not connected");
    const authHeader = await getAuthHeader(addr, provider);

    const resp = await fetch(`${baseUrl}v1/private/temporary/orderlyKey`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({}),
    });
    if (!resp.ok)
      throw new Error(`temporary orderlyKey request failed: ${resp.status}`);
    const json = await resp.json();
    if (!json?.orderlyKey || !json?.privateKey)
      throw new Error("temporary orderlyKey response missing fields");
    return {
      orderlyKey: json.orderlyKey,
      privateKey: json.privateKey,
    };
  };

  type AddKeyMessage = {
    brokerId: string;
    chainId: number | string;
    orderlyKey: string;
    scope: string;
    timestamp: number | string;
    expiration: number | string;
  };

  // Build EIP-712 typed data for AddOrderlyKey (parity with Go getOrderlyKeyEIP712Data)
  const getOrderlyKeyEIP712Data = (
    chainId: number,
    _isSmartWallet: boolean,
    orderlyKeyMessage: AddKeyMessage,
  ) => {
    return {
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
        AddOrderlyKey: [
          { name: "brokerId", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "orderlyKey", type: "string" },
          { name: "scope", type: "string" },
          { name: "timestamp", type: "uint64" },
          { name: "expiration", type: "uint64" },
        ],
      },
      primaryType: "AddOrderlyKey",
      domain: {
        name: "Orderly",
        version: "1",
        chainId: chainId,
        verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
      },
      message: {
        brokerId: orderlyKeyMessage.brokerId,
        chainId: String(orderlyKeyMessage.chainId),
        orderlyKey: orderlyKeyMessage.orderlyKey,
        scope: orderlyKeyMessage.scope,
        timestamp: String(orderlyKeyMessage.timestamp),
        expiration: String(orderlyKeyMessage.expiration),
      },
    } as const;
  };

  // Sign the AddOrderlyKey EIP-712 typed data using the connected wallet
  const signOrderlyKeyEIP712 = async (
    message: AddKeyMessage,
    chainId: number,
  ): Promise<string> => {
    const signer = wallet?.accounts?.[0]?.address;
    const provider: any = (wallet as any)?.provider;
    if (!signer || !provider) throw new Error("Wallet not connected");

    const typed = getOrderlyKeyEIP712Data(chainId, false, message);
    const typedJson = JSON.stringify(typed);

    let signatureHex = "" as string;
    try {
      signatureHex = await provider.request?.({
        method: "eth_signTypedData_v4",
        params: [signer, typedJson],
      });
    } catch (e) {
      try {
        signatureHex = await provider.request?.({
          method: "eth_signTypedData",
          params: [signer, typed],
        });
      } catch (e2) {
        signatureHex = await provider.request?.({
          method: "eth_signTypedData_v3",
          params: [signer, typedJson],
        });
      }
    }
    return normalizeSignatureV(signatureHex);
  };

  // Register orderly key with local service (signature left blank)
  const registerOrderlyKey = async (
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
  ): Promise<any> => {
    const now = Date.now();
    const payload = {
      message: {
        brokerId: opts?.brokerId ?? "woofi_pro",
        chainId: opts?.chainId ?? 8453,
        chainType: opts?.chainType ?? "EVM",
        orderlyKey,
        scope: opts?.scope ?? "read",
        timestamp: opts?.timestamp ?? now,
        expiration: opts?.expiration ?? now + 24 * 60 * 60,
        tag: "orderlykey",
      },
      signature: "",
      userAddress: opts?.userAddress ?? (wallet?.accounts?.[0]?.address || ""),
    };

    // Compute EIP-712 signature
    (payload as any).signature = await signOrderlyKeyEIP712(
      {
        brokerId: payload.message.brokerId,
        chainId: payload.message.chainId,
        orderlyKey: payload.message.orderlyKey,
        scope: payload.message.scope,
        timestamp: payload.message.timestamp,
        expiration: payload.message.expiration,
      },
      Number(payload.message.chainId),
    );

    const addr = wallet?.accounts?.[0]?.address;
    const provider: any = (wallet as any)?.provider;
    if (!addr || !provider) throw new Error("Wallet not connected");
    const authHeader = await getAuthHeader(addr, provider);

    const resp = await fetch(`${baseUrl}v1/private/registerOrderlyKey`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const text = await resp.text();
    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch {}
    if (!resp.ok)
      throw new Error(`registerOrderlyKey failed: ${resp.status} ${text}`);
    // Signal effect to update cache centrally
    setDidRegisterOrderlyKey(true);
    return json ?? text;
  };

  // Verify orderly key - signs and verifies with the same format as authToken
  const verifyOrderlyKey = async (): Promise<any> => {
    const addr = wallet?.accounts?.[0]?.address;
    const provider: any = (wallet as any)?.provider;
    if (!addr || !provider) throw new Error("Wallet not connected");

    const timestamp = Date.now();
    const messageText = `EVM:${timestamp}`;
    const hash = ethereumPersonalMessageHash(messageText);

    let signatureHex = "" as string;
    try {
      signatureHex = await provider?.request?.({
        method: "eth_sign",
        params: [addr, hash],
      });
    } catch (e) {
      try {
        signatureHex = await provider?.request?.({
          method: "personal_sign",
          params: [utf8ToHex(messageText), addr],
        });
      } catch (e2) {
        signatureHex = await provider?.request?.({
          method: "personal_sign",
          params: [addr, utf8ToHex(messageText)],
        });
      }
    }

    const normalizedSignature = normalizeSignatureV(signatureHex);

    const requestBody = {
      message: { chainType: "EVM", timestamp },
      signature: normalizedSignature,
      userAddress: addr,
    };

    const authHeader = await getAuthHeader(addr, provider);

    const resp = await fetch(`${baseUrl}v1/private/verifyOrderlyKey`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    if (!resp.ok)
      throw new Error(`VerifyOrderlyKey request failed: ${resp.status}`);

    const responseText = await resp.text();
    let responseJson: any = null;
    try {
      responseJson = JSON.parse(responseText);
    } catch {}
    console.log("VerifyOrderlyKey response:", responseJson ?? responseText);

    // Signal effect to update cache and check account info
    setDidVerifyOrderlyKey(true);

    return responseJson ?? responseText;
  };

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

  const handleTelegramLogin = () => {
    setIsBinding(true);
    console.log("bot_id", telegramBotId);

    try {
      // Guard: widget may not be ready on first click while script is still loading
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

  const isWalletConnected = accountState.status >= AccountStatusEnum.SignedIn;

  const checkAndCompleteBinding = async () => {
    // Early return if conditions aren't met - don't block UI
    if (!telegramUser || !isWalletConnected || !wallet?.accounts?.[0]) {
      return;
    }

    setIsBinding(true);
    try {
      const walletData: WalletData = {
        address: wallet.accounts[0].address,
        chainId:
          typeof wallet.chains[0]?.id === "number"
            ? wallet.chains[0].id
            : parseInt(wallet.chains[0]?.id || "0"),
        namespace: namespace || "evm",
      };
      onWalletConnected?.(walletData);

      const savedAuthStr = localStorage.getItem(LS_AUTH_KEY);
      if (savedAuthStr) {
        const saved = safeParse(savedAuthStr);
        if (
          saved &&
          saved.address === wallet.accounts[0].address &&
          saved.bound === true
        ) {
          const bindingData: BindingData = {
            telegram: telegramUser,
            wallet: walletData,
            bindingId: `${telegramUser.id}_${wallet.accounts[0].address}`,
          };
          setBindingStatus("success");
          onBindingComplete?.(bindingData);
          setIsBinding(false);
          return;
        }
      }

      if ((walletData.namespace || "evm").toLowerCase() === "evm") {
        // Ensure token exists but avoid duplicate prompts
        await getEvmAuthToken(
          wallet.accounts[0].address,
          wallet.provider as any,
        );

        const bindingData: BindingData = {
          telegram: telegramUser,
          wallet: walletData,
          bindingId: `${telegramUser.id}_${wallet.accounts[0].address}`,
        };

        try {
          await bindTelegramAccount(telegramUser); // Bind Telegram Account
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

  useEffect(() => {
    checkOrderlyAccountInfo();
  }, [isWalletConnected, wallet?.accounts?.[0]?.address, namespace]);

  useEffect(() => {
    checkAndCompleteBinding();
  }, [
    telegramUser,
    isWalletConnected,
    wallet?.accounts?.[0]?.address,
    namespace,
  ]);

  // Centralized cache update after binding success, orderly key registration, or verification
  useEffect(() => {
    const addr = wallet?.accounts?.[0]?.address;
    if (!addr) return;
    if (
      bindingStatus === "success" ||
      didRegisterOrderlyKey ||
      didVerifyOrderlyKey
    ) {
      const cached = getCachedAccountInfo(addr);
      const next = {
        ...(cached?.data || {}),
        hasBindOrderly: true,
        hasOrderlyPrivateKey:
          didRegisterOrderlyKey || !!cached?.data?.hasOrderlyPrivateKey,
        hasVerifiedOrderly:
          didVerifyOrderlyKey || !!cached?.data?.hasVerifiedOrderly,
      };
      setCachedAccountInfo(addr, next);
      emitAccountInfoReadyIfEligible(next);
      if (didRegisterOrderlyKey) setDidRegisterOrderlyKey(false);
      if (didVerifyOrderlyKey) setDidVerifyOrderlyKey(false);
    }
  }, [
    bindingStatus,
    didRegisterOrderlyKey,
    didVerifyOrderlyKey,
    wallet?.accounts?.[0]?.address,
  ]);

  // Check account info after verification to get latest status from server
  useEffect(() => {
    if (didVerifyOrderlyKey) {
      // Force a fresh check from server (bypass cache)
      const addr = wallet?.accounts?.[0]?.address;
      if (addr) {
        // Clear cache to force fresh fetch
        try {
          localStorage.removeItem(LS_ACCOUNT_INFO_PREFIX + addr);
        } catch {}
        // Trigger account info check
        checkOrderlyAccountInfo();
      }
    }
  }, [didVerifyOrderlyKey]);

  // Init is handled outside to avoid unmount during dialog close.

  return {
    telegramUser,
    isWalletConnected,
    isBinding,
    bindingStatus,
    handleTelegramLogin,
    walletAddress: wallet?.accounts?.[0]?.address || "",
    getTemporaryOrderlyKey,
    registerOrderlyKey,
    getOrderlyKeyEIP712Data,
    verifyOrderlyKey,
    hasOrderlyPrivateKey,
    hasVerifiedOrderly,
  };
}
