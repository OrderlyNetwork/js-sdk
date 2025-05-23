import { useCallback, useEffect, useMemo, useState } from "react";
import { SubAccount, useAccount, useCollateral } from "@orderly.network/hooks";
import { API } from "@orderly.network/types";
import { toast, useScreen } from "@orderly.network/ui";

export type SubAccountScriptReturn = ReturnType<typeof SubAccountScript>;

type MainAccount = {
  id: string;
  userAddress: string;
  holding: API.Holding[];
};

export const SubAccountScript = () => {
  const [open, setOpen] = useState(false);
  const { isMobile } = useScreen();
  const { state, account, subAccount, switchAccount, isSubAccount } =
    useAccount();
  const [mainAccount, setMainAccount] = useState<MainAccount | undefined>(
    undefined,
  );

  const [subAccounts, setSubAccounts] = useState<SubAccount[]>([]);

  const _popup = useMemo(
    () => ({
      mode: isMobile ? "sheet" : "modal",
    }),
    [isMobile],
  );
  const mainAccountId = state.mainAccountId;

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
    if (!mainAccountId || !state.address) return;

    const _mainAccount = {
      id: mainAccountId!,
      userAddress: state.address,
      holding: mainAccount ? mainAccount.holding : [],
    };
    setMainAccount(_mainAccount);
    subAccount.refresh().then((res) => {
      // if current account is main account, update main account holding from ws hooks
      if (currentAccountId === mainAccountId) {
        setMainAccount({
          ..._mainAccount,
          holding: res[mainAccountId],
        });
        return;
      }
    });
  }, [mainAccountId, state.address]);

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
