import { useAccount } from "@orderly.network/hooks";
import { useCallback, useEffect, useState } from "react";

export type UseQRCodeScriptReturn = ReturnType<typeof useQRCodeScript>;

export type UseQRCodeScriptOptions = {
  close?: () => void;
};

export function useQRCodeScript(options: UseQRCodeScriptOptions) {
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(false);
  const [seconds, setSeconds] = useState(60);
  const [secretKey, setSecretKey] = useState("");
  const [url, setUrl] = useState("");

  const { account } = useAccount();

  useEffect(() => {
    account
      .createApiKey(1)
      .then((res) => {
        setSecretKey(res.secretKey);
        setLoading(false);
      })
      .catch((e) => {
        options.close?.();
      });
  }, []);

  useEffect(() => {
    if (seconds === 0) {
      options.close?.();
      return;
    }

    if (!confirm) {
      return;
    }

    const timer = setTimeout(() => {
      setSeconds(seconds - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [seconds, confirm]);

  useEffect(() => {
    if (confirm && secretKey) {
      const expirationSeconds = 600000;

      const timestamp = Math.floor(Date.now() / 1000) + expirationSeconds;
      const params = {
        k: secretKey,
        t: timestamp,
        addr: account.address,
        id: account.chainId?.toString(),
      };
      const url = createUrl(params);
      console.log("url", url);
      setUrl(url);
    }
  }, [confirm, secretKey]);

  const copyUrl = useCallback(() => {
    navigator.clipboard.writeText(url);
  }, [url]);

  return { loading, seconds, confirm, onConfirm: setConfirm, url, copyUrl };
}

function createUrl(params: Record<string, any>) {
  const str = JSON.stringify(params);
  const base64 = window.btoa(str);
  console.log("str", str.length, str);
  console.log("base64", base64.length, base64);
  return `${window.location.origin}?link=${base64}`;
}
