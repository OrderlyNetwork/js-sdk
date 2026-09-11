import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Box, Divider, Flex, Text } from "@orderly.network/ui";
import type { PredictionDataTab } from "../prediction/prediction.script";
import {
  PredictionDataPanel,
  PredictionPlayground,
} from "../prediction/prediction.ui";
import type { PredictionPortfolioState } from "./predictionPortfolio.script";

const portfolioPredictionTabs: PredictionDataTab[] = [
  "predictions",
  "predictionHistory",
];

export const PredictionPortfolio: React.FC<PredictionPortfolioState> = (
  state,
) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] =
    React.useState<PredictionDataTab>("predictions");

  return (
    <Flex
      className="oui-prediction-portfolio"
      direction="column"
      itemAlign="start"
      gap={4}
      width="100%"
      height="100%"
    >
      <Flex>
        <Text size="lg">{t("prediction.tab.predictions")}</Text>
      </Flex>
      <Divider className="oui-w-full" />
      <Box width="100%" className="oui-h-[calc(100%_-_59px)]">
        <PredictionDataPanel
          state={{ ...state, activeTab, setActiveTab }}
          tabs={portfolioPredictionTabs}
          embedded
          className="oui-prediction-portfolio-dataPanel"
        />
      </Box>
      <PredictionPlayground
        roundView={state.roundView}
        setRoundView={state.setRoundView}
        roundPhase={state.roundPhase}
        setRoundPhase={state.setRoundPhase}
        prototypeAuthState={state.prototypeAuthState}
        setPrototypeAuthState={state.setPrototypeAuthState}
        prototypeRegionState={state.prototypeRegionState}
        setPrototypeRegionState={state.setPrototypeRegionState}
      />
    </Flex>
  );
};
