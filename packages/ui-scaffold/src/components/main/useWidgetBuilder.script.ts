import { useState } from "react";

type MainNavItem = {
  name: string;
  href: string;
};

export const useMainNavBuilder = () => {
  const [current, setCurrent] = useState("/");
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
  };
};

export type MainNavBuilder = ReturnType<typeof useMainNavBuilder>;
