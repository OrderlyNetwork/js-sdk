import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { TradingPage, TradingPageProps } from "@orderly.network/trading";
import { API } from "@orderly.network/types";
import { useOrderlyConfig } from "../../../hooks/useOrderlyConfig";
import { BaseLayout } from "../../components/layout/baseLayout";
import { PathEnum } from "../../constant";
import { updateSymbol } from "../../storage";
import { generateLocalePath } from "../../utils";

export type PerpViewProps = Pick<TradingPageProps, "symbol">;

export default function PerpPage() {
  const params = useParams();
  const [symbol, setSymbol] = useState(params.symbol!);
  const navigate = useNavigate();
  const config = useOrderlyConfig();

  useEffect(() => {
    updateSymbol(symbol);
  }, [symbol]);

  const onSymbolChange = useCallback(
    (data: API.Symbol) => {
      const symbol = data.symbol;
      setSymbol(symbol);
      navigate(generateLocalePath(`${PathEnum.Perp}/${symbol}`));
    },
    [navigate],
  );

  return (
    <BaseLayout>
      <TradingPage
        symbol={symbol}
        onSymbolChange={onSymbolChange}
        tradingViewConfig={config.tradingPage.tradingViewConfig}
        sharePnLConfig={config.tradingPage.sharePnLConfig}
      />
    </BaseLayout>
  );
}
