import { useLocalStorage } from "@orderly.network/hooks";

const RISK_NOTICE_DISMISSED_KEY_PREFIX = "orderly_risk_notice_dismissed";

export function useSymbolInfoBarRiskNoticeDismissal(
  symbol: string,
  isPreTge?: boolean,
) {
  const marketType = isPreTge ? "pre-launch" : "community";
  const dismissalKey = `${RISK_NOTICE_DISMISSED_KEY_PREFIX}:${marketType}:${symbol}`;
  return useLocalStorage<boolean>(dismissalKey, false);
}
