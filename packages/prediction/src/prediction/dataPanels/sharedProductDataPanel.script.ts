import { useState } from "react";
import { useAccount, usePositionStream } from "@orderly.network/hooks";
import { useDataTap } from "@orderly.network/react-app";
import { AccountStatusEnum } from "@orderly.network/types";
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
  const { state: account } = useAccount();
  const accountReady =
    account.status >= AccountStatusEnum.EnableTrading ||
    account.status === AccountStatusEnum.EnableTradingWithoutConnected;
  const [perpsPositions] = usePositionStream();
  // Binary rows ride the same position stream (api-spec §6.2) but belong to
  // the prediction tab's own count.
  // The store may retain rows after disconnect (OR-7457); keep the count at 0
  // until private data is reachable again.
  const perpsPositionCount =
    useDataTap(
      accountReady
        ? perpsPositions.rows?.filter(
            (row) =>
              !isBinarySymbol(row.symbol) &&
              row.position_qty !== 0 &&
              (!perpsSymbol || row.symbol === perpsSymbol),
          ).length
        : 0,
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
