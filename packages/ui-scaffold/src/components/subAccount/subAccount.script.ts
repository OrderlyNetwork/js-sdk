import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount } from "@orderly.network/hooks";
import { useScreen } from "@orderly.network/ui";

export type SubAccountScriptReturn = ReturnType<typeof SubAccountScript>;

export const SubAccountScript = () => {
  const [open, setOpen] = useState(false);
  const { isMobile } = useScreen();
  const { state, account, subAccount, switchAccount, isSubAccount } =
    useAccount();

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
      return switchAccount(accountId);
    },
    [state],
  );

  useEffect(() => {
    console.log("state subaccount", state, state.subAccounts);
  }, [state]);
  return {
    userAddress,
    mainAccountId,
    currentAccountId,
    open,
    onOpenChange: setOpen,
    popup: _popup,
    createSubAccount: doCreatSubAccount,
    subAccountList,
    onSwitch,
  };
};
