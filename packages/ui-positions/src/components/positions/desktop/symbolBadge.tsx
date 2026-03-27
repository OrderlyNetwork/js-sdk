import { useBadgeBySymbol } from "@orderly.network/hooks";
import { SymbolBadge as UISymbolBadge } from "@orderly.network/ui";

export const SymbolBadge = ({ symbol }: { symbol: string }) => {
  const { brokerId, brokerName, brokerNameRaw } = useBadgeBySymbol(symbol);
  const badge = brokerName ?? brokerId ?? undefined;
  return <UISymbolBadge badge={badge} fullName={brokerNameRaw} />;
};
