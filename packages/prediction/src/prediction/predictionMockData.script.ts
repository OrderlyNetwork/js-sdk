import { useLocalStorage } from "@orderly.network/hooks";

// Prototype-only mock market data and persistence. Real market wiring
// replaces this module without touching the UI components.

export const PREDICTION_MARKET_ID = "PREDICTION_BTC_UP_DOWN_5M";

export const PREDICTION_MARKET_VOLUME = 6_117_054;

// Prototype only: replace this independent storage with the shared favorite
// service once prediction markets are supported by the markets data source.
const PREDICTION_FAVORITES_STORAGE_KEY = "orderly_prediction_favorites";

export const usePredictionFavorites = () => {
  const [favoriteMarketIds, setFavoriteMarketIds] = useLocalStorage<string[]>(
    PREDICTION_FAVORITES_STORAGE_KEY,
    [],
  );
  const isFavorite = favoriteMarketIds.includes(PREDICTION_MARKET_ID);
  const toggleFavorite = () => {
    setFavoriteMarketIds(
      isFavorite
        ? favoriteMarketIds.filter((id) => id !== PREDICTION_MARKET_ID)
        : [...favoriteMarketIds, PREDICTION_MARKET_ID],
    );
  };
  return { isFavorite, toggleFavorite };
};
