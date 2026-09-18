import { useCallback } from "react";
import { useNavigate } from "react-router";
import { generatePath } from "@orderly.network/i18n";
import { PositionsModule } from "@orderly.network/portfolio";
import {
  SharedProductDataPanel,
  useSharedPredictionState,
} from "@orderly.network/prediction";
import { useTradingLocalStorage } from "@orderly.network/trading";
import { API } from "@orderly.network/types";
import { Box } from "@orderly.network/ui";
import { tradingPageConfig } from "../../../../orderlyConfig";
import { PathEnum } from "../../../constant";
import { updateSymbol } from "../../../storage";

export default function PositionsPage() {
  const local = useTradingLocalStorage();
  const navigate = useNavigate();
  const predictionState = useSharedPredictionState();

  const onSymbolChange = useCallback(
    (data: API.Symbol) => {
      const symbol = data.symbol;
      updateSymbol(symbol);
      navigate(generatePath({ path: `${PathEnum.Perp}/${symbol}` }));
    },
    [navigate],
  );

  return (
    <Box
      p={6}
      pb={0}
      intensity={900}
      r="xl"
      width="100%"
      style={{
        minHeight: 379,
        maxHeight: 2560,
        overflow: "hidden",
        // Make the table scroll instead of the page scroll
        height: "calc(100vh - 48px - 29px - 48px)",
      }}
    >
      <PositionsModule.PositionsPage
        sharePnLConfig={tradingPageConfig.sharePnLConfig}
        pnlNotionalDecimalPrecision={local.pnlNotionalDecimalPrecision}
        calcMode={local.unPnlPriceBasis}
        onSymbolChange={onSymbolChange}
        positionProductContent={(perpsContent) =>
          predictionState ? (
            <SharedProductDataPanel
              state={predictionState}
              type="positions"
              initialProduct="perps"
              perpsPositionsContent={perpsContent}
            />
          ) : (
            perpsContent
          )
        }
        positionHistoryProductContent={(perpsContent) =>
          predictionState ? (
            <SharedProductDataPanel
              state={predictionState}
              type="positionHistory"
              initialProduct="perps"
              perpsPositionHistoryContent={perpsContent}
            />
          ) : (
            perpsContent
          )
        }
      />
    </Box>
  );
}
