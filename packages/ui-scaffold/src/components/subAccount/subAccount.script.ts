import { useCallback, useEffect, useMemo, useState } from "react";
import {
  SubAccount,
  useAccount,
  useCollateral,
  useIndexPricesStream,
} from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { API } from "@orderly.network/types";
import { toast, useScreen } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { useAccountValue } from "./useAccountValue";

export type SubAccountScriptReturn = ReturnType<typeof SubAccountScript>;

type AccountValueInfo = {
  id: string;
  userAddress?: string;
  description?: string;
  holding: API.Holding[];
  accountValue?: number;
};

export const SubAccountScript = () => {
  const [open, setOpen] = useState(false);
  const { data: indexPrices } = useIndexPricesStream();
  const { isMobile } = useScreen();
  const { state, subAccount, switchAccount } = useAccount();
  const { t } = useTranslation();
  const [mainAccount, setMainAccount] = useState<AccountValueInfo | undefined>(
    undefined,
  );
  const mainAccountId = state.mainAccountId;

  const { accountValue } = useAccountValue(mainAccountId);

  const [subAccounts, setSubAccounts] = useState<AccountValueInfo[]>([]);
  const currentAccountId = state.accountId;

  const _popup = useMemo(
    () => ({
      mode: isMobile ? "sheet" : "modal",
    }),
    [isMobile],
  );

  const doCreatSubAccount = useCallback(
    (nickName: string) => {
      return subAccount.create(nickName);
    },
    [subAccount],
  );

  const onSwitch = useCallback(
    (accountId: string) => {
      return switchAccount(accountId)
        .catch((error) => {
          console.error(error);
        })
        .then((res) => {
          toast.success(t("subAccount.modal.switch.success.description"));
        });
    },
    [switchAccount],
  );

  useEffect(() => {
    // current sub account should be the first item
    if (!state.subAccounts || !state.subAccounts.length) {
      setSubAccounts([]);
      return;
    }
    const currentSubAccount = state.subAccounts.find(
      (subAccount) => subAccount.id === currentAccountId,
    );
    let arr = [];
    if (currentSubAccount) {
      arr = [
        currentSubAccount,
        ...state.subAccounts.filter(
          (subAccount) => subAccount.id !== currentAccountId,
        ),
      ];
    } else {
      arr = [...state.subAccounts];
    }
    setSubAccounts(arr);
  }, [state.subAccounts, currentAccountId]);
  useEffect(() => {
    if (!mainAccountId || !state.address) return;

    const _mainAccount = {
      id: mainAccountId!,
      userAddress: state.address,
      holding: mainAccount ? mainAccount.holding : [],
    };
    setMainAccount(_mainAccount);
    subAccount.refresh().then((res) => {
      // if current account is main account, update main account holding from ws hooks
      setMainAccount({
        ..._mainAccount,
        holding: res[mainAccountId],
      });
    });
  }, [mainAccountId, state.address, currentAccountId, open]);

  useEffect(() => {
    const mainAccountUnsettlePnl = accountValue[mainAccountId!] ?? 0;
    if (mainAccount) {
      setMainAccount((prev) => ({
        ...prev!,
        accountValue: calculateAccountValue(
          prev?.holding || [],
          mainAccountUnsettlePnl,
          indexPrices || {},
        ),
      }));
    }
    if (subAccounts.length) {
      setSubAccounts((prev) => {
        return prev.map((subAccount) => {
          const subAccountUnsettlePnl = accountValue[subAccount.id] ?? 0;
          return {
            ...subAccount,
            accountValue: calculateAccountValue(
              subAccount.holding || [],
              subAccountUnsettlePnl,
              indexPrices || {},
            ),
          };
        });
      });
    }
  }, [accountValue, indexPrices]);

  return {
    mainAccount,
    currentAccountId,
    open,
    onOpenChange: setOpen,
    popup: _popup,
    createSubAccount: doCreatSubAccount,
    subAccounts,
    onSwitch,
  };
};

const calculateAccountValue = (
  holdings: API.Holding[],
  unsettlePnl: number,
  indexPrices: Record<string, number>,
) => {
  const holding = holdings.reduce((acc, holding) => {
    const price = getTokenIndexPrice(holding.token, indexPrices);
    if (!price) return acc;
    return acc + new Decimal(holding.holding).times(price).toNumber();
  }, 0);
  return holding + unsettlePnl;
};

const getTokenIndexPrice = (
  token: string,
  indexPrices: Record<string, number>,
) => {
  if (token === "USDC") return 1;
  const symbol = `SPOT_${token}_USDC`;
  return indexPrices[symbol] ?? 0;
};
