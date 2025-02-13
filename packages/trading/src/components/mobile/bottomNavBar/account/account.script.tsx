import { modal } from "@orderly.network/ui";
import { AccountSheetWidget } from "../../accountSheet";
import { useTradingPageContext } from "../../../../provider/context";
import { useAccount } from "@orderly.network/hooks";
import { AccountState as AccountStateType } from "@orderly.network/core";

interface AccountScriptReturn {
  onShowAccountSheet: () => void;
  address?: string ;
  state: AccountStateType;
}

export const useAccountScript = (): AccountScriptReturn => {
  const { referral, tradingRewards, bottomSheetLeading } =
    useTradingPageContext();
  const { account, state } = useAccount();

  const onShowAccountSheet = () => {
    modal.sheet({
      title: "Account",
      leading: bottomSheetLeading,
      content: <AccountSheetWidget {...referral} {...tradingRewards} />,
    });
  };

  return {
    onShowAccountSheet,
    address: account.address,
    state,
  };
};

export type AccountState = ReturnType<typeof useAccountScript>;
