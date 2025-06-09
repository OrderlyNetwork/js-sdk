import { useCallback, useEffect, useMemo, useState } from "react";
import { SubAccount, useAccount, useCollateral } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
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
  const { state, subAccount, switchAccount } = useAccount();
  const { t } = useTranslation();
  const [mainAccount, setMainAccount] = useState<MainAccount | undefined>(
    undefined,
  );

  const [subAccounts, setSubAccounts] = useState<SubAccount[]>([]);
  const currentAccountId = state.accountId;

  const _popup = useMemo(
    () => ({
      mode: isMobile ? "sheet" : "modal",
    }),
    [isMobile],
  );
  const mainAccountId = state.mainAccountId;

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
  }, [state.subAccounts, currentAccountId, open]);
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
