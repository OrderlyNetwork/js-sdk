import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { generatePath } from "@veltodefi/i18n";
import { TradingPage, TradingPageProps } from "@veltodefi/trading";
import { API } from "@veltodefi/types";
import { tradingPageConfig } from "../../../orderlyConfig";
import { BaseLayout } from "../../components/layout/baseLayout";
import { PathEnum } from "../../constant";
import { updateSymbol } from "../../storage";

export type PerpViewProps = Pick<TradingPageProps, "symbol">;

export default function PerpPage() {
  const params = useParams();
  const [symbol, setSymbol] = useState(params.symbol!);
  const navigate = useNavigate();

  useEffect(() => {
    updateSymbol(symbol);
  }, [symbol]);

  const onSymbolChange = useCallback(
    (data: API.Symbol) => {
      const symbol = data.symbol;
      setSymbol(symbol);
      navigate(generatePath({ path: `${PathEnum.Perp}/${symbol}` }));
    },
    [navigate],
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
        tradingViewConfig={tradingPageConfig.tradingViewConfig}
        sharePnLConfig={tradingPageConfig.sharePnLConfig}
      />
    </BaseLayout>
  );
}
