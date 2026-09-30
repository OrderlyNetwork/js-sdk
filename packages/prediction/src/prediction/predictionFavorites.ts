import { useEffect, useRef } from "react";
import { useLocalStorage } from "@orderly.network/hooks";

const LEGACY_MARKET_ID = "PREDICTION_BTC_UP_DOWN_5M";
const BTC_5M_MARKET_ID = "PERP_BTC5M_USDC";

// Prediction markets are identified by family, so a new round keeps its star.
const PREDICTION_FAVORITES_STORAGE_KEY = "orderly_prediction_favorites";

export const usePredictionFavorites = () => {
  const [storedIds, setFavoriteMarketIds] = useLocalStorage<string[]>(
    PREDICTION_FAVORITES_STORAGE_KEY,
    [],
  );
  const favoriteMarketIds: string[] = Array.isArray(storedIds)
    ? storedIds.map((id: string) =>
        id === LEGACY_MARKET_ID ? BTC_5M_MARKET_ID : id,
      )
    : [];
  const hasMigrated = useRef(false);
  useEffect(() => {
    // One-time rewrite of the legacy single-market id; localStorage may hold
    // any shape, so guard the array before touching it.
    if (
      !hasMigrated.current &&
      Array.isArray(storedIds) &&
      storedIds.includes(LEGACY_MARKET_ID)
    ) {
      hasMigrated.current = true;
      setFavoriteMarketIds([...new Set(favoriteMarketIds)]);
    }
  }, [favoriteMarketIds, setFavoriteMarketIds, storedIds]);
  const isFavorite = (marketId: string) => favoriteMarketIds.includes(marketId);
  const toggleFavorite = (marketId: string) => {
    setFavoriteMarketIds(
      isFavorite(marketId)
        ? favoriteMarketIds.filter((id) => id !== marketId)
        : [...favoriteMarketIds, marketId],
    );
  };
  return { favoriteMarketIds, isFavorite, toggleFavorite };
};
