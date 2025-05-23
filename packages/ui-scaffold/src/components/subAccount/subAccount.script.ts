import { useCallback, useEffect, useMemo, useState } from "react";
import { SubAccount, useAccount } from "@orderly.network/hooks";
import { toast, useScreen } from "@orderly.network/ui";

export type SubAccountScriptReturn = ReturnType<typeof SubAccountScript>;

export const SubAccountScript = () => {
  const [open, setOpen] = useState(false);
  const { isMobile } = useScreen();
  const { state, account, subAccount, switchAccount, isSubAccount } =
    useAccount();

  const [subAccounts, setSubAccounts] = useState<SubAccount[]>([]);

  const _popup = useMemo(
    () => ({
      mode: isMobile ? "sheet" : "modal",
    }),
    [isMobile],
  );
  const mainAccountId = useMemo(() => {
    return state.mainAccountId;
  }, [state]);

  const userAddress = useMemo(() => {
    return state.address;
  }, [state]);

  const subAccountList = useMemo(() => {
    return state.subAccounts;
  }, [state]);

  const currentAccountId = useMemo(() => {
    return state.accountId;
  }, [state]);

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
          toast.success("Switch account successfully");
        });
    },
    [state],
  );

  useEffect(() => {
    // current sub account should be the first item
    if (!state.subAccounts || !state.subAccounts.length) {
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
    subAccount.refresh().then((res) => {
      console.log("sub account refresh res", res);
    });
  }, []);
  return {
    userAddress,
    mainAccountId,
    currentAccountId,
    open,
    onOpenChange: setOpen,
    popup: _popup,
    createSubAccount: doCreatSubAccount,
    subAccounts,
    onSwitch,
  };
};
