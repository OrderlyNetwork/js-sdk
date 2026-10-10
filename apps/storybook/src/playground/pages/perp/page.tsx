import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { generatePath } from "@orderly.network/i18n";
import { usePredictionTradingExtension } from "@orderly.network/prediction";
import {
  TradingPage,
  TradingPageProps,
  useTradingLocalStorage,
} from "@orderly.network/trading";
import { API } from "@orderly.network/types";
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
  const { showAllSymbol, pnlNotionalDecimalPrecision } =
    useTradingLocalStorage();
  const onPredictionSelect = useCallback(
    (marketId: string) => {
      navigate(
        generatePath({ path: `${PathEnum.Prediction}/${marketId}`, search }),
      );
    },
    [navigate, search],
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

  const predictionExtension = usePredictionTradingExtension({
    symbol,
    showAllSymbol,
    onPredictionSelect,
    onSymbolChange,
    sharePnLConfig: tradingPageConfig.sharePnLConfig,
    pnlNotionalDecimalPrecision,
  });

  useEffect(() => {
    if (params.symbol && params.symbol !== symbol) {
      setSymbol(params.symbol);
    }
  }, [params.symbol]);

  return (
    <BaseLayout>
      <TradingPage
        {...predictionExtension}
        symbol={symbol}
        onSymbolChange={onSymbolChange}
        tradingViewConfig={tradingPageConfig.tradingViewConfig}
        sharePnLConfig={tradingPageConfig.sharePnLConfig}
      />
    </BaseLayout>
  );
}
