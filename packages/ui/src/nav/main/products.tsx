import { FC, useMemo } from "react";
import { Flex } from "../../flex";
import { ProductItem } from "./productItem";

export type ProductsProps = {
  products?: ProductItem[];
  current?: string;
  onItemClick?: (product: ProductItem) => void;
};

export const ProductsMenu: FC<ProductsProps> = (props) => {
  const { products, onItemClick, current } = props;
  const currentItem = useMemo(() => {
    if (typeof current !== "undefined") return current;

    return products?.[0]?.id;
  }, [current, products]);
  return (
    <Flex gap={0} border r="md" className="oui-p-[1px]" borderColor={12}>
      {products?.map((product, index) => {
        return (
          <ProductItem
            key={index}
            item={product}
            onClick={onItemClick}
            active={currentItem == product.id}
          />
        );
      })}
    </Flex>
  );
};
