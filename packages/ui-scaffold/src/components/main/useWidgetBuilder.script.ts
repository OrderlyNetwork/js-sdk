import { useState } from "react";
import { useScaffoldContext } from "../scaffoldContext";
import { useWalletConnector } from "@orderly.network/hooks";

type MainNavItem = {
  name: string;
  href: string;
};

export const useMainNavBuilder = () => {
  const [current, setCurrent] = useState("/");
  const { unsupported } = useScaffoldContext();
  const { connectedChain } = useWalletConnector();
  return {
    logo: {
      src: "https://testnet-dex-evm.woo.org/images/woofipro.svg",
      alt: "woofipro",
    },
    items: [
      { name: "Trading", href: "/" },
      { name: "Portfolio", href: "/portfolio" },
    ],
    products: {
      products: [
        { name: "Swap", id: "swap" },
        { name: "Trade", id: "trade" },
      ],
      current: "swap",
    },
    current,
    onItemClick: (item: MainNavItem) => {
      setCurrent(item.href);
    },
    isUnsupported: unsupported,
    isConnected: !!connectedChain,
  };
};

export type MainNavBuilder = ReturnType<typeof useMainNavBuilder>;
