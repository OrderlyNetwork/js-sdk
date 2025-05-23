import { useEffect, useState } from "react";
import {
  useWSInstance,
  swr,
  useMarkPricesStream,
  useSymbolsInfo,
  useIndexPricesStream,
  useFundingRatesStore,
} from "@orderly.network/hooks";
import { API, WSMessage } from "@orderly.network/types";
import { camelCaseToUnderscoreCase } from "@orderly.network/utils";
import { formatPortfolio, Portfolio } from "../calculator/portfolio";
import {
  calcByPrice,
  formatPositions,
  POSITION_EMPTY,
} from "../calculator/positions";
import { useSubAccountQuery } from "./useSubAccountQuery";

export const useSubAccountDataObserver = (accountId?: string) => {
  const ws = useWSInstance({ accountId });

  const { data: markPrices } = useMarkPricesStream();
  const { data: indexPrices } = useIndexPricesStream();
  const symbolsInfo = useSymbolsInfo();
  const fundingRates = useFundingRatesStore();

  const [holding, setHolding] = useState<API.Holding[]>([]);
  const [positions, setPositions] = useState(
    POSITION_EMPTY as API.PositionsTPSLExt,
  );
  const [portfolio, setportfolio] = useState<Portfolio>();

  // need to get sub account info to calculate portfolio and positions
  const { data: accountInfo } = useSubAccountQuery<API.AccountInfo>(
    "/v1/client/info",
    { accountId },
  );

  const { data: positionsInfo } = useSubAccountQuery<API.PositionInfo>(
    "/v1/positions",
    {
      accountId,
      formatter: (data) => data,
    },
  );

  const { data: holdingRes } = useSubAccountQuery<API.Holding[]>(
    "/v1/client/holding",
    {
      accountId,
      formatter: (data) => data.holding,
    },
  );

  useEffect(() => {
    const portfolio = formatPortfolio({
      holding,
      positions,
      markPrices,
      accountInfo,
      symbolsInfo,
    });
    setportfolio(portfolio!);
  }, [holding, positions, markPrices, accountInfo, symbolsInfo]);

  useEffect(() => {
    if (!positionsInfo) return;

    if (positionsInfo.rows?.length === 0) {
      setPositions(positionsInfo as API.PositionsTPSLExt);
      return;
    }
    const _positionsInfo = calcByPrice(positionsInfo!, markPrices, indexPrices);

    const _positions = formatPositions(
      _positionsInfo!,
      accountInfo,
      symbolsInfo,
      fundingRates,
    );

    setPositions({
      ..._positions,
      rows: _positions.rows.filter(
        (item) =>
          item.position_qty !== 0 ||
          item.pending_long_qty !== 0 ||
          item.pending_short_qty !== 0,
      ),
    });
  }, [
    positionsInfo,
    accountInfo,
    symbolsInfo,
    fundingRates,
    markPrices,
    indexPrices,
  ]);

  useEffect(() => {
    if (holdingRes) {
      setHolding(holdingRes);
    }
  }, [holdingRes]);

  useEffect(() => {
    if (!ws || !accountId) return;

    const unsubscribe = ws.privateSubscribe(
      {
        id: "balance",
        event: "subscribe",
        topic: "balance",
        ts: Date.now(),
      },
      {
        onMessage: (data: any) => {
          const holding = data?.balances ?? ({} as Record<string, any>);

          setHolding((prev) => {
            return prev.map((item) => {
              if (holding[item.token]) {
                return { ...item, holding: holding[item.token].holding };
              }
              return item;
            });
          });
        },
      },
    );

    return () => unsubscribe?.();
  }, [ws, accountId]);

  useEffect(() => {
    if (!accountId) return;
    const key = ["/v1/positions", accountId];
    const unsubscribe = ws?.privateSubscribe("position", {
      onMessage: (data: { positions: WSMessage.Position[] }) => {
        const { positions: nextPositions } = data;

        swr.mutate(
          key,
          (prevPositions: any) => {
            if (!!prevPositions) {
              const newPositions = {
                ...prevPositions,
                rows: prevPositions.rows.map((row: any) => {
                  const itemIndex = nextPositions.findIndex(
                    (item) => item.symbol === row.symbol,
                  );

                  if (itemIndex >= 0) {
                    const itemArr = nextPositions.splice(itemIndex, 1);

                    const item = itemArr[0];

                    // ignore the ws update with averageOpenPrice === 0
                    if (item.averageOpenPrice === 0 && item.positionQty !== 0) {
                      return row;
                    }
                    // console.log("---->>>>>>!!!! item", item);

                    return object2underscore(item);
                  }
                  return row;
                }),
              };

              if (nextPositions.length > 0) {
                newPositions.rows = [
                  ...newPositions.rows,
                  ...nextPositions.map((item) => {
                    return object2underscore(item);
                  }),
                ];
              }

              return newPositions;
            }
          },
          {
            revalidate: false,
          },
        );
      },
    });
    return () => {
      unsubscribe?.();
    };
  }, [ws, accountId]);

  return { portfolio, positions };
};

export function object2underscore(obj: any) {
  return Object.keys(obj).reduce((acc, key) => {
    acc[camelCaseToUnderscoreCase(key)] = obj[key];
    return acc;
  }, {} as any);
}
