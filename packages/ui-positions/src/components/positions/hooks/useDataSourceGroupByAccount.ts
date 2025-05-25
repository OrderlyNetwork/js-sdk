/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { useAccount } from "@orderly.network/hooks";
import type { API } from "@orderly.network/types";
import { formatAddress } from "@orderly.network/ui";

export const useDataSourceGroupByAccount = (data: API.PositionExt[]) => {
  const {
    state: { mainAccountId = "", subAccounts = [] },
    isMainAccount,
  } = useAccount();

  const map = new Map<
    PropertyKey,
    {
      id: string;
      description: string;
      symbol: string;
      children: API.PositionExt[];
    }
  >();

  for (const item of data) {
    const accountId = item.account_id || mainAccountId; // 如果没有 account_id，则视为主账号
    const findSubAccount = subAccounts.find((acc) => acc.id === accountId);
    if (map.has(accountId)) {
      map.get(accountId)?.children?.push(item);
    } else {
      map.set(accountId, {
        id: accountId,
        description: isMainAccount
          ? "Main Account"
          : findSubAccount?.description ||
            formatAddress(findSubAccount?.id!) ||
            "Sub Account",
        symbol: accountId,
        children: [item],
      });
    }
  }
  return {
    expanded: Array.from(map.keys()),
    dataSource: Array.from(map.values()),
  };
};
