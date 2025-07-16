import { FC } from "react";
import { Button, cn } from "@orderly.network/ui";

export type ProductItem = {
  name: string;
  href: string;
};

export const ProductItem: FC<{
  item: ProductItem;
  active?: boolean;
  onClick?: (product: ProductItem) => void;
}> = (props) => {
  const { active, item, onClick } = props;
  return (
    <Button
      variant={active ? "gradient" : "text"}
      color="secondary"
      size="sm"
      angle={45}
      className={cn(
        active ? "oui-text-[rgba(0_,_0_,_0_,_0.88)]" : "hover:oui-bg-base-7",
      )}
      onClick={() => {
        onClick?.(item);
      }}
    >
      {item.name}
    </Button>
  );
};
