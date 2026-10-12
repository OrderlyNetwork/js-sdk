import React, { useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  SharedProductDataPanel,
  usePredictionAccountData,
  ManagedPredictionPositions,
} from "@orderly.network/prediction";
import { formatAddress, Text } from "@orderly.network/ui";

export const PortfolioProductPositionsPanel: React.FC<{
  type: "positions" | "positionHistory";
  perpsContent: React.ReactNode;
  accountFilter: React.ReactNode;
  selectedAccount?: string;
}> = ({ type, perpsContent, accountFilter, selectedAccount }) => {
  const { t } = useTranslation();
  const [product, setProduct] = useState<"perps" | "prediction">("perps");
  const state = usePredictionAccountData();

  return (
    <SharedProductDataPanel
      state={state}
      type={type}
      initialProduct="perps"
      showPositionCounts={false}
      onProductChange={setProduct}
      beforeProductSelector={
        product === "perps" || type === "positions" ? (
          accountFilter
        ) : (
          <Text size="xs" color="neutral">
            {t("prediction.currentAccount")}
            {state.accountId && `: ${formatAddress(state.accountId)}`}
          </Text>
        )
      }
      perpsPositionsContent={perpsContent}
      predictionPositionsContent={
        type === "positions" && selectedAccount ? (
          <ManagedPredictionPositions
            key={selectedAccount}
            state={state}
            selectedAccount={selectedAccount}
          />
        ) : undefined
      }
      perpsPositionHistoryContent={perpsContent}
    />
  );
};
