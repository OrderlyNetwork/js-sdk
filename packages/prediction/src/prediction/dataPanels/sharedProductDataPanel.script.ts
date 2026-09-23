import { useState } from "react";
import { usePositionStream } from "@orderly.network/hooks";
import { useDataTap } from "@orderly.network/react-app";

export type ProductDataType = "positions" | "positionHistory";
export type ProductType = "perps" | "prediction";

export type UseSharedProductDataPanelScriptArgs = {
  initialProduct: ProductType;
  predictionPositionCount: number;
  onProductChange?: (product: ProductType) => void;
};

export const useSharedProductDataPanelScript = ({
  initialProduct,
  predictionPositionCount,
  onProductChange,
}: UseSharedProductDataPanelScriptArgs) => {
  const [product, setProduct] = useState<ProductType>(initialProduct);
  const [perpsPositions] = usePositionStream();
  const perpsPositionCount = useDataTap(perpsPositions.rows?.length) ?? 0;

  const selectProduct = (next: ProductType) => {
    setProduct(next);
    onProductChange?.(next);
  };

  return {
    product,
    selectProduct,
    perpsPositionCount,
    predictionPositionCount,
  };
};

export type SharedProductDataPanelScript = ReturnType<
  typeof useSharedProductDataPanelScript
>;
