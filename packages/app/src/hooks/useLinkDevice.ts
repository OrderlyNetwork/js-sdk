import { useCallback, useEffect } from "react";
import { Ed25519PublicKey } from "@mysten/sui/keypairs/ed25519";
import {
  normalizeSuiPublicKeyToBase58,
  normalizeSuiPublicKeyToBytes,
} from "@orderly.network/core";
import {
  parseJSON,
  useAccount,
  useConfig,
  useLocalStorage,
  useWalletConnector,
} from "@orderly.network/hooks";
import { ChainNamespace } from "@orderly.network/types";
import { useScreen } from "@orderly.network/ui";

type DecodedData = {
  /** secret key */
  k: string;
  /* timestamp */
  t: number;
  /** address for EVM/Solana, Ed25519 public key for Sui */
  a: string;
  /** chain id */
  i: number;
  /** chain namespace */
  n: ChainNamespace;
};

type LinkDeviceStorage = { chainId: number; chainNamespace: ChainNamespace };

const WALLET_KEY = "orderly:wallet-info";

export function useLinkDevice() {
  const { connectedChain, disconnect } = useWalletConnector();
  const [_, setLinkDeviceStorage] = useLocalStorage(
    "orderly_link_device",
    {} as LinkDeviceStorage,
  );

  const { account } = useAccount();
  const { isMobile } = useScreen();
  const configStore = useConfig();

  const onDisconnect = async (label: string) => {
    // The cache must be cleared first, otherwise it will be auto connect wallet
    localStorage.removeItem(WALLET_KEY);
    await account.disconnect();
    await disconnect({ label });
  };

  useEffect(() => {
    const linkData = getLinkDeviceData();
    const walletInfo = JSON.parse(localStorage.getItem(WALLET_KEY) ?? "{}");
    if (linkData && walletInfo) {
      // clear connect data when link device
      onDisconnect(walletInfo.label);
    }
  }, []);

  const linkDevice = async () => {
    const linkData = getLinkDeviceData();
    if (!linkData) return;

    const { address, secretKey, chainId, chainNamespace, publicKey } = linkData;
    const isSuccess = await account.importOrderlyKey({
      address,
      secretKey,
      chainNamespace,
      publicKey,
    });
    if (!isSuccess) return;
    setLinkDeviceStorage({
      chainId,
      chainNamespace,
    });

    const url = new URL(window.location.href);
    url.searchParams.delete("link");
    // use set instead of append, because the param possibly in the url
    url.searchParams.set("utm_medium", "qrcode");
    const decodedUrl = decodeURIComponent(url.toString());
    history.replaceState(null, "", decodedUrl);
  };

  useEffect(() => {
    if (isMobile && !connectedChain) {
      linkDevice();
    }
  }, [account, connectedChain, isMobile]);

  const autoLinkDevice = async () => {
    // this can't use the value returned by useLocalStorage here, because it will trigger extra state change
    const { chainId, chainNamespace } = getLinkDeviceStorage() || {};
    if (isMobile && !connectedChain && chainId && chainNamespace) {
      const address = account.keyStore.getAddress();
      const orderlyKey = account.keyStore.getOrderlyKey();
      const accountId = account.keyStore.getAccountId(address!);
      const res = await account.checkOrderlyKey(
        address!,
        orderlyKey!,
        accountId!,
      );
      if (res) {
        configStore.set("chainNamespace", chainNamespace);
      }
    }
  };

  // persist status when refresh page
  useEffect(() => {
    autoLinkDevice();
  }, [account, isMobile, connectedChain]);

  return { linkDevice };
}

function getLinkDeviceStorage() {
  try {
    const linkDeviceStorage = localStorage.getItem("orderly_link_device");
    const json = linkDeviceStorage ? parseJSON(linkDeviceStorage) : null;
    return json as LinkDeviceStorage;
  } catch (err) {
    console.error("getLinkDeviceStorage", err);
  }
}

export function getLinkDeviceData() {
  const url = new URL(window.location.href);
  const link = url.searchParams.get("link");

  if (!link) return;

  const {
    a: identity,
    k: secretKey,
    i: chainId,
    n: chainNamespace,
  } = decodeBase64(link) || {};

  if (identity && secretKey && chainId && chainNamespace) {
    const { address, publicKey } = parseLinkDeviceIdentity(
      identity,
      chainNamespace,
    );
    if (!address) return;

    return {
      address,
      secretKey,
      chainId,
      chainNamespace,
      publicKey,
    };
  }
}

function parseLinkDeviceIdentity(
  identity: string,
  chainNamespace: ChainNamespace,
) {
  if (chainNamespace !== ChainNamespace.sui) {
    return { address: identity, publicKey: undefined };
  }

  const publicKey = normalizeSuiPublicKeyToBase58(identity);
  const rawPublicKey = normalizeSuiPublicKeyToBytes(identity);
  if (!publicKey || !rawPublicKey) {
    console.error("Invalid Sui public key in link device payload.");
    return { address: undefined, publicKey: undefined };
  }

  return {
    address: new Ed25519PublicKey(rawPublicKey).toSuiAddress(),
    publicKey,
  };
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
