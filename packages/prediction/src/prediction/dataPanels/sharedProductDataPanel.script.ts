import { useState } from "react";
import { usePositionStream } from "@orderly.network/hooks";
import { useDataTap } from "@orderly.network/react-app";
import { isBinarySymbol } from "../binary/binaryInfo";

export type ProductDataType = "positions" | "positionHistory";
export type ProductType = "perps" | "prediction";

export type UseSharedProductDataPanelScriptArgs = {
  initialProduct: ProductType;
  predictionPositionCount: number;
  perpsSymbol?: string;
  onProductChange?: (product: ProductType) => void;
};

export const useSharedProductDataPanelScript = ({
  initialProduct,
  predictionPositionCount,
  perpsSymbol,
  onProductChange,
}: UseSharedProductDataPanelScriptArgs) => {
  const [product, setProduct] = useState<ProductType>(initialProduct);
  const [perpsPositions] = usePositionStream();
  // Binary rows ride the same position stream (api-spec §6.2) but belong to
  // the prediction tab's own count.
  const perpsPositionCount =
    useDataTap(
      perpsPositions.rows?.filter(
        (row) =>
          !isBinarySymbol(row.symbol) &&
          row.position_qty !== 0 &&
          (!perpsSymbol || row.symbol === perpsSymbol),
      ).length,
    ) ?? 0;

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
