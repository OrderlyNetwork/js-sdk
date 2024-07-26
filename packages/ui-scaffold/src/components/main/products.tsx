import { FC, useMemo } from "react";

import { ProductItem } from "./productItem";
import { Flex } from "@orderly.network/ui";

export type ProductsProps = {
  items?: ProductItem[];
  current?: string;
  onItemClick?: (product: ProductItem) => void;
};

export const ProductsMenu: FC<ProductsProps> = (props) => {
  const { items, onItemClick, current } = props;
  const currentItem = useMemo(() => {
    if (typeof current !== "undefined") return current;

    return items?.[0]?.href;
  }, [current, items]);

  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <Flex gap={0} border r="md" className="oui-p-[1px]" borderColor={12}>
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
};
