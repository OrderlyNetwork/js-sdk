import { useEffect } from "react";
import { useParams } from "react-router";
import { TradingPage, type TradingPageProps } from "@orderly.network/trading";
import { tradingPageConfig } from "../../../orderlyConfig";
import { BaseLayout } from "../../components/layout/baseLayout";
import { setPerpSymbol } from "../../perpSymbolStorage";

export type PerpViewProps = Pick<TradingPageProps, "symbol">;

export default function PerpPage() {
  const { symbol } = useParams();
  useEffect(() => {
    if (symbol) setPerpSymbol(symbol);
  }, [symbol]);

  return (
    <BaseLayout>
      <TradingPage
        symbol={symbol!}
        tradingViewConfig={tradingPageConfig.tradingViewConfig}
        sharePnLConfig={tradingPageConfig.sharePnLConfig}
      />
    </BaseLayout>
  );
}
