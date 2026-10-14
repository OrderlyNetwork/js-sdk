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
  /** Selects the record's market and round when a Prediction row is clicked. */
  onPredictionSelect?: (symbol: string) => void;
}> = ({
  type,
  perpsContent,
  accountFilter,
  selectedAccount,
  onPredictionSelect,
}) => {
  const { t } = useTranslation();
  const [product, setProduct] = useState<"perps" | "prediction">("perps");
  const accountState = usePredictionAccountData();
  // Prediction rows navigate to their round the same way the prediction page
  // injects the callback; Perps rows navigate through the injected perpsContent.
  const state = { ...accountState, onSelectRoundSymbol: onPredictionSelect };

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
