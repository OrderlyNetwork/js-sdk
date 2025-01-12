import { useCallback, useEffect } from "react";
import { useAccount, useWalletConnector } from "@orderly.network/hooks";
import { useScreen } from "@orderly.network/ui";
import { ChainNamespace } from "@orderly.network/types";

type DecodedData = {
  addr: string;
  k: string;
  t: number;
  id: number;
  type: ChainNamespace;
  utm_source: string;
};

export function useLinkDevice() {
  const { connectedChain } = useWalletConnector();

  const { account } = useAccount();
  const { isMobile } = useScreen();

  useEffect(() => {
    if (connectedChain) return;
    const address = account.keyStore.getAddress();
    const orderlyKey = account.keyStore.getOrderlyKey();
    const accountId = account.keyStore.getAccountId(address!);
    account.checkOrderlyKey(address!, orderlyKey!, accountId!);
  }, [connectedChain]);

  const linkDevice = useCallback(async () => {
    const url = new URL(window.location.href);
    const link = url.searchParams.get("link");

    if (!link) return;

    const {
      addr: address,
      k: key,
      id: chainId,
      type: chainType,
    } = decodeBase64(link) || {};
    if (address && key && chainId) {
      const res = await account.importOrderlyKey(address, key);
      if (!res) return;

      url.searchParams.delete("link");
      const decodedUrl = decodeURIComponent(url.toString());
      history.replaceState(null, "", decodedUrl);
    }
  }, [account]);

  useEffect(() => {
    if (isMobile && !connectedChain) {
      linkDevice();
    }
  }, [connectedChain, isMobile]);
}

function decodeBase64(base64: string) {
  try {
    const data = JSON.parse(window.atob(base64)) as DecodedData;
    console.log("decodeBase64", data);
    const currentTime = Math.floor(Date.now() / 1000);

    if (data.t < currentTime) {
      console.error("The token has expired.");
      return;
    }

    return data;
  } catch (error) {
    console.error("Invalid or expired token.");
  }
}
