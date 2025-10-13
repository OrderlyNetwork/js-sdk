import { MarketsHomePage } from "@kodiak-finance/orderly-markets";
import { BaseLayout } from "../../components/layout/baseLayout";
import { PathEnum } from "../../constant";

export default function MarketsPage() {
  return (
    <BaseLayout initialMenu={PathEnum.Markets}>
      <MarketsHomePage />
    </BaseLayout>
  );
}
