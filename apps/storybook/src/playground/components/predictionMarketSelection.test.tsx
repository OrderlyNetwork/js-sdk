import { act, create } from "react-test-renderer";
import { expect, it, vi } from "vitest";
import type { PredictionMarket } from "@orderly.network/prediction";
import { PredictionMarketPanel } from "@orderly.network/prediction/src/prediction/predictionMarketPanel.ui";

vi.mock("@orderly.network/i18n", () => ({
  i18n: { t: (key: string) => key },
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@orderly.network/markets", () => ({
  FavoritesIcon2: () => null,
  UnFavoritesIcon2: () => null,
  useMarketCategories: () => [],
  useMarketsContext: () => ({ searchValue: "" }),
}));
vi.mock("@orderly.network/ui", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
  Spinner: () => null,
  Text: ({ children }: { children: React.ReactNode }) => children,
  TokenIcon: () => null,
}));
vi.mock(
  "@orderly.network/prediction/src/prediction/binary/useBinaryBbo",
  () => ({ useBinaryBboMap: () => ({}) }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/hooks/useRoundCountdown",
  () => ({ useRoundCountdown: () => 60 }),
);
it("reports the real round symbol while favorites retain the market family ID", () => {
  const market = {
    id: "PERP_BTC5M_USDC",
    base: "BTC",
    period: "5M",
    indexPriceSymbol: "PERP_BTC_USDC",
    currentRow: { symbol: "PERP_BTC5M2609291035_USDC", expire_at: 1 },
  } as PredictionMarket;
  const onSelect = vi.fn();
  const onToggleFavorite = vi.fn();
  let root: ReturnType<typeof create>;
  act(() => {
    root = create(
      <PredictionMarketPanel
        markets={[market]}
        bbos={{}}
        favoriteMarketIds={[]}
        onToggleFavorite={onToggleFavorite}
        onSelect={onSelect}
      />,
    );
  });
  root!.root.findAllByType("tr")[1].props.onClick();
  expect(onSelect).toHaveBeenCalledExactlyOnceWith(market.currentRow.symbol);
  root!.root.findByType("button").props.onClick({ stopPropagation: () => {} });
  expect(onToggleFavorite).toHaveBeenCalledExactlyOnceWith(market.id);
  act(() => root!.unmount());
});
