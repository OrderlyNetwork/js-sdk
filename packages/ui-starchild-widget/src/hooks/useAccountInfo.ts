import { useRef, useState, useCallback } from "react";
import { ChainNamespace } from "@orderly.network/types";
import { LS_ACCOUNT_INFO_PREFIX, ACCOUNT_INFO_TTL_MS } from "./constants";
import { safeParse } from "./utils";

export function useAccountInfo(
  baseUrl: string,
  getAuthHeader: (address: string, provider: any) => Promise<string>,
) {
  const [hasOrderlyPrivateKey, setHasOrderlyPrivateKey] = useState(false);
  const [hasVerifiedOrderly, setHasVerifiedOrderly] = useState(false);
  const hasCheckedAccountInfoRef = useRef(false);

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

  // Check orderly account info after EVM wallet connects
  const checkOrderlyAccountInfo = useCallback(
    async (
      isWalletConnected: boolean,
      walletAddress: string | undefined,
      provider: any,
      namespace: ChainNamespace | null,
      setIsBinding: (value: boolean) => void,
      setBindingStatus: (status: "idle" | "success" | "error") => void,
    ) => {
      try {
        const addr = walletAddress;
        const isEvm = namespace === ChainNamespace.evm;
        if (!isWalletConnected || !addr || !provider || namespace === null)
          return;

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

        const telegramUserId = json?.telegramUserId;
        const hasTelegramBinding = !!telegramUserId;
        const hasOrderlyPrivateKeyValue = !!json?.hasOrderlyPrivateKey;
        const hasVerifiedOrderlyValue = !!json?.hasVerifiedOrderly;

        console.log("Account info status:", {
          telegramUserId,
          hasTelegramBinding,
          hasOrderlyPrivateKey: hasOrderlyPrivateKeyValue,
          hasVerifiedOrderly: hasVerifiedOrderlyValue,
        });

        // Update state with latest status from server
        setHasOrderlyPrivateKey(hasOrderlyPrivateKeyValue);
        setHasVerifiedOrderly(hasVerifiedOrderlyValue);

        if (hasTelegramBinding) {
          setBindingStatus("success");
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
    },
    [baseUrl, getAuthHeader],
  );

  return {
    hasOrderlyPrivateKey,
    hasVerifiedOrderly,
    setHasOrderlyPrivateKey,
    setHasVerifiedOrderly,
    hasCheckedAccountInfoRef,
    getCachedAccountInfo,
    setCachedAccountInfo,
    emitAccountInfoReadyIfEligible,
    checkOrderlyAccountInfo,
  };
}
