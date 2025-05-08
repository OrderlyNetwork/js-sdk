import { useCallback, useEffect, useState } from "react";
import {
  useAccount,
  useChains,
  useEventEmitter,
  useTrack,
} from "@orderly.network/hooks";
import { TrackerEventName } from "@orderly.network/types";

export type UseLinkDeviceScriptReturn = ReturnType<typeof useLinkDeviceScript>;

const ExpireSeconds = 60;

export function useLinkDeviceScript() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(false);
  const [seconds, setSeconds] = useState(ExpireSeconds);
  const [secretKey, setSecretKey] = useState("");
  const [url, setUrl] = useState("");
  const ee = useEventEmitter();
  const { track } = useTrack();

  const { state, account } = useAccount();

  const [_, { findByChainId }] = useChains(undefined, {
    pick: "network_infos",
    filter: (chain: any) =>
      chain.network_infos?.bridge_enable || chain.network_infos?.bridgeless,
  });

  const createTrackParams = () => {
    const chain = findByChainId(account.chainId as number);
    return {
      wallet: state?.connectWallet?.name,
      network: chain?.network_infos.name,
    };
  };

  const getOrderlyKey = useCallback(async () => {
    try {
      const res = await account.createApiKey(30);
      setSecretKey(res.secretKey);
      setLoading(false);

      track(TrackerEventName.signLinkDeviceMessageSuccess, createTrackParams());
    } catch (e) {
      console.error("getOrderlyKey", e);

      if (e instanceof Error) {
        if (
          e.message.indexOf(
            "Signing off chain messages with Ledger is not yet supported",
          ) !== -1
        ) {
          ee.emit("wallet:sign-message-with-ledger-error", {
            message: e.message,
            userAddress: account.address,
          });
        }
      }
      hideDialog();
    }
  }, [account]);

  const showDialog = useCallback(() => {
    setOpen(true);
    getOrderlyKey();
    track(TrackerEventName.clickLinkDeviceButton, createTrackParams());
  }, [account]);

  const hideDialog = useCallback(() => {
    setOpen(false);
  }, []);

  const onConfirm = useCallback(() => {
    setConfirm(true);
    track(TrackerEventName.linkDeviceModalClickConfirm, {});
  }, []);

  const copyUrl = useCallback(() => {
    navigator.clipboard.writeText(url);
  }, [url]);

  useEffect(() => {
    //  when hide dialog, reset data
    if (!open) {
      setConfirm(false);
      setLoading(true);
      setSeconds(ExpireSeconds);
      setSecretKey("");
      setUrl("");
    }
  }, [open]);

  useEffect(() => {
    if (seconds === 0) {
      hideDialog();
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
      const timestamp = Math.floor(Date.now() / 1000) + ExpireSeconds;
      const params = {
        k: secretKey,
        t: timestamp,
        a: account.address,
        i: account.chainId,
        n: account.walletAdapter?.chainNamespace,
      };
      const url = createUrl(params);
      setUrl(url);
    }
  }, [confirm, secretKey]);

  return {
    open,
    onOpenChange: setOpen,
    showDialog,
    hideDialog,
    loading,
    seconds,
    confirm,
    onConfirm,
    url,
    copyUrl,
  };
}

function createUrl(params: Record<string, any>) {
  const str = JSON.stringify(params);
  const base64 = window.btoa(str);
  console.log("str", str.length, str);
  console.log("base64", base64.length, base64);
  return `${window.location.origin}?link=${base64}`;
}
