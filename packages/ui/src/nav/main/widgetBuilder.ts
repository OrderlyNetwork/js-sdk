import { useState } from "react";

export const useMainNavBuilder = () => {
  const [current, setCurrent] = useState("/");
  return {
    items: [
      { label: "Trading", href: "/" },
      { label: "Portfolio", href: "/portfolio" },
    ],
    current,
    onItemClick: (item) => {
      setCurrent(item.href);
    },
  };
};
