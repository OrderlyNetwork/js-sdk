import type { MarketCategoryConfig } from "@orderly.network/hooks";
import { ARBIcon, StakeIcon } from "../components/icons";

const TAB_ICON_SIZE = 14;

// ---------------------------------------------------------------------------
// Shared symbol lists
// ---------------------------------------------------------------------------

const L1_L2_SYMBOLS = [
  "PERP_ADA_USDC",
  "PERP_APT_USDC",
  "PERP_ARB_USDC",
  "PERP_AR_USDC",
  "PERP_AVAX_USDC",
  "PERP_BCH_USDC",
  "PERP_BLAST_USDC",
  "PERP_BNB_USDC",
  "PERP_BTC_USDC",
  "PERP_ETH_USDC",
  "PERP_FIL_USDC",
  "PERP_FTM_USDC",
  "PERP_HBAR_USDC",
  "PERP_INJ_USDC",
  "PERP_LINK_USDC",
  "PERP_LTC_USDC",
  "PERP_MATIC_USDC",
  "PERP_MERL_USDC",
  "PERP_MODE_USDC",
  "PERP_NEAR_USDC",
  "PERP_OMNI_USDC",
  "PERP_OP_USDC",
  "PERP_POL_USDC",
  "PERP_RUNE_USDC",
  "PERP_SEI_USDC",
  "PERP_SOL_USDC",
  "PERP_STRK_USDC",
  "PERP_SUI_USDC",
  "PERP_TAO_USDC",
  "PERP_TIA_USDC",
  "PERP_TON_USDC",
  "PERP_TRX_USDC",
  "PERP_XRP_USDC",
  "PERP_ZEN_USDC",
  "PERP_ZK_USDC",
  "PERP_ZRO_USDC",
];

const MEME_SYMBOLS = [
  "PERP_1000000MOG_USDC",
  "PERP_1000APU_USDC",
  "PERP_1000BONK_USDC",
  "PERP_1000FLOKI_USDC",
  "PERP_1000PEPE_USDC",
  "PERP_1000SHIB_USDC",
  "PERP_BOME_USDC",
  "PERP_BRETT_USDC",
  "PERP_CHILLGUY_USDC",
  "PERP_DOGE_USDC",
  "PERP_DOGS_USDC",
  "PERP_FARTCOIN_USDC",
  "PERP_GOAT_USDC",
  "PERP_MEW_USDC",
  "PERP_MOODENG_USDC",
  "PERP_NEIRO_USDC",
  "PERP_PENGU_USDC",
  "PERP_PNUT_USDC",
  "PERP_PONKE_USDC",
  "PERP_POPCAT_USDC",
  "PERP_TOSHI_USDC",
  "PERP_TRUMP_USDC",
  "PERP_TURBO_USDC",
  "PERP_VINE_USDC",
  "PERP_WIF_USDC",
  "PERP_ZEREBRO_USDC",
];

const createSymbolMatch = (symbols: string[]) => {
  const symbolSet = new Set(symbols);
  return (market: { symbol: string }) => symbolSet.has(market.symbol);
};

// ---------------------------------------------------------------------------
// Market tabs config (function form)
//   Receives the default built-in tabs as `original` and can modify/extend them.
// ---------------------------------------------------------------------------

export const marketTabs: MarketCategoryConfig = (
  original,
  { componentKey, builtIn },
) => {
  const memeTab = {
    id: "meme",
    name: "Meme",
    icon: <StakeIcon size={TAB_ICON_SIZE} />,
    suffix: "Hot",
    match: createSymbolMatch(MEME_SYMBOLS),
  };
  const l1l2Tab = {
    id: "l1-l2",
    name: "L1 & L2",
    icon: <ARBIcon size={TAB_ICON_SIZE} />,
    match: createSymbolMatch(L1_L2_SYMBOLS),
  };
  const aCoinsTab = {
    id: "a-coins",
    name: "A Coins",
    match: (market: { symbol: string }) =>
      market.symbol.toLowerCase().includes("a"),
  };

  switch (componentKey) {
    case "subMenuMarkets":
      return [...original];

    case "marketsSheet":
      return [builtIn.favorites, memeTab, l1l2Tab, aCoinsTab, builtIn.all];

    case "marketsDataList":
      return [
        builtIn.favorites,
        { ...builtIn.all, name: "All Tokens" },
        l1l2Tab,
        memeTab,
        aCoinsTab,
        builtIn.newListing,
      ];

    case "horizontalMarkets":
      return [builtIn.favorites, aCoinsTab, builtIn.all, l1l2Tab, memeTab];

    default:
      // Append custom categories to default tabs
      return [...original, l1l2Tab, memeTab, aCoinsTab];
  }
};
