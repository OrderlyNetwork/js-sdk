import { useMemo } from "react";
import { useLocation } from "react-router";
import { removeLangPrefix } from "@kodiak-finance/orderly-i18n";

/**
 * Get the pathname without the language prefix
 * /en/perp/PERP_BTC_USDC => /perp/PERP_BTC_USDC
 * /en/markets => /markets
 */
export function usePathWithoutLang() {
  const location = useLocation();
  const pathname = location.pathname;

  return useMemo(() => removeLangPrefix(pathname), [pathname]);
}
