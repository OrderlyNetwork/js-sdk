import { useMemo } from "react";
import { useSymbolsInfo } from "./orderly/useSymbolsInfo";
import { useAllBrokers } from "./trading-rewards/useAllBrokers";

export interface UseBadgeBySymbolReturn {
  displayName: string;
  brokerId: string | undefined;
  brokerName: string | undefined;
  brokerNameRaw: string | undefined;
}

/**
 * Match the given `symbol` in `symbolsInfo` and return `displayName`, `brokerId`,
 * and the mapped `brokerName`.
 *
 * `brokerName` comes from the `/v1/public/broker/name` broker list
 * (SWR shared cache).
 */
export const useBadgeBySymbol = (symbol: string): UseBadgeBySymbolReturn => {
  const symbolsInfo = useSymbolsInfo();
  const [brokers] = useAllBrokers();

  return useMemo(() => {
    if (!symbol || symbolsInfo.isNil) {
      return {
        displayName: symbol ?? "",
        brokerId: undefined,
        brokerName: undefined,
        brokerNameRaw: undefined,
      };
    }

    const getter = symbolsInfo[symbol];
    const info = typeof getter === "function" ? getter() : undefined;

    const displayName =
      info?.displayName ??
      (info as { display_symbol_name?: string } | undefined)
        ?.display_symbol_name ??
      symbol;

    const brokerId: string | undefined = info?.broker_id ?? undefined;
    const rawBrokerName = brokerId ? brokers?.[brokerId] : undefined;
    const brokerName = rawBrokerName
      ? (() => {
          const primary = rawBrokerName.split(/[ _-]/, 1)[0] ?? "";
          return primary.length > 7 ? `${primary.slice(0, 7)}...` : primary;
        })()
      : undefined;

    return { displayName, brokerId, brokerName, brokerNameRaw: rawBrokerName };
  }, [brokers, symbolsInfo, symbol]);
};
