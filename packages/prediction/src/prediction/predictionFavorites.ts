import { useCallback, useEffect, useRef } from "react";
import { useLocalStorage } from "@orderly.network/hooks";

const LEGACY_MARKET_ID = "PREDICTION_BTC_UP_DOWN_5M";
const BTC_5M_MARKET_ID = "PERP_BTC5M_USDC";

// Prediction markets are identified by family, so a new round keeps its star.
const PREDICTION_FAVORITES_STORAGE_KEY = "orderly_prediction_favorites";

const migrateMarketId = (id: string) =>
  id === LEGACY_MARKET_ID ? BTC_5M_MARKET_ID : id;

export const usePredictionFavorites = () => {
  const [storedIds, setFavoriteMarketIds] = useLocalStorage<string[]>(
    PREDICTION_FAVORITES_STORAGE_KEY,
    [],
  );
  const favoriteMarketIds: string[] = Array.isArray(storedIds)
    ? storedIds.map(migrateMarketId)
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
  // Memoized market rows compare this handler by identity, so keep it stable
  // across page ticks: the latest ids are read through a ref, and the setter
  // only changes identity when the stored value actually changes.
  const favoriteIdsRef = useRef(favoriteMarketIds);
  useEffect(() => {
    favoriteIdsRef.current = favoriteMarketIds;
  });
  const toggleFavorite = useCallback(
    (marketId: string) => {
      const ids = favoriteIdsRef.current;
      setFavoriteMarketIds(
        ids.includes(marketId)
          ? ids.filter((id) => id !== marketId)
          : [...ids, marketId],
      );
    },
    [setFavoriteMarketIds],
  );
  return { favoriteMarketIds, isFavorite, toggleFavorite };
};
