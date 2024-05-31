import { FC } from "react";
import { Button } from "../../button";

export type ProductItem = {
  name: string;
  id: string;
};

export const ProductItem: FC<{
  item: ProductItem;
  active?: boolean;
  onClick: (product: ProductItem) => void;
}> = (props) => {
  const { active, item, onClick } = props;
  return (
    <Button
      variant={active ? "gradient" : "text"}
      color="secondary"
      size="md"
      angle={45}
      onClick={() => {
        onClick?.(item);
      }}
    >
      {item.name}
    </Button>
  );
};
