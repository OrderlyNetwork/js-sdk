import { useParams } from "react-router";
import { PredictionPage as PredictionMarketPage } from "@orderly.network/prediction";
import { BaseLayout } from "../../components/layout/baseLayout";

export default function PredictionPage() {
  const { symbol } = useParams();
  return (
    <BaseLayout>
      <PredictionMarketPage symbol={symbol} />
    </BaseLayout>
  );
}
