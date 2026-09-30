import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { generatePath } from "@orderly.network/i18n";
import { registerLayoutSplitPlugin } from "@orderly.network/layout-split";
import {
  MobileSharedProductHistory,
  MobileSharedProductOrdersPanel,
  SharedProductDataPanel,
  SharedProductOrdersPanel,
  usePredictionMarketsDropdown,
  useSharedProductCounts,
  useSharedPredictionState,
} from "@orderly.network/prediction";
import {
  TradingPage,
  TradingPageProps,
  useTradingLocalStorage,
} from "@orderly.network/trading";
import { API } from "@orderly.network/types";
import { OrderlyPluginProvider } from "@orderly.network/ui";
import { tradingPageConfig } from "../../../orderlyConfig";
import { BaseLayout } from "../../components/layout/baseLayout";
import { PathEnum } from "../../constant";
import { updateSymbol } from "../../storage";

export type PerpViewProps = Pick<TradingPageProps, "symbol">;

export default function PerpPage() {
  const params = useParams();
  const [symbol, setSymbol] = useState(params.symbol!);
  const { search } = useLocation();
  const navigate = useNavigate();
  const predictionState = useSharedPredictionState();
  const { showAllSymbol } = useTradingLocalStorage();
  const scopedSymbol = showAllSymbol ? undefined : symbol;
  const counts = useSharedProductCounts(
    predictionState,
    scopedSymbol,
    scopedSymbol,
  );
  const onPredictionSelect = useCallback(
    (marketId: string) => {
      navigate(
        generatePath({ path: `${PathEnum.Prediction}/${marketId}`, search }),
      );
    },
    [navigate, search],
  );
  const marketsDropdown = usePredictionMarketsDropdown(
    predictionState,
    onPredictionSelect,
  );

  useEffect(() => {
    updateSymbol(symbol);
  }, [symbol]);

  const onSymbolChange = useCallback(
    (data: API.Symbol) => {
      const symbol = data.symbol;
      setSymbol(symbol);
      navigate(generatePath({ path: `${PathEnum.Perp}/${symbol}`, search }));
    },
    [navigate, search],
  );

  useEffect(() => {
    if (params.symbol && params.symbol !== symbol) {
      setSymbol(params.symbol);
    }
  }, [params.symbol]);

  return (
    <BaseLayout>
      <TradingPage
        symbol={symbol}
        onSymbolChange={onSymbolChange}
        marketsDropdown={marketsDropdown}
        tradingViewConfig={tradingPageConfig.tradingViewConfig}
        sharePnLConfig={tradingPageConfig.sharePnLConfig}
        dataListProductContent={
          predictionState
            ? {
                counts,
                positions: (perpsPositionsContent) => (
                  <SharedProductDataPanel
                    state={predictionState}
                    type="positions"
                    initialProduct="perps"
                    perpsSymbol={scopedSymbol}
                    predictionUnderlyingSymbol={scopedSymbol}
                    perpsPositionsContent={perpsPositionsContent}
                  />
                ),
                pending: (
                  <SharedProductOrdersPanel
                    state={predictionState}
                    mode="pending"
                    perpsSymbol={scopedSymbol}
                    predictionUnderlyingSymbol={scopedSymbol}
                  />
                ),
                filled: (
                  <SharedProductOrdersPanel
                    state={predictionState}
                    mode="filled"
                    perpsSymbol={scopedSymbol}
                    predictionUnderlyingSymbol={scopedSymbol}
                  />
                ),
                positionHistory: (
                  <SharedProductDataPanel
                    state={predictionState}
                    type="positionHistory"
                    initialProduct="perps"
                    perpsSymbol={scopedSymbol}
                    predictionUnderlyingSymbol={scopedSymbol}
                  />
                ),
                orderHistory: (
                  <SharedProductOrdersPanel
                    state={predictionState}
                    mode="history"
                    perpsSymbol={scopedSymbol}
                    predictionUnderlyingSymbol={scopedSymbol}
                  />
                ),
                mobile: {
                  positions: (perpsPositionsContent) => (
                    <SharedProductDataPanel
                      state={predictionState}
                      type="positions"
                      initialProduct="perps"
                      mobile
                      perpsSymbol={scopedSymbol}
                      predictionUnderlyingSymbol={scopedSymbol}
                      perpsPositionsContent={perpsPositionsContent}
                    />
                  ),
                  pending: (
                    <MobileSharedProductOrdersPanel
                      state={predictionState}
                      mode="pending"
                      perpsSymbol={scopedSymbol}
                      predictionUnderlyingSymbol={scopedSymbol}
                    />
                  ),
                  history: (
                    <MobileSharedProductHistory
                      state={predictionState}
                      initialProduct="perps"
                      perpsSymbol={scopedSymbol}
                      predictionUnderlyingSymbol={scopedSymbol}
                    />
                  ),
                },
              }
            : undefined
        }
      />
    </BaseLayout>
  );
}
