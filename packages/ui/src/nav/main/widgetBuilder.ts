import { useState } from "react";

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
    onItemClick: (item) => {
      setCurrent(item.href);
    },
  };
};
