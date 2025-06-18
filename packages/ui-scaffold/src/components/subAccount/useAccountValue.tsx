import { useEffect, useMemo, useState } from "react";
import { useSubAccountQuery } from "@orderly.network/hooks";
import { API } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";

export const useAccountValue = (mainAccountId?: string) => {
  const [accountValue, setAccountValue] = useState<Record<string, number>>({});
  const {
    data: newPositions = [],
    isLoading: isPositionLoading,
    mutate: mutatePositions,
  } = useSubAccountQuery<API.PositionExt[]>("/v1/client/aggregate/positions", {
    // formatter: (data) => data,
    errorRetryCount: 3,
    accountId: mainAccountId,
  });

  useEffect(() => {
    if (!newPositions || newPositions.length === 0) {
      setAccountValue({});
      return;
    }
    const value = newPositions.reduce(
      (acc, position) => {
        const accountId = position.account_id!;
        if (acc[accountId]) {
          acc[accountId] = new Decimal(acc[accountId])
            .plus(position.unsettled_pnl)
            .toNumber();
        } else {
          acc[accountId] = new Decimal(position.unsettled_pnl).toNumber();
        }
        return acc;
      },
      {} as Record<string, number>,
    );
    setAccountValue(value);
  }, [newPositions]);
  return {
    accountValue,
  };
};
