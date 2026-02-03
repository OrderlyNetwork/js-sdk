import { useCallback } from "react";
import { MarketsHomePage } from "@orderly.network/markets";
import { API } from "@orderly.network/types";
import { BaseLayout } from "../../components/layout/baseLayout";
import { PathEnum } from "../../constant";
import { useNav } from "../../hooks/useNav";
import { updateSymbol } from "../../storage";

export default function MarketsPage() {
  const { onRouteChange } = useNav();

  const onSymbolChange = useCallback(
    (data: API.Symbol) => {
      const symbol = data.symbol;
      updateSymbol(symbol);
      onRouteChange({ href: `${PathEnum.Perp}/${symbol}`, name: "perps" });
    },
    [onRouteChange],
  );

  return (
    <BaseLayout initialMenu={PathEnum.Markets}>
      <MarketsHomePage onSymbolChange={onSymbolChange} />
    </BaseLayout>
  );
}
