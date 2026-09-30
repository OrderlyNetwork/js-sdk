import { useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { generatePath } from "@orderly.network/i18n";
import { PredictionPage as PredictionMarketPage } from "@orderly.network/prediction";
import type { API } from "@orderly.network/types";
import { BaseLayout } from "../../components/layout/baseLayout";
import { PathEnum } from "../../constant";

export default function PredictionPage() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const { marketId } = useParams();
  const onPerpSymbolChange = useCallback(
    (market: API.Symbol) => {
      navigate(
        generatePath({ path: `${PathEnum.Perp}/${market.symbol}`, search }),
      );
    },
    [navigate, search],
  );
  const onPredictionMarketChange = useCallback(
    (id: string, replace = false) => {
      navigate(generatePath({ path: `${PathEnum.Prediction}/${id}`, search }), {
        replace,
      });
    },
    [navigate, search],
  );

  return (
    <BaseLayout>
      <PredictionMarketPage
        marketId={marketId}
        onPredictionMarketChange={onPredictionMarketChange}
        onPerpSymbolChange={onPerpSymbolChange}
      />
    </BaseLayout>
  );
}
