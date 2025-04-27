import { cn } from "@orderly.network/ui";

import { Flex } from "@orderly.network/ui";
import { ProductItem } from "./productItem";
import { useState } from "react";

export function CustomProductNav() {
  const items = [
    { name: "Swap", href: "/swap" },
    { name: "Perps", href: "/perps" },
  ];
  const [currentItem, setCurrentItem] = useState<string>("/perps");

  const onItemClick = (item: ProductItem) => {
    if (item.href === "/swap") {
      // swap url
      window.open("https://app.orderly.network", "_blank");
      return;
    }
  };

  return (
    <Flex gap={0} border r="md" className={cn("oui-p-[1px]")} borderColor={12}>
      {items?.map((product, index) => {
        return (
          <ProductItem
            key={index}
            item={product}
            onClick={onItemClick}
            active={currentItem == product.href}
          />
        );
      })}
    </Flex>
  );
}
