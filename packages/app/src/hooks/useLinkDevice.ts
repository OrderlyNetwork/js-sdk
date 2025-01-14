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
const WALLET_KEY = "orderly:wallet-info";

export function useLinkDevice() {
  const { connectedChain, disconnect } = useWalletConnector();
  const [selectedChainId, seSelectedChainId] = useLocalStorage<string>(
    "orderly_selected_chainId",
    ""
  );

  const { account } = useAccount();
  const { isMobile } = useScreen();

  const onDisconnect = async (label: string) => {
    localStorage.removeItem(WALLET_KEY);
    await account.disconnect();
    await disconnect({ label });
  };

  useEffect(() => {
    const linkData = getLinkDeviceData();
    const walletInfo = JSON.parse(localStorage.getItem(WALLET_KEY) ?? "{}");
    if (linkData && walletInfo) {
      onDisconnect(walletInfo.label);
    }
  }, []);

  const linkDevice = useCallback(async () => {
    const linkData = getLinkDeviceData();
    if (!linkData) return;
    
    const { address, key, chainId } = linkData;
    const isSuccess = await account.importOrderlyKey(address, key);
    if (!isSuccess) return;
    seSelectedChainId(chainId);

    const url = new URL(window.location.href);
    url.searchParams.delete("link");
    const decodedUrl = decodeURIComponent(url.toString());
    history.replaceState(null, "", decodedUrl);
  }, [account, connectedChain]);

  useEffect(() => {
    if (isMobile && !connectedChain) {
      linkDevice();
    }
  }, [account, connectedChain, isMobile]);

  // persist status when refresh page
  useEffect(() => {
    if (!connectedChain && selectedChainId) {
      const address = account.keyStore.getAddress();
      const orderlyKey = account.keyStore.getOrderlyKey();
      const accountId = account.keyStore.getAccountId(address!);
      account.checkOrderlyKey(address!, orderlyKey!, accountId!);
    }
  }, [isMobile, connectedChain, selectedChainId]);

  return { linkDevice };
}

export function getLinkDeviceData() {
  const url = new URL(window.location.href);
  const link = url.searchParams.get("link");

  if (!link) return;

  const { addr: address, k: key, id: chainId } = decodeBase64(link) || {};

  if (address && key && chainId) {
    return {
      address,
      key,
      chainId,
    };
  }
}

function decodeBase64(base64: string) {
  try {
    const data = JSON.parse(window.atob(base64)) as DecodedData;
    console.log("decodeBase64", data);
    const currentTime = Math.floor(Date.now() / 1000);
    const expiredTime = data.t;

    if (!expiredTime || currentTime > expiredTime) {
      console.error("Orderly key has expired.");
      return;
    }

    return data;
  } catch (error) {
    console.error("Invalid or expired orderly key.");
  }
}
