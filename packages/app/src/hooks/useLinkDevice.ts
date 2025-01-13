import { useCallback, useEffect } from "react";
import {
  useAccount,
  useLocalStorage,
  useWalletConnector,
} from "@orderly.network/hooks";
import { useScreen } from "@orderly.network/ui";

type DecodedData = {
  addr: string;
  k: string;
  t: number;
  id: string;
};

export function useLinkDevice() {
  const { connectedChain, disconnect } = useWalletConnector();
  const [selectedChainId, seSelectedChainId] = useLocalStorage<string>(
    "orderly_selected_chainId",
    ""
  );

  const { account, state } = useAccount();
  const { isMobile } = useScreen();

  const onDisconnect = async () => {
    await disconnect({
      label: state.connectWallet?.name,
    });
    await account.disconnect();
  };

  const linkDevice = useCallback(async () => {
    const url = new URL(window.location.href);
    const link = url.searchParams.get("link");

    if (!link) return;

    // if wallet connect, disconnect
    // if (connectedChain) {
    // await onDisconnect();
    // return;
    // }

    const { addr: address, k: key, id: chainId } = decodeBase64(link) || {};
    if (address && key && chainId) {
      const isSuccess = await account.importOrderlyKey(address, key);
      if (!isSuccess) return;
      seSelectedChainId(chainId);
      url.searchParams.delete("link");
      const decodedUrl = decodeURIComponent(url.toString());
      history.replaceState(null, "", decodedUrl);
    }
  }, [account, connectedChain]);

  useEffect(() => {
    if (isMobile && !connectedChain) {
      linkDevice();
    }
  }, [account, connectedChain, isMobile]);

  // persist status when refresh page
  useEffect(() => {
    if (isMobile && !connectedChain && selectedChainId) {
      const address = account.keyStore.getAddress();
      const orderlyKey = account.keyStore.getOrderlyKey();
      const accountId = account.keyStore.getAccountId(address!);
      account.checkOrderlyKey(address!, orderlyKey!, accountId!);
    }
  }, [isMobile, connectedChain, selectedChainId]);
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
